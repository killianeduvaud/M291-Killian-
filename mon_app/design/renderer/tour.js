// ---------------------------------------------------------------------------
// Guided tour: darkens the app, outlines the element to use and explains it
// in a speech bubble. It walks through the real screens, from creating a
// company profile to generating a quote. It can be skipped at any time.
//
// Steps with `click: true` also move on when the outlined element is clicked.
// Navigation relies on app.js (showView, renderProfilesList, openProfileEdit,
// showTemplateChooser, chooseTemplate, quoteInProgress).
// ---------------------------------------------------------------------------
const Tour = (() => {
  const STEPS = [
    {
      view: 'home', target: '#btn-profiles', click: true,
      title: 'Créez d\'abord votre profil',
      text: 'Votre profil d\'entreprise contient vos coordonnées, votre logo et votre banque. Il est repris sur chaque devis. Cliquez sur « Profils d\'entreprise ».',
    },
    {
      view: 'profiles', target: '#btn-add-profile', click: true,
      title: 'Ajoutez un profil',
      text: 'Cliquez sur « + Nouveau profil ». Les profils déjà créés s\'affichent sur cette page : un clic dessus permet de les modifier.',
    },
    {
      view: 'profile-edit', target: '#psec-identity',
      title: 'Nom et logo',
      text: 'Le nom sert à retrouver le profil dans l\'application. Avec « Choisir un logo… », ajoutez votre logo : il apparaîtra en haut de vos devis.',
    },
    {
      view: 'profile-edit', target: '#psec-contact',
      title: 'Vos coordonnées',
      text: 'Raison sociale, adresse, téléphone et e-mail sont imprimés sur chaque devis.',
    },
    {
      view: 'profile-edit', target: '#psec-legal',
      title: 'TVA et devise',
      text: 'Indiquez votre numéro SIRET ou IDE, votre taux de TVA habituel et la devise : € ou CHF (en CHF, la TVA est arrondie à 0.05).',
    },
    {
      view: 'profile-edit', target: '#psec-bank',
      title: 'Banque et mentions',
      text: 'Votre IBAN et vos mentions légales s\'affichent en bas du devis.',
    },
    {
      view: 'profile-edit', target: '#btn-save-profile',
      title: 'Enregistrez',
      text: 'Une fois le profil rempli, cliquez sur « Enregistrer ». Vous pouvez aussi continuer la visite avec « Suivant » et le remplir plus tard.',
    },
    {
      view: 'home', target: '#btn-new-quote', click: true,
      title: 'Créez un devis',
      text: 'De retour à l\'accueil, cliquez sur « Nouveau devis ».',
    },
    {
      view: 'choose-template', target: '#model-grid',
      title: 'Les modèles',
      text: 'Chaque carte montre un aperçu réel du résultat : Classique, Lettre ou Travaux. Le modèle définit la mise en page et les champs à remplir.',
    },
    {
      view: 'choose-template', target: '.model-card[data-template="classique"]', click: true,
      title: 'Choisissez un modèle',
      text: 'Cliquez sur un modèle pour ouvrir le formulaire. Pour la visite, prenez « Classique ».',
    },
    {
      view: 'new-quote', target: '#sec-company',
      title: 'Le profil qui émet le devis',
      text: 'Choisissez le profil d\'entreprise. Partout dans le formulaire, l\'astérisque rouge * signale un champ obligatoire.',
    },
    {
      view: 'new-quote', target: '#sec-client',
      title: 'Le client',
      text: 'Le nom du client est obligatoire ; l\'adresse est conseillée. Le numéro client est proposé automatiquement.',
    },
    {
      view: 'new-quote', target: '#sec-quote',
      title: 'Les informations du devis',
      text: 'Numéro, dates et taux de TVA sont déjà pré-remplis : modifiez-les seulement si besoin.',
    },
    {
      view: 'new-quote', target: '#lines-table',
      title: 'Produits et services',
      text: 'Une ligne par prestation : description, quantité, unité (h, pièce, m²…) et prix HT. Laissez la TVA vide pour garder le taux par défaut.',
    },
    {
      view: 'new-quote', target: ['#btn-add-line', '#btn-add-section'],
      title: 'Ajoutez des lignes',
      text: '« + Ajouter une ligne » pour une nouvelle prestation, « + Ajouter une section » pour les regrouper (ex. Cuisine, Salle de bain).',
    },
    {
      view: 'new-quote', target: '#sec-payment',
      title: 'Remise et acompte',
      text: 'Ajoutez si besoin une remise (en % ou en montant) et l\'acompte demandé à la commande.',
    },
    {
      view: 'new-quote', target: '#recap-totals',
      title: 'Le récapitulatif',
      text: 'Les totaux, la TVA et l\'acompte se calculent en direct pendant que vous remplissez.',
    },
    {
      view: 'new-quote', target: '#recap-options',
      title: 'Modèle et format',
      text: '« Changer » permet d\'essayer un autre modèle sans perdre ce que vous avez saisi. Choisissez ensuite PDF ou Word.',
    },
    {
      view: 'new-quote', target: '#btn-generate',
      title: 'Générez le devis',
      text: 'L\'application vérifie qu\'il ne manque rien, puis vous demande où enregistrer le fichier. Vous pouvez revoir ce tutoriel depuis l\'accueil.',
    },
  ];

  const PAD = 8; // space between the element and the outline
  const GAP = 16; // space between the outline and the bubble
  const MARGIN = 12; // minimum distance from the window edges

  const el = (id) => document.getElementById(id);
  const root = el('tour');
  const hole = el('tour-hole');
  const bubble = el('tour-bubble');
  const arrow = el('tour-arrow');
  const blockers = root.querySelectorAll('.tour-blocker');

  let index = -1;
  let active = false;
  let frame = 0;
  let navToken = 0;

  const viewVisible = (name) => !el(`view-${name}`).classList.contains('hidden');

  async function waitFor(condition, ms) {
    const end = Date.now() + ms;
    while (!condition() && Date.now() < end) await new Promise((r) => setTimeout(r, 50));
  }

  // Shows the screen a step needs, using the app's own navigation.
  async function openView(name, afterClick) {
    if (viewVisible(name)) return;
    if (afterClick) {
      // The click already triggered the app's navigation: let it finish.
      await waitFor(() => viewVisible(name), 1500);
      if (viewVisible(name)) return;
    }
    switch (name) {
      case 'home':
        showView('home');
        break;
      case 'profiles':
        await renderProfilesList();
        showView('profiles');
        break;
      case 'profile-edit':
        await openProfileEdit(null);
        break;
      case 'choose-template':
        quoteInProgress = false;
        showTemplateChooser();
        break;
      case 'new-quote':
        quoteInProgress = false;
        await chooseTemplate('classique');
        break;
      default:
        break;
    }
  }

  function targetElements(step) {
    return [].concat(step.target).flatMap((sel) => [...document.querySelectorAll(sel)]);
  }

  // Union of the visible targets, clipped to the window; null if none visible.
  function targetRect(step) {
    let r = null;
    targetElements(step).forEach((node) => {
      const b = node.getBoundingClientRect();
      if (!b.width && !b.height) return;
      r = r
        ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom) }
        : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    });
    if (!r) return null;
    const W = window.innerWidth;
    const H = window.innerHeight;
    return {
      left: Math.max(4, r.left - PAD),
      top: Math.max(4, r.top - PAD),
      right: Math.min(W - 4, r.right + PAD),
      bottom: Math.min(H - 4, r.bottom + PAD),
    };
  }

  function place(node, left, top, width, height) {
    node.style.left = `${left}px`;
    node.style.top = `${top}px`;
    node.style.width = `${Math.max(0, width)}px`;
    node.style.height = `${Math.max(0, height)}px`;
  }

  // Runs every frame while the tour is open, so the outline follows scrolling
  // and window resizing.
  function layout() {
    if (!active) return;
    frame = requestAnimationFrame(layout);
    const step = STEPS[index];
    if (!step) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const r = targetRect(step);
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;

    if (!r) {
      // Target not on screen: dim everything and centre the bubble.
      place(hole, W / 2, H / 2, 0, 0);
      place(blockers[0], 0, 0, W, H);
      [1, 2, 3].forEach((i) => place(blockers[i], 0, 0, 0, 0));
      bubble.style.left = `${(W - bw) / 2}px`;
      bubble.style.top = `${(H - bh) / 2}px`;
      arrow.className = 'tour-arrow hidden';
      return;
    }

    const w = r.right - r.left;
    const h = r.bottom - r.top;
    place(hole, r.left, r.top, w, h);
    place(blockers[0], 0, 0, W, r.top);
    place(blockers[1], 0, r.bottom, W, H - r.bottom);
    place(blockers[2], 0, r.top, r.left, h);
    place(blockers[3], r.right, r.top, W - r.right, h);

    const clampX = (x) => Math.min(Math.max(MARGIN, x), W - bw - MARGIN);
    const clampY = (y) => Math.min(Math.max(MARGIN, y), H - bh - MARGIN);
    const cx = (r.left + r.right) / 2;
    const cy = (r.top + r.bottom) / 2;
    let side;
    let left;
    let top;
    if (H - r.bottom >= bh + GAP + MARGIN) {
      side = 'bottom'; left = clampX(cx - bw / 2); top = r.bottom + GAP;
    } else if (r.top >= bh + GAP + MARGIN) {
      side = 'top'; left = clampX(cx - bw / 2); top = r.top - GAP - bh;
    } else if (W - r.right >= bw + GAP + MARGIN) {
      side = 'right'; left = r.right + GAP; top = clampY(cy - bh / 2);
    } else if (r.left >= bw + GAP + MARGIN) {
      side = 'left'; left = r.left - GAP - bw; top = clampY(cy - bh / 2);
    } else {
      side = 'inside'; left = clampX(cx - bw / 2); top = clampY(r.bottom - bh - GAP);
    }
    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;

    arrow.className = `tour-arrow arrow-${side}`;
    if (side === 'bottom' || side === 'top') {
      arrow.style.left = `${Math.min(Math.max(18, cx - left), bw - 18)}px`;
      arrow.style.top = '';
    } else {
      arrow.style.top = `${Math.min(Math.max(18, cy - top), bh - 18)}px`;
      arrow.style.left = '';
    }
  }

  async function go(i, afterClick = false) {
    if (i < 0) return;
    if (i >= STEPS.length) {
      end();
      return;
    }
    const token = ++navToken;
    index = i;
    const step = STEPS[i];

    bubble.classList.add('switching');
    await openView(step.view, afterClick);
    if (token !== navToken || !active) return;

    const first = targetElements(step).find((node) => node.getBoundingClientRect().height > 0);
    if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });

    el('tour-count').textContent = `Étape ${i + 1} sur ${STEPS.length}`;
    el('tour-bar-fill').style.width = `${((i + 1) / STEPS.length) * 100}%`;
    el('tour-title').textContent = step.title;
    el('tour-text').textContent = step.text;
    el('tour-action').classList.toggle('hidden', !step.click);
    el('tour-prev').classList.toggle('hidden', i === 0);
    el('tour-next').textContent = i === STEPS.length - 1 ? 'Terminer' : 'Suivant';
    root.classList.toggle('hole-clickable', !!step.click);

    requestAnimationFrame(() => {
      if (token !== navToken) return;
      bubble.classList.remove('switching');
      el('tour-next').focus({ preventScroll: true });
    });
  }

  function start() {
    if (active) return;
    active = true;
    root.classList.remove('hidden');
    frame = requestAnimationFrame(layout);
    go(0);
  }

  function end() {
    active = false;
    navToken += 1;
    cancelAnimationFrame(frame);
    root.classList.add('hidden');
    index = -1;
  }

  el('tour-next').addEventListener('click', () => go(index + 1));
  el('tour-prev').addEventListener('click', () => go(index - 1));
  el('tour-skip').addEventListener('click', end);

  // Clicking the outlined element of a "click" step also moves on, after the
  // app has handled the click itself.
  document.addEventListener('click', (e) => {
    if (!active) return;
    const step = STEPS[index];
    if (!step || !step.click) return;
    const hit = [].concat(step.target).some((sel) => e.target.closest && e.target.closest(sel));
    if (hit) setTimeout(() => go(index + 1, true), 0);
  }, true);

  document.addEventListener('keydown', (e) => {
    if (!active) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
    if (e.key === 'Escape') end();
    else if (!typing && e.key === 'ArrowRight') go(index + 1);
    else if (!typing && e.key === 'ArrowLeft') go(index - 1);
  });

  return { start, end, isActive: () => active };
})();
