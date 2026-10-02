const CURRENCIES = {
  EUR: { locale: 'fr-FR', code: 'EUR' },
  CHF: { locale: 'de-CH', code: 'CHF' },
};

function currencyInfo(currency) {
  return CURRENCIES[currency] || CURRENCIES.EUR;
}

// "1 234,50 €" / "CHF 1'234.50"
function formatMoney(n, currency) {
  const v = Number.isFinite(n) ? n : 0;
  const { locale, code } = currencyInfo(currency);
  return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(v);
}

// Amount without currency symbol: "1 234,50" / "1'234.50"
function formatAmount(n, currency) {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(currencyInfo(currency).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

// Quantities and rates: "0,5" / "8.1"
function formatNumber(n, currency) {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(currencyInfo(currency).locale, { maximumFractionDigits: 2 }).format(v);
}

function formatDateFR(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

// Swiss style: 16.09.2026
function formatDateDots(isoDate) {
  return formatDateFR(isoDate).replace(/\//g, '.');
}

function hasOwnVatRate(line) {
  return line.vatRate !== '' && line.vatRate != null && Number.isFinite(Number(line.vatRate));
}

// lines: [{ type: 'section', title } | { type: 'item', description, unit, quantity, unitPrice, vatRate }]
// An item without its own vatRate uses the quote's default rate.
function computeQuote({ lines, discountType, discountValue, vatRate, depositPercent, roundVatTo5Cents }) {
  const defaultRate = Number(vatRate) || 0;
  const deposit = Math.min(100, Math.max(0, Number(depositPercent) || 0));

  const computedLines = lines.map((l) => {
    if (l.type === 'section') return { ...l };
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unitPrice) || 0;
    const rate = hasOwnVatRate(l) ? Number(l.vatRate) : defaultRate;
    const subtotal = qty * price;
    const vatAmount = subtotal * (rate / 100);
    const totalTTC = subtotal + vatAmount;
    return { ...l, qty, price, rate, subtotal, vatAmount, totalTTC };
  });
  const items = computedLines.filter((l) => l.type !== 'section');

  const subtotalHT = items.reduce((s, l) => s + l.subtotal, 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = subtotalHT * ((Number(discountValue) || 0) / 100);
  } else if (discountType === 'amount') {
    discountAmount = Number(discountValue) || 0;
  }
  discountAmount = Math.max(0, Math.min(discountAmount, subtotalHT));

  const netHT = subtotalHT - discountAmount;

  // VAT per rate, computed on the discounted base (discount spread pro rata)
  const ratio = subtotalHT > 0 ? netHT / subtotalHT : 0;
  const bases = new Map();
  items.forEach((l) => bases.set(l.rate, (bases.get(l.rate) || 0) + l.subtotal));
  const vatBreakdown = [...bases.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, base]) => {
      const baseHT = base * ratio;
      let vat = baseHT * (rate / 100);
      if (roundVatTo5Cents) vat = Math.round(vat * 20) / 20;
      return { rate, baseHT, vat, ttc: baseHT + vat };
    });

  const totalVAT = vatBreakdown.reduce((s, g) => s + g.vat, 0);
  const totalTTC = netHT + totalVAT;

  const depositAmount = totalTTC * (deposit / 100);
  const balancePercent = 100 - deposit;
  const balanceAmount = totalTTC - depositAmount;

  return {
    computedLines,
    subtotalHT,
    discountAmount,
    netHT,
    vatBreakdown,
    totalVAT,
    totalTTC,
    depositPercent: deposit,
    depositAmount,
    balancePercent,
    balanceAmount,
    vatRate: defaultRate,
  };
}
