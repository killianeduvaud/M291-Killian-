// PDF layout of the "Travaux" template (works quote, table layout).
const { esc, nl2br } = require('./pdfTemplate');

function buildTravauxHtml(data, logoDataUrl) {
  const rows = (data.rows || []).map((r) => {
    const stripe = r.secGrey || r.itemGrey ? ' grey' : '';
    if (r.isSection) {
      return `<tr class="section${stripe}"><td class="gutter"></td><td colspan="6">${esc(r.title)}</td></tr>`;
    }
    return `
      <tr class="item${stripe}">
        <td class="gutter"></td>
        <td>${nl2br(r.description)}</td>
        <td class="center">${esc(r.unit)}</td>
        <td class="center">${esc(r.qty)}</td>
        <td class="num">${esc(r.unitPrice)}</td>
        <td class="center">${esc(r.vatRatePct)}</td>
        <td class="num">${esc(r.totalHT)}</td>
      </tr>`;
  }).join('');

  const vatSlot = (k) => `
    <td class="num">${esc(data[`vat${k}Base`])}</td>
    <td class="center">${esc(data[`vat${k}Rate`])}</td>
    <td class="num">${esc(data[`vat${k}Amount`])}</td>
    <td class="num">${esc(data[`vat${k}Ttc`])}</td>`;

  const info = [
    ['Date de devis :', data.issueDate],
    ['N° Devis :', data.quoteNumber],
    ['N° client :', data.clientNumber],
    ["Valable jusqu'à", data.validityDate],
    ['Début des travaux', data.workStart],
    ['Durée estimée à', data.workDuration],
  ].map(([label, value]) => `<tr><td class="label blue">${label}</td><td>${esc(value)}</td></tr>`).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 12.7mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #000; margin: 0; }
  table { border-collapse: collapse; }
  td, th { padding: 3pt 5pt; vertical-align: middle; }
  .soft { background: #d3eafc; }
  .blue { background: #1591f0; color: #fff; }
  .bordered td, .bordered th { border: 0.5pt solid #000; }
  .num { text-align: right; white-space: nowrap; }
  .center { text-align: center; }
  .block { margin-top: 12pt; }

  /* Header: logo, seller, DEVIS */
  .head { display: grid; grid-template-columns: 177pt 1fr 150pt; }
  .head .logo {
    grid-row: 1 / span 2; min-height: 118pt;
    display: flex; align-items: center; justify-content: center;
    border: 0.5pt solid #ccc; padding: 6pt;
  }
  .head .logo img { max-width: 100%; max-height: 104pt; object-fit: contain; }
  .head .name { font-size: 13pt; font-weight: bold; padding: 0 8pt; align-self: center; }
  .head .devis { font-size: 26pt; font-weight: bold; color: #1591f0; text-align: center; align-self: center; }
  .head .seller-lines { grid-column: 2 / span 1; }
  .head .seller-lines div { padding: 3pt 8pt; min-height: 17.5pt; border-bottom: 0.5pt solid #000; }

  .client { width: 172.5pt; margin-left: auto; }
  .client td { border: 0.5pt solid #000; height: 17.5pt; }
  .client .title { font-weight: bold; font-size: 10pt; }

  table.info td { border: 0.5pt solid #000; height: 17.5pt; }
  table.info td.label { width: 124.5pt; }
  table.info td:last-child { width: 96.75pt; }

  table.items { width: 100%; table-layout: fixed; }
  table.items th { font-weight: bold; text-align: center; }
  table.items tr.section td { font-weight: bold; }
  table.items tr.grey td { background: #e7e9e9; }

  .totals { display: flex; justify-content: space-between; align-items: flex-start; }
  .totals table.vat th { font-weight: normal; text-align: center; }
  .totals table.vat th, .totals table.vat td { width: 58pt; height: 17.5pt; }
  .totals table.sum td { height: 17.5pt; border: 0.5pt solid #000; }
  .totals table.sum td.label { width: 97.5pt; text-align: center; }
  .totals table.sum td.value { width: 75pt; }
  .totals table.sum tr.net td { font-weight: bold; }

  .box { border: 0.5pt solid #000; }
  .box .heading { font-weight: bold; font-size: 10pt; padding: 3pt 5pt; border-bottom: 0.5pt solid #000; }
  .box .body { padding: 5pt; min-height: 34pt; white-space: pre-line; }

  .bottom { display: grid; grid-template-columns: 1fr 172.5pt; column-gap: 24pt; }
  .signature .body { min-height: 26pt; font-style: italic; font-size: 8pt; }
  .signature .space { height: 60pt; }

  .legal { margin-top: 14pt; padding: 6pt 8pt; font-size: 7.5pt; color: #333; white-space: pre-line; }
</style>
</head>
<body>
  <div class="head">
    <div class="logo soft">${logoDataUrl ? `<img src="${logoDataUrl}">` : ''}</div>
    <div class="name">${esc(data.sellerName)}</div>
    <div class="devis">DEVIS</div>
    <div class="seller-lines">
      <div class="soft">${esc(data.sellerAddress1)}</div>
      <div class="soft">${esc(data.sellerAddress2)}</div>
      <div class="soft">${esc(data.sellerPhone)}</div>
      <div class="soft">${esc(data.sellerEmail)}</div>
    </div>
  </div>

  <table class="client block">
    <tr><td class="soft title">Votre client</td></tr>
    <tr><td class="soft">${esc(data.clientName)}</td></tr>
    <tr><td class="soft">${esc(data.clientAddress1)}</td></tr>
    <tr><td class="soft">${esc(data.clientAddress2)}</td></tr>
  </table>

  <table class="info block">
    ${info}
  </table>

  <table class="items bordered block">
    <colgroup>
      <col style="width:31.5pt"><col><col style="width:35.25pt"><col style="width:37.5pt">
      <col style="width:62.25pt"><col style="width:35.25pt"><col style="width:75pt">
    </colgroup>
    <thead>
      <tr class="blue">
        <th></th><th>Description</th><th>Unité</th><th>Qté</th><th>Prix unitaire</th><th>TVA</th><th>Total HT</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals block">
    <table class="vat bordered">
      <tr class="blue"><th>Total HT</th><th>Taux TVA</th><th>Total TVA</th><th>Total TTC</th></tr>
      <tr>${vatSlot(1)}</tr>
      <tr>${vatSlot(2)}</tr>
      <tr>${vatSlot(3)}</tr>
    </table>
    <table class="sum">
      <tr><td class="label blue">Total HT :</td><td class="value soft num">${esc(data.netHT)}</td></tr>
      <tr><td class="label blue">Total TVA :</td><td class="value soft num">${esc(data.totalVAT)}</td></tr>
      <tr><td class="label blue">Total TTC :</td><td class="value soft num">${esc(data.totalTTC)}</td></tr>
      <tr class="net"><td class="label blue">Net à payer</td><td class="value soft num">${esc(data.netToPay)}</td></tr>
    </table>
  </div>

  <div class="box block">
    <div class="heading">Conditions de paiement</div>
    <div class="body">${esc(data.paymentBlock)}</div>
  </div>

  <div class="bottom block">
    <div class="box">
      <div class="heading">Commentaires</div>
      <div class="body">${esc(data.comments)}</div>
    </div>
    <div class="box signature">
      <div class="heading">Date et signature</div>
      <div class="body soft">Veuillez retourner le devis signé, daté avec la mention : "Bon pour accord"</div>
      <div class="space"></div>
    </div>
  </div>

  ${data.hasLegalFooter ? `<div class="legal soft">${esc(data.legalFooter)}</div>` : ''}
</body>
</html>`;
}

module.exports = { buildTravauxHtml };
