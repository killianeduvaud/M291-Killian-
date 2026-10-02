// PDF layout of the "Lettre" template (letter style).
const { esc, nl2br } = require('./pdfTemplate');

function buildLettreHtml(data, logoDataUrl) {
  const rows = (data.rows || []).map((r) => (r.isSection ? `
    <tr class="section"><td colspan="4">${esc(r.title)}</td></tr>
  ` : `
    <tr class="item">
      <td class="desc"><span class="dash">-</span><span>${nl2br(r.description)}</span></td>
      <td class="qty">${esc(r.qtyUnit)}</td>
      <td class="num">${esc(r.unitPrice)}</td>
      <td class="num">${esc(r.totalHT)}</td>
    </tr>
  `)).join('');

  const vatRows = (data.vatRows || []).map((v) => `
    <tr><td>${esc(v.label)}</td><td></td><td class="num strong">${esc(v.rate)}</td><td class="num strong">${esc(v.amount)}</td></tr>
  `).join('');

  const discountRows = data.hasDiscount ? `
    <tr><td>${esc(data.discountLabel)}</td><td></td><td></td><td class="num strong">${esc(data.discountAmount)}</td></tr>
    <tr><td>Total HT après remise</td><td></td><td></td><td class="num strong">${esc(data.netHT)}</td></tr>
  ` : '';

  const depositRows = data.hasDeposit ? `
    <tr><td>Acompte à la commande (${esc(data.depositPercent)} %)</td><td></td><td></td><td class="num strong">${esc(data.depositAmount)}</td></tr>
    <tr><td>Solde (${esc(data.balancePercent)} %)</td><td></td><td></td><td class="num strong">${esc(data.balanceAmount)}</td></tr>
  ` : '';

  const otherInfo = data.hasOtherInfo ? `
    <div class="other-info">
      <div><u>Autres informations</u> :</div>
      ${data.otherInfoLines.map((l) => `<div class="bullet"><span class="dash">-</span><span>${esc(l)}</span></div>`).join('')}
    </div>
  ` : '';

  const signatories = data.signatories || [];

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 12mm 25mm 18mm 25mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 11.5pt;
    line-height: 1.22;
    color: #000;
    margin: 0;
  }
  .letterhead .logo { display: block; max-width: 170pt; max-height: 64pt; margin-bottom: 10pt; }
  .letterhead .addr {
    font-size: 9pt; color: #808080;
    border-bottom: 0.75pt solid #000; padding-bottom: 1.5pt;
  }
  .top { display: grid; grid-template-columns: 8cm 1fr; margin-top: 30pt; }
  .managers .label { font-style: italic; }
  .right .place { margin-top: 1.22em; }
  .right .client { margin-top: 2.4em; }
  h1.title { font-size: 18pt; font-weight: 700; font-style: italic; margin: 34pt 0 16pt; }
  .salutation { margin: 0 0 1.22em; }
  .intro { margin: 0 0 1.4em; text-align: justify; }

  table.services { width: 87%; border-collapse: collapse; margin-bottom: 1.6em; }
  table.services th, table.services td { padding: 1.5pt 3pt; vertical-align: top; }
  table.services thead th { background: #4F81BD; color: #fff; font-weight: 500; text-align: left; }
  table.services thead th.num { text-align: right; }
  table.services thead th.qty { text-align: center; }
  table.services tr.section td { background: #DBE5F1; font-style: italic; }
  table.services td.desc { display: flex; padding-left: 14pt; }
  table.services td.qty { text-align: center; white-space: nowrap; }
  table.services td.num { text-align: right; white-space: nowrap; }
  table.services .strong { font-weight: 700; }
  table.services tr.band td { background: #DBE5F1; }
  .dash { display: inline-block; width: 12pt; flex: none; }

  .other-info { margin-bottom: 0; }
  .bullet { display: flex; }
  .closing { text-align: justify; margin: 0; }

  .signatures { display: grid; grid-template-columns: 8cm 1fr; margin-top: 66pt; }
  .signatures .line { height: 1.22em; }
  .signatures .name { font-style: italic; }
  .agreement { margin-top: 1.4em; }
  .agreement .blank { width: 11cm; border-bottom: 0.75pt solid #000; height: 34pt; }
</style>
</head>
<body>
  <div class="letterhead">
    ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}">` : ''}
    <div class="addr">${esc(data.sellerHeaderLine)}</div>
  </div>

  <div class="top">
    <div class="managers">
      ${data.managers && data.managers.length ? '<div class="label">Responsable de projet :</div>' : ''}
      ${(data.managers || []).map((m) => `<div>${esc(m)}</div>`).join('')}
    </div>
    <div class="right">
      <div class="place">${esc(data.placeDate)}</div>
      <div class="client">${nl2br(data.clientBlock)}</div>
    </div>
  </div>

  <h1 class="title">${esc(data.quoteTitle)}</h1>
  <p class="salutation">${esc(data.salutation)}</p>
  <p class="intro">${nl2br(data.introText)}</p>

  <table class="services">
    <thead>
      <tr><th>Prestations</th><th class="qty">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="band"><td>Total HT</td><td class="qty strong">${esc(data.totalQty)}</td><td></td><td class="num strong">${esc(data.totalHT)}</td></tr>
      ${discountRows}
      ${vatRows}
      <tr class="band"><td>Total TTC</td><td></td><td></td><td class="num strong">${esc(data.totalTTC)}</td></tr>
      ${depositRows}
    </tbody>
  </table>

  ${otherInfo}
  <p class="closing">Nous restons à votre entière disposition pour tout renseignement complémentaire.</p>
  <p class="closing">En vous remerciant pour votre confiance, nous vous adressons, ${esc(data.salutationName)}, nos meilleures salutations.</p>

  <div class="signatures">
    ${[0, 1].map((i) => `
      <div>
        <div class="line">${signatories[i] ? '______________________' : ''}</div>
        <div class="name">${esc(signatories[i] || '')}</div>
      </div>
    `).join('')}
  </div>

  <div class="agreement">
    <div>Bon pour accord du client (à retourner daté et signé) :</div>
    <div class="blank"></div>
  </div>
</body>
</html>`;
}

module.exports = { buildLettreHtml };
