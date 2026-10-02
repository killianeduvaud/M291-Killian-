// ---------------------------------------------------------------------------
// Small persisted preferences (letter defaults per profile)
// ---------------------------------------------------------------------------
const prefs = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable: preferences are simply not remembered.
    }
  },
};

// ---------------------------------------------------------------------------
// View switching
// ---------------------------------------------------------------------------
function showView(name) {
  document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
  document.getElementById('view-' + name).classList.remove('hidden');
}

document.querySelectorAll('[data-back]').forEach((btn) => {
  btn.addEventListener('click', () => showView(btn.dataset.back));
});

// ---------------------------------------------------------------------------
// Errors: every failure is shown with a code (DEV-xxx), a name and a hint.
// Codes coming from the main process are defined in src/errors.js.
// ---------------------------------------------------------------------------
function normalizeError(err) {
  if (err && typeof err === 'object' && err.code && err.title) return err;
  return {
    code: 'DEV-900',
    name: 'UNEXPECTED',
    title: 'Erreur inattendue',
    message: 'Une erreur imprévue s\'est produite dans l\'application.',
    hint: 'Réessayez. Si le problème continue, notez le code et les détails techniques.',
    details: String((err && err.message) || err || '').slice(0, 600),
  };
}

function showError(err) {
  const e = normalizeError(err);
  console.error(`[${e.code}] ${e.name}`, e.details);
  document.getElementById('err-title').textContent = e.title;
  document.getElementById('err-message').textContent = e.message;
  document.getElementById('err-hint').textContent = e.hint || '';
  document.getElementById('err-code').textContent = e.code;
  document.getElementById('err-name').textContent = `(${e.name})`;
  document.getElementById('err-details-text').textContent = e.details || '';
  document.getElementById('err-details').classList.toggle('hidden', !e.details);
  document.getElementById('err-details').open = false;
  document.getElementById('error-dialog').dataset.summary = `${e.code} ${e.name} — ${e.title}\n${e.details || ''}`.trim();
  document.getElementById('app').inert = true;
  document.getElementById('error-dialog').classList.remove('hidden');
  document.getElementById('err-close').focus();
}

function closeError() {
  document.getElementById('error-dialog').classList.add('hidden');
  document.getElementById('app').inert = false;
}

document.getElementById('err-close').addEventListener('click', closeError);
document.getElementById('err-copy').addEventListener('click', async () => {
  const btn = document.getElementById('err-copy');
  try {
    await navigator.clipboard.writeText(document.getElementById('error-dialog').dataset.summary);
    btn.textContent = 'Copié ✓';
  } catch {
    btn.textContent = 'Copie impossible';
  }
  setTimeout(() => { btn.textContent = 'Copier le code'; }, 1500);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('error-dialog').classList.contains('hidden')) closeError();
});

// Any error not handled elsewhere (e.g. in a button handler) ends up here.
window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
  showError(e.reason);
});
window.addEventListener('error', (e) => showError(e.error || e.message));

document.getElementById('btn-profiles').addEventListener('click', async () => {
  await renderProfilesList();
  showView('profiles');
});

document.getElementById('btn-new-quote').addEventListener('click', () => {
  quoteInProgress = false;
  showTemplateChooser();
});

document.getElementById('btn-help').addEventListener('click', () => Tutorial.open());
window.api.onShowTutorial(() => Tutorial.open());

// ---------------------------------------------------------------------------
// Profiles list
// ---------------------------------------------------------------------------
async function renderProfilesList() {
  const profiles = await window.api.listProfiles();
  const el = document.getElementById('profiles-list');
  if (profiles.length === 0) {
    el.innerHTML = '<div class="profiles-empty">Aucun profil pour le moment. Créez-en un pour commencer.</div>';
    return;
  }
  el.innerHTML = '';
  profiles.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
      <div class="p-name">${escapeHtml(p.name)}</div>
      <div class="p-meta">${p.hasLogo ? 'Logo enregistré' : 'Sans logo'}</div>
    `;
    card.addEventListener('click', () => openProfileEdit(p.id));
    el.appendChild(card);
  });
}

document.getElementById('btn-add-profile').addEventListener('click', () => openProfileEdit(null));

// ---------------------------------------------------------------------------
// Profile edit
// ---------------------------------------------------------------------------
let editingProfileId = null;
let pendingLogoPath = null;
let pendingRemoveLogo = false;

async function openProfileEdit(id) {
  editingProfileId = id;
  pendingLogoPath = null;
  pendingRemoveLogo = false;

  const form = document.getElementById('profile-form');
  form.reset();
  document.getElementById('p-id').value = id || '';
  document.getElementById('btn-delete-profile').classList.toggle('hidden', !id);
  document.getElementById('profile-edit-title').textContent = id ? 'Modifier le profil' : 'Nouveau profil';
  setLogoPreview(null);

  if (id) {
    const p = await window.api.getProfile(id);
    document.getElementById('p-name').value = p.name || '';
    document.getElementById('p-companyName').value = p.companyName || '';
    document.getElementById('p-phone').value = p.phone || '';
    document.getElementById('p-address1').value = p.address1 || '';
    document.getElementById('p-address2').value = p.address2 || '';
    document.getElementById('p-email').value = p.email || '';
    document.getElementById('p-siret').value = p.siret || '';
    document.getElementById('p-vat').value = p.vat || '';
    document.getElementById('p-vatRate').value = p.vatRate ?? 20;
    document.getElementById('p-currency').value = p.currency || 'EUR';
    document.getElementById('p-bankName').value = p.bankName || '';
    document.getElementById('p-iban').value = p.iban || '';
    document.getElementById('p-bic').value = p.bic || '';
    document.getElementById('p-legalMentions').value = p.legalMentions || '';
    if (p.logoDataUrl) setLogoPreview(p.logoDataUrl);
  } else {
    document.getElementById('p-vatRate').value = 20;
    document.getElementById('p-currency').value = 'EUR';
  }

  showView('profile-edit');
}

function setLogoPreview(dataUrl) {
  const el = document.getElementById('p-logo-preview');
  if (dataUrl) {
    el.innerHTML = `<img src="${dataUrl}">`;
  } else {
    el.innerHTML = 'Aucun logo';
  }
}

document.getElementById('btn-pick-logo').addEventListener('click', async () => {
  const result = await window.api.pickLogo();
  if (!result) return;
  pendingLogoPath = result.filePath;
  pendingRemoveLogo = false;
  setLogoPreview(result.dataUrl);
});

document.getElementById('btn-remove-logo').addEventListener('click', () => {
  pendingLogoPath = null;
  pendingRemoveLogo = true;
  setLogoPreview(null);
});

document.getElementById('btn-save-profile').addEventListener('click', async () => {
  const name = document.getElementById('p-name').value.trim();
  if (!name) {
    document.getElementById('p-name').focus();
    return;
  }
  const profile = {
    id: editingProfileId || undefined,
    name,
    companyName: document.getElementById('p-companyName').value.trim(),
    phone: document.getElementById('p-phone').value.trim(),
    address1: document.getElementById('p-address1').value.trim(),
    address2: document.getElementById('p-address2').value.trim(),
    email: document.getElementById('p-email').value.trim(),
    siret: document.getElementById('p-siret').value.trim(),
    vat: document.getElementById('p-vat').value.trim(),
    vatRate: parseFloat(document.getElementById('p-vatRate').value) || 0,
    currency: document.getElementById('p-currency').value,
    bankName: document.getElementById('p-bankName').value.trim(),
    iban: document.getElementById('p-iban').value.trim(),
    bic: document.getElementById('p-bic').value.trim(),
    legalMentions: document.getElementById('p-legalMentions').value.trim(),
    newLogoPath: pendingLogoPath,
    removeLogo: pendingRemoveLogo,
  };
  await window.api.saveProfile(profile);
  await renderProfilesList();
  showView('profiles');
});

document.getElementById('btn-delete-profile').addEventListener('click', async () => {
  if (!editingProfileId) return;
  if (!confirm('Supprimer définitivement ce profil ?')) return;
  await window.api.deleteProfile(editingProfileId);
  await renderProfilesList();
  showView('profiles');
});

// ---------------------------------------------------------------------------
// Quote templates
// ---------------------------------------------------------------------------
const TEMPLATES = {
  classique: { name: 'Classique', infoLabel: 'Informations additionnelles' },
  lettre: { name: 'Lettre', infoLabel: 'Autres informations — une par ligne, affichées en liste' },
  travaux: { name: 'Travaux', infoLabel: 'Commentaires' },
};

let currentTemplate = 'classique';
// True while a quote is being filled in: changing the model keeps the data.
let quoteInProgress = false;

function setTemplate(name) {
  currentTemplate = TEMPLATES[name] ? name : 'classique';
  document.querySelectorAll('[data-only]').forEach((el) => {
    el.classList.toggle('hidden', !el.dataset.only.split(' ').includes(currentTemplate));
  });
  document.getElementById('q-additionalInfo-label').textContent = TEMPLATES[currentTemplate].infoLabel;
  document.getElementById('r-template').textContent = TEMPLATES[currentTemplate].name;
  if (!document.getElementById('validation-box').classList.contains('hidden')) showValidation(validateQuote());
}

// Choose-template screen ------------------------------------------------------
const A4_WIDTH_PX = 794; // 210 mm at 96 dpi
const PREVIEW_STYLE = '<style>html{overflow:hidden;background:#fff}body{margin:0!important;padding:13mm 16mm!important}</style>';
let previewsLoaded = false;

function scalePreview(container) {
  const iframe = container.querySelector('iframe');
  iframe.style.transform = `scale(${container.clientWidth / A4_WIDTH_PX})`;
}

const previewResizeObserver = new ResizeObserver((entries) => entries.forEach((e) => scalePreview(e.target)));

async function loadTemplatePreviews() {
  if (previewsLoaded) return;
  previewsLoaded = true;
  for (const card of document.querySelectorAll('.model-card')) {
    const container = card.querySelector('.model-preview');
    previewResizeObserver.observe(container);
    try {
      const html = await window.api.previewTemplate(card.dataset.template);
      container.querySelector('iframe').srcdoc = html.replace('</head>', `${PREVIEW_STYLE}</head>`);
    } catch (err) {
      container.classList.add('preview-error');
      container.dataset.message = `Aperçu indisponible (${normalizeError(err).code})`;
    }
  }
}

function showTemplateChooser() {
  document.querySelectorAll('.model-card').forEach((card) => {
    card.classList.toggle('selected', quoteInProgress && card.dataset.template === currentTemplate);
  });
  showView('choose-template');
  loadTemplatePreviews();
}

async function chooseTemplate(name) {
  if (quoteInProgress) {
    setTemplate(name);
  } else {
    await openNewQuoteView(name);
    quoteInProgress = true;
  }
  showView('new-quote');
}

document.querySelectorAll('.model-card').forEach((card) => {
  card.addEventListener('click', () => chooseTemplate(card.dataset.template));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      chooseTemplate(card.dataset.template);
    }
  });
});

document.getElementById('btn-change-template').addEventListener('click', showTemplateChooser);

// ---------------------------------------------------------------------------
// New quote
// ---------------------------------------------------------------------------
let quoteLines = [];
let profilesCache = [];
let currentCurrency = 'EUR';
let quoteTitleEdited = false;
let introEdited = false;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function addDaysISO(iso, days) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function newItem() {
  return { type: 'item', description: '', unit: '', quantity: 1, unitPrice: 0, vatRate: '' };
}

function defaultQuoteTitle() {
  return `Devis_${document.getElementById('q-quoteNumber').value.trim()}`;
}

function defaultIntro() {
  const date = formatDateDots(document.getElementById('q-issueDate').value);
  return `À la suite de notre échange du ${date}, nous nous permettons de vous transmettre notre devis concernant le projet mentionné ci-dessus.`;
}

// "1003 Lausanne" / "CH-1003 Lausanne" -> "Lausanne"
function cityFromAddress(line) {
  return String(line || '').replace(/^\s*(?:[A-Z]{1,2}-)?\d{4,5}\s*/i, '').trim();
}

function letterPrefsKey(profileId) {
  return `devis.letter.${profileId}`;
}

async function openNewQuoteView(template) {
  profilesCache = await window.api.listProfiles();
  const select = document.getElementById('q-profileId');
  select.innerHTML = profilesCache.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');

  const nums = await window.api.peekNextNumbers();
  document.getElementById('q-clientNumber').value = nums.nextClientNumber;
  document.getElementById('q-quoteNumber').value = nums.nextQuoteNumber;

  const today = todayISO();
  document.getElementById('q-issueDate').value = today;
  document.getElementById('q-validityDate').value = addDaysISO(today, 30);

  document.getElementById('q-clientName').value = '';
  document.getElementById('q-clientContact').value = '';
  document.getElementById('q-clientAddress1').value = '';
  document.getElementById('q-clientAddress2').value = '';
  document.getElementById('q-additionalInfo').value = '';
  document.getElementById('q-discountType').value = 'none';
  document.getElementById('q-discountValue').value = 0;
  document.getElementById('q-depositPercent').value = 0;
  document.getElementById('q-workStart').value = '';
  document.getElementById('q-workDuration').value = '';
  document.getElementById('q-paymentTerms').value = '';
  document.getElementById('q-salutation').selectedIndex = 0;
  document.getElementById('generate-status').textContent = '';

  quoteTitleEdited = false;
  introEdited = false;
  document.getElementById('q-quoteTitle').value = defaultQuoteTitle();
  document.getElementById('q-intro').value = defaultIntro();

  hideValidation();
  setTemplate(template);

  quoteLines = [newItem()];

  if (profilesCache.length > 0) {
    await applyProfileDefaults(profilesCache[0].id);
  }
  renderLines();
  recompute();
}

async function applyProfileDefaults(profileId) {
  if (!profileId) return;
  const p = await window.api.getProfile(profileId);
  document.getElementById('q-vatRate').value = p.vatRate ?? 20;
  currentCurrency = p.currency || 'EUR';

  const letter = prefs.get(letterPrefsKey(profileId)) || {};
  document.getElementById('q-managers').value = letter.managers || '';
  document.getElementById('q-signatories').value = letter.signatories || '';
  document.getElementById('q-place').value = letter.place || cityFromAddress(p.address2);
}

document.getElementById('q-profileId').addEventListener('change', (e) => {
  applyProfileDefaults(e.target.value).then(() => {
    renderLines();
    recompute();
  });
});

document.getElementById('q-quoteNumber').addEventListener('input', () => {
  if (!quoteTitleEdited) document.getElementById('q-quoteTitle').value = defaultQuoteTitle();
});
document.getElementById('q-quoteTitle').addEventListener('input', () => {
  quoteTitleEdited = true;
});
document.getElementById('q-issueDate').addEventListener('input', () => {
  if (!introEdited) document.getElementById('q-intro').value = defaultIntro();
});
document.getElementById('q-intro').addEventListener('input', () => {
  introEdited = true;
});

function renderLines() {
  const tbody = document.getElementById('lines-body');
  const defaultRate = document.getElementById('q-vatRate').value;
  tbody.innerHTML = '';
  quoteLines.forEach((line, i) => {
    const tr = document.createElement('tr');
    const delCell = `<td class="w-del">${quoteLines.length > 1 ? '<button type="button" class="btn-remove-line" title="Supprimer">&times;</button>' : ''}</td>`;
    if (line.type === 'section') {
      tr.className = 'section-row';
      tr.innerHTML = `
        <td colspan="6"><input type="text" data-field="title" placeholder="Titre de la section (ex. Salle de bain)"></td>
        ${delCell}
      `;
      tr.querySelector('[data-field="title"]').value = line.title;
    } else {
      tr.innerHTML = `
        <td><input type="text" data-field="description" placeholder="Nom du produit / service"></td>
        <td class="w-qty"><input type="number" data-field="quantity" min="0" step="any"></td>
        <td class="w-unit"><input type="text" data-field="unit" list="unit-options" placeholder="h"></td>
        <td class="w-price"><input type="number" data-field="unitPrice" min="0" step="0.01"></td>
        <td class="w-vat"><input type="number" data-field="vatRate" min="0" step="0.1"></td>
        <td class="w-total total-cell" data-role="line-total">0,00</td>
        ${delCell}
      `;
      tr.querySelector('[data-field="description"]').value = line.description;
      tr.querySelector('[data-field="quantity"]').value = line.quantity;
      tr.querySelector('[data-field="unit"]').value = line.unit;
      tr.querySelector('[data-field="unitPrice"]').value = line.unitPrice;
      const vatInput = tr.querySelector('[data-field="vatRate"]');
      vatInput.value = line.vatRate;
      vatInput.placeholder = defaultRate;
    }

    tr.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.dataset.field;
        if (field === 'quantity' || field === 'unitPrice') {
          quoteLines[i][field] = parseFloat(input.value) || 0;
        } else {
          quoteLines[i][field] = field === 'vatRate' ? input.value.trim() : input.value;
        }
        recompute();
      });
    });
    const delBtn = tr.querySelector('.btn-remove-line');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        quoteLines.splice(i, 1);
        renderLines();
        recompute();
      });
    }
    tbody.appendChild(tr);
  });
}

function addLine(line) {
  quoteLines.push(line);
  renderLines();
  recompute();
  const inputs = document.querySelectorAll('#lines-body tr:last-child input');
  if (inputs[0]) inputs[0].focus();
}

document.getElementById('btn-add-line').addEventListener('click', () => addLine(newItem()));
document.getElementById('btn-add-section').addEventListener('click', () => addLine({ type: 'section', title: '' }));

['q-discountType', 'q-discountValue', 'q-vatRate', 'q-depositPercent'].forEach((id) => {
  document.getElementById(id).addEventListener('input', recompute);
});
document.getElementById('q-vatRate').addEventListener('input', (e) => {
  document.querySelectorAll('#lines-body [data-field="vatRate"]').forEach((input) => {
    input.placeholder = e.target.value;
  });
});

let lastComputed = null;

function computeCurrentQuote() {
  return computeQuote({
    lines: quoteLines,
    discountType: document.getElementById('q-discountType').value,
    discountValue: parseFloat(document.getElementById('q-discountValue').value) || 0,
    vatRate: parseFloat(document.getElementById('q-vatRate').value) || 0,
    depositPercent: parseFloat(document.getElementById('q-depositPercent').value) || 0,
    roundVatTo5Cents: currentCurrency === 'CHF',
  });
}

function recompute() {
  const result = computeCurrentQuote();
  lastComputed = result;
  const money = (n) => formatMoney(n, currentCurrency);

  const rows = document.querySelectorAll('#lines-body tr');
  result.computedLines.forEach((l, i) => {
    const cell = rows[i] && rows[i].querySelector('[data-role="line-total"]');
    if (cell) cell.textContent = money(l.subtotal);
  });

  document.getElementById('r-subtotal').textContent = money(result.subtotalHT);
  document.getElementById('r-discount').textContent = money(result.discountAmount);
  document.getElementById('r-nethtc').textContent = money(result.netHT);
  document.getElementById('r-vat').textContent = money(result.totalVAT);
  document.getElementById('r-ttc').textContent = money(result.totalTTC);
  document.getElementById('r-deposit').textContent = money(result.depositAmount);
  document.getElementById('r-balance').textContent = money(result.balanceAmount);
  document.getElementById('q-balancePercent').value = result.balancePercent;
}

// ---------------------------------------------------------------------------
// Data sent to the Word / PDF generators
// ---------------------------------------------------------------------------
function textLines(text) {
  return String(text || '').split('\n').map((s) => s.trim()).filter(Boolean);
}

// "1.5h" for a one-letter unit (Lettre model), "2 pièces" otherwise
function quantityWithUnit(qty, unit, cur) {
  const n = formatNumber(qty, cur);
  if (!unit) return n;
  return /^\p{L}$/u.test(unit) ? `${n}${unit}` : `${n} ${unit}`;
}

// The unit says what is counted (h, pièce, m²…); a bare number is a typo.
function isNumericUnit(unit) {
  return /^[\d\s.,]+$/.test(String(unit || '').trim());
}

function sanitizeFileName(name) {
  return String(name || '').replace(/[/\\:*?"<>|]+/g, '-').trim();
}

function buildQuoteData(profile, r) {
  const cur = currentCurrency;
  const money = (n) => formatMoney(n, cur);
  const amount = (n) => formatAmount(n, cur);
  const pct = (n) => `${formatNumber(n, cur)} %`;
  const val = (id) => document.getElementById(id).value.trim();

  const issueISO = document.getElementById('q-issueDate').value;
  const quoteNumber = val('q-quoteNumber');
  const additionalInfo = val('q-additionalInfo');
  const items = r.computedLines.filter((l) => l.type !== 'section');
  const sections = r.computedLines.filter((l) => l.type === 'section' && l.title.trim());
  const hasDiscount = r.discountAmount > 0;
  const discountType = document.getElementById('q-discountType').value;
  const discountLabel = discountType === 'percent'
    ? `Remise (${pct(parseFloat(document.getElementById('q-discountValue').value) || 0)})`
    : 'Remise';

  // Classic template: sections become description-only rows
  const classicLines = r.computedLines
    .filter((l) => l.type !== 'section' || l.title.trim())
    .map((l) => (l.type === 'section'
      ? { isSection: true, description: l.title.trim(), quantity: '', unit: '', unitPriceHT: '', vatRatePct: '', lineVatAmount: '', lineTotalTTC: '' }
      : {
        description: l.description,
        quantity: formatNumber(l.qty, cur),
        unit: l.unit,
        unitPriceHT: money(l.price),
        vatRatePct: pct(l.rate),
        lineVatAmount: money(l.vatAmount),
        lineTotalTTC: money(l.totalTTC),
      }));

  // Lettre / Travaux templates: sections and items in one list
  let sectionNo = 0;
  const rows = [];
  r.computedLines.forEach((l) => {
    if (l.type === 'section') {
      if (!l.title.trim()) return;
      sectionNo += 1;
      rows.push({ isSection: true, title: currentTemplate === 'travaux' ? `${sectionNo}. ${l.title.trim()}` : l.title.trim() });
      return;
    }
    rows.push({
      isSection: false,
      description: l.description,
      qty: formatNumber(l.qty, cur),
      unit: l.unit,
      qtyUnit: quantityWithUnit(l.qty, l.unit, cur),
      unitPrice: currentTemplate === 'travaux' ? amount(l.price) : money(l.price),
      vatRatePct: pct(l.rate),
      totalHT: currentTemplate === 'travaux' ? amount(l.subtotal) : money(l.subtotal),
    });
  });
  if (currentTemplate === 'travaux' && hasDiscount) {
    rows.push({ isSection: false, description: discountLabel, qty: '', unit: '', unitPrice: '', vatRatePct: '', totalHT: `-${amount(r.discountAmount)}` });
  }
  // Travaux alternates white / grey rows
  rows.forEach((row, i) => {
    const grey = i % 2 === 1;
    row.secWhite = row.isSection && !grey;
    row.secGrey = row.isSection && grey;
    row.itemWhite = !row.isSection && !grey;
    row.itemGrey = !row.isSection && grey;
  });

  // Total quantity, shown only when all lines share the same unit ("14.5h")
  const units = [...new Set(items.map((l) => l.unit.trim()))];
  const totalQty = units.length === 1 && units[0]
    ? quantityWithUnit(items.reduce((s, l) => s + l.qty, 0), units[0], cur)
    : '';

  const vatRows = (r.vatBreakdown.length ? r.vatBreakdown : [{ rate: r.vatRate, vat: 0 }]).map((g) => ({
    label: cur === 'CHF' ? 'TVA arrondie au 0,05 cts' : 'TVA',
    rate: pct(g.rate),
    amount: money(g.vat),
  }));

  // Travaux: 3 VAT slots; extra rates are merged into the last one
  const vatSlots = r.vatBreakdown.slice(0, 2);
  if (r.vatBreakdown.length > 2) {
    const rest = r.vatBreakdown.slice(2);
    vatSlots.push({
      rateLabel: rest.map((g) => pct(g.rate)).join(' / '),
      baseHT: rest.reduce((s, g) => s + g.baseHT, 0),
      vat: rest.reduce((s, g) => s + g.vat, 0),
      ttc: rest.reduce((s, g) => s + g.ttc, 0),
    });
  }
  const vatSlotData = {};
  for (let k = 1; k <= 3; k++) {
    const g = vatSlots[k - 1];
    vatSlotData[`vat${k}Base`] = g ? money(g.baseHT) : '';
    vatSlotData[`vat${k}Rate`] = g ? (g.rateLabel || pct(g.rate)) : '';
    vatSlotData[`vat${k}Amount`] = g ? money(g.vat) : '';
    vatSlotData[`vat${k}Ttc`] = g ? money(g.ttc) : '';
  }

  const managers = textLines(val('q-managers')).map((s) => `- ${s}`);
  const signatories = textLines(val('q-signatories')).slice(0, 2);
  const salutation = document.getElementById('q-salutation').value;
  const place = val('q-place');
  const otherInfoLines = textLines(additionalInfo);

  const paymentTerms = val('q-paymentTerms') || (r.depositPercent > 0
    ? `Acompte de ${formatNumber(r.depositPercent, cur)} % à la commande, soit ${money(r.depositAmount)}. `
      + `Solde de ${formatNumber(r.balancePercent, cur)} % (${money(r.balanceAmount)}) à la fin des travaux.`
    : '');
  const bankLines = [
    profile.bankName && `Banque : ${profile.bankName}`,
    profile.iban && `IBAN : ${profile.iban}`,
    profile.bic && `BIC : ${profile.bic}`,
  ].filter(Boolean);
  const paymentBlock = [paymentTerms, bankLines.length ? ['Coordonnées bancaires :', ...bankLines].join('\n') : '']
    .filter(Boolean)
    .join('\n\n');
  const legalFooter = [
    [profile.siret && `SIRET : ${profile.siret}`, profile.vat && `TVA intracom. : ${profile.vat}`].filter(Boolean).join('  —  '),
    profile.legalMentions || '',
  ].filter(Boolean).join('\n');

  const sellerName = profile.companyName || profile.name;
  const quoteTitle = val('q-quoteTitle') || defaultQuoteTitle();

  return {
    template: currentTemplate,
    currency: cur,
    fileName: sanitizeFileName(currentTemplate === 'lettre' ? quoteTitle : `Devis-${quoteNumber || 'nouveau'}`),

    sellerName,
    sellerAddress1: profile.address1 || '',
    sellerAddress2: profile.address2 || '',
    sellerPhone: profile.phone || '',
    sellerEmail: profile.email || '',
    sellerSiret: profile.siret || '',
    sellerVat: profile.vat || '',
    sellerBankName: profile.bankName || '',
    sellerIban: profile.iban || '',
    sellerBic: profile.bic || '',
    sellerHeaderLine: [sellerName, profile.address1, profile.address2].filter(Boolean).join(' / '),

    clientName: val('q-clientName'),
    clientContact: val('q-clientContact'),
    clientAddress1: val('q-clientAddress1'),
    clientAddress2: val('q-clientAddress2'),
    clientNumber: val('q-clientNumber'),
    clientBlock: [val('q-clientName'), val('q-clientContact'), val('q-clientAddress1'), val('q-clientAddress2')]
      .filter(Boolean)
      .join('\n'),

    quoteNumber,
    quoteTitle,
    additionalInfo,
    issueDate: formatDateFR(issueISO),
    validityDate: formatDateFR(document.getElementById('q-validityDate').value),
    legalMentions: profile.legalMentions || '',

    lines: classicLines,
    rows,
    hasSections: sections.length > 0,

    totalHT: money(r.subtotalHT),
    hasDiscount,
    discountLabel,
    discountAmount: money(r.discountAmount),
    netHT: money(r.netHT),
    vatRows,
    ...vatSlotData,
    totalVAT: money(r.totalVAT),
    totalTTC: money(r.totalTTC),
    netToPay: money(r.totalTTC),
    totalQty,
    hasDeposit: r.depositPercent > 0,
    depositPercent: formatNumber(r.depositPercent, cur),
    depositAmount: money(r.depositAmount),
    balancePercent: formatNumber(r.balancePercent, cur),
    balanceAmount: money(r.balanceAmount),

    // Lettre
    managerLine1: managers[0] || '',
    managerLine2: managers[1] || '',
    managerLine3: managers[2] || '',
    managerLine4: managers[3] || '',
    managerLinesRest: managers.length > 4 ? `\n${managers.slice(4).join('\n')}` : '',
    managers,
    placeDate: place ? `${place}, le ${formatDateDots(issueISO)}` : `Le ${formatDateDots(issueISO)}`,
    salutation,
    salutationName: salutation.replace(/,\s*$/, ''),
    introText: val('q-intro'),
    hasOtherInfo: otherInfoLines.length > 0,
    otherInfoLines,
    signatories,
    sigName1: signatories[0] || '',
    sigName2: signatories[1] || '',
    sigLine1: signatories[0] ? '______________________' : '',
    sigLine2: signatories[1] ? '______________________' : '',

    // Travaux
    workStart: formatDateFR(document.getElementById('q-workStart').value),
    workDuration: val('q-workDuration'),
    paymentBlock,
    comments: additionalInfo,
    hasLegalFooter: !!legalFooter,
    legalFooter,
  };
}

// ---------------------------------------------------------------------------
// Required fields, checked before generating
// ---------------------------------------------------------------------------
const REQUIRED_FIELDS = [
  { id: 'q-profileId', label: 'Profil d\'entreprise' },
  { id: 'q-clientName', label: 'Nom du client' },
  { id: 'q-quoteNumber', label: 'Numéro de devis' },
  { id: 'q-issueDate', label: 'Date d\'émission' },
  { id: 'q-validityDate', label: 'Date de validité' },
  { id: 'q-quoteTitle', label: 'Titre du devis', only: 'lettre' },
];

// Returns [{ id, message }] for every missing or invalid entry.
function validateQuote() {
  const problems = [];
  REQUIRED_FIELDS.forEach((f) => {
    if (f.only && f.only !== currentTemplate) return;
    if (!document.getElementById(f.id).value.trim()) {
      problems.push({ id: f.id, message: f.id === 'q-profileId' && profilesCache.length === 0
        ? 'Profil d\'entreprise : créez-en un d\'abord dans « Profils d\'entreprise »'
        : f.label });
    }
  });

  const issue = document.getElementById('q-issueDate').value;
  const validity = document.getElementById('q-validityDate').value;
  if (issue && validity && validity < issue) {
    problems.push({ id: 'q-validityDate', message: 'La date de validité est avant la date d\'émission' });
  }

  let itemNo = 0;
  let hasItem = false;
  quoteLines.forEach((line, i) => {
    if (line.type === 'section') return;
    itemNo += 1;
    hasItem = true;
    if (!line.description.trim()) {
      problems.push({ id: `line-${i}`, message: `Ligne ${itemNo} : description manquante (ou supprimez la ligne)` });
    }
    if (isNumericUnit(line.unit)) {
      problems.push({ id: `unit-${i}`, message: `Ligne ${itemNo} : l'unité doit être un mot (h, pièce, m²…), pas un nombre — ou laissez-la vide` });
    }
  });
  if (!hasItem) problems.push({ id: 'btn-add-line', message: 'Au moins un produit ou service' });

  return problems;
}

function fieldElement(id) {
  const m = /^(line|unit)-(\d+)$/.exec(id);
  if (m) {
    const row = document.querySelectorAll('#lines-body tr')[Number(m[2])];
    return row && row.querySelector(m[1] === 'unit' ? '[data-field="unit"]' : '[data-field="description"]');
  }
  return document.getElementById(id);
}

function hideValidation() {
  document.getElementById('validation-box').classList.add('hidden');
  document.querySelectorAll('#quote-form .invalid').forEach((el) => el.classList.remove('invalid'));
}

function showValidation(problems) {
  document.querySelectorAll('#quote-form .invalid').forEach((el) => el.classList.remove('invalid'));
  const box = document.getElementById('validation-box');
  if (problems.length === 0) {
    box.classList.add('hidden');
    return;
  }
  box.innerHTML = `
    <strong>À corriger avant de générer :</strong>
    <ul>${problems.map((p) => `<li><button type="button" data-target="${p.id}">${escapeHtml(p.message)}</button></li>`).join('')}</ul>
  `;
  box.querySelectorAll('[data-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const el = fieldElement(btn.dataset.target);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus({ preventScroll: true });
    });
  });
  problems.forEach((p) => {
    const el = fieldElement(p.id);
    if (el && el.id !== 'btn-add-line') el.classList.add('invalid');
  });
  box.classList.remove('hidden');
}

// Once the list is shown, it updates live as the fields are filled in.
document.getElementById('quote-form').addEventListener('input', () => {
  if (!document.getElementById('validation-box').classList.contains('hidden')) showValidation(validateQuote());
});

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------
document.getElementById('btn-generate').addEventListener('click', async () => {
  const statusEl = document.getElementById('generate-status');
  statusEl.textContent = '';

  const problems = validateQuote();
  showValidation(problems);
  if (problems.length > 0) {
    const first = fieldElement(problems[0].id);
    if (first) {
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first.focus({ preventScroll: true });
    }
    return;
  }

  const profileId = document.getElementById('q-profileId').value;
  const quoteNumber = document.getElementById('q-quoteNumber').value.trim();
  const clientNumber = document.getElementById('q-clientNumber').value.trim();
  const format = document.querySelector('input[name="format"]:checked').value;
  const btn = document.getElementById('btn-generate');

  btn.disabled = true;
  statusEl.textContent = 'Génération en cours…';
  try {
    const profile = await window.api.getProfile(profileId);
    const logoPath = await window.api.getLogoPath(profileId);
    const r = lastComputed || computeCurrentQuote();
    const data = buildQuoteData(profile, r);
    const result = await window.api.generateAndSave({
      format, data, quoteNumber, clientNumber, logoPath, fileName: data.fileName,
    });
    if (result.canceled) {
      statusEl.textContent = '';
    } else {
      statusEl.textContent = 'Devis enregistré ✓';
      if (currentTemplate === 'lettre') {
        prefs.set(letterPrefsKey(profileId), {
          managers: document.getElementById('q-managers').value,
          signatories: document.getElementById('q-signatories').value,
          place: document.getElementById('q-place').value,
        });
      }
    }
  } catch (err) {
    statusEl.textContent = '';
    showError(err);
  } finally {
    btn.disabled = false;
  }
});

// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// First launch: show the tutorial
if (!Tutorial.isDone()) Tutorial.open();
