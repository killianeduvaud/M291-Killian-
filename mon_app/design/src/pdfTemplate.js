function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function nl2br(v) {
  return esc(v).replace(/\n/g, '<br>');
}

function buildHtml(data, logoDataUrl) {
  const lines = data.lines || [];

  const rows = lines.map((l) => (l.isSection ? `
    <tr class="section"><td colspan="7">${esc(l.description)}</td></tr>
  ` : `
    <tr>
      <td class="desc">${esc(l.description)}</td>
      <td class="num">${esc(l.quantity)}</td>
      <td class="center">${esc(l.unit)}</td>
      <td class="num">${esc(l.unitPriceHT)}</td>
      <td class="num">${esc(l.vatRatePct)}</td>
      <td class="num">${esc(l.lineVatAmount)}</td>
      <td class="num">${esc(l.lineTotalTTC)}</td>
    </tr>
  `)).join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1a1a1a;
    font-size: 10pt;
    margin: 0;
  }
  .header { position: relative; min-height: 135pt; margin-bottom: 18pt; }
  .header h1 {
    font-size: 36pt; color: #2F5496; margin: 0; font-weight: bold;
  }
  .header .logo {
    position: absolute; top: 0; right: 0; max-width: 130pt; max-height: 125pt;
    object-fit: contain;
  }
  .parties { display: flex; justify-content: space-between; margin-bottom: 20pt; gap: 24pt; }
  .party { flex: 1; }
  .party .label { font-weight: bold; color: #1a1a1a; font-size: 9pt; margin-bottom: 4pt; }
  .party.client { text-align: right; }
  .party .name { font-weight: bold; color: #4D4D4D; }
  .party .line { font-style: italic; color: #4D4D4D; }
  .meta-row { display: flex; justify-content: space-between; margin-bottom: 20pt; gap: 24pt; }
  .meta-block .label { font-weight: bold; font-size: 9pt; }
  .meta-block .value { font-style: italic; color: #4D4D4D; }
  table.items { width: 100%; border-collapse: collapse; margin-bottom: 4pt; }
  table.items th {
    text-align: left; font-size: 9pt; padding: 6pt 4pt; border-bottom: 1pt solid #999;
  }
  table.items th.num, table.items td.num { text-align: right; }
  table.items th.center, table.items td.center { text-align: center; }
  table.items td { padding: 6pt 4pt; border-top: 1pt solid #E7E9E9; font-size: 9.5pt; }
  table.items tr.section td { font-weight: bold; padding-top: 10pt; }
  .totals { width: 100%; margin-top: 4pt; }
  .totals td { padding: 4pt; font-size: 9.5pt; }
  .totals td.label { text-align: right; font-weight: bold; }
  .totals td.value { text-align: right; font-weight: bold; width: 90pt; }
  .totals tr.ttc td { font-size: 12pt; color: #2F5496; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40pt; gap: 24pt; }
  .sig { flex: 1; }
  .sig .label { font-weight: bold; margin-bottom: 30pt; }
  .sig .date { font-size: 9pt; color: #4D4D4D; margin-top: 6pt; }
  .validity { font-size: 9pt; color: #4D4D4D; margin-top: 20pt; }
  .footer {
    margin-top: 30pt; padding-top: 10pt; border-top: 1pt solid #05B3C2;
    font-size: 8.5pt; color: #4D4D4D;
  }
  .footer .bank { margin-bottom: 6pt; }
  .footer .legal { font-style: italic; font-size: 7.5pt; }
</style>
</head>
<body>
  <div class="header">
    <h1>Devis</h1>
    ${logoDataUrl ? `<img class="logo" src="${logoDataUrl}">` : ''}
  </div>

  <div class="parties">
    <div class="party seller">
      <div class="label">Vendeur</div>
      <div class="name">${esc(data.sellerName)}</div>
      <div class="line">${esc(data.sellerAddress1)}</div>
      <div class="line">${esc(data.sellerAddress2)}</div>
      <div class="line">${esc(data.sellerPhone)}</div>
      <div class="line">${esc(data.sellerEmail)}</div>
      ${(data.sellerSiret || data.sellerVat) ? `<div class="line">SIRET : ${esc(data.sellerSiret)}    TVA intracom. : ${esc(data.sellerVat)}</div>` : ''}
    </div>
    <div class="party client">
      <div class="label">Client</div>
      <div class="name">${esc(data.clientName)}</div>
      <div class="line">${esc(data.clientAddress1)}</div>
      <div class="line">${esc(data.clientAddress2)}</div>
      <div class="line">N&deg; client : ${esc(data.clientNumber)}</div>
    </div>
  </div>

  <div class="meta-row">
    <div class="meta-block">
      <div class="label">Informations additionnelles :</div>
      <div class="value">${nl2br(data.additionalInfo)}</div>
    </div>
    <div class="meta-block" style="text-align:right">
      <div class="label">R&eacute;f&eacute;rence du devis :</div>
      <div class="value">${esc(data.quoteNumber)}</div>
    </div>
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>Description</th>
        <th class="num">Quantit&eacute;</th>
        <th class="center">Unit&eacute;</th>
        <th class="num">Prix unitaire HT</th>
        <th class="num">% TVA</th>
        <th class="num">Total TVA</th>
        <th class="num">Total TTC</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <table class="totals">
    <tr><td class="label">Total HT</td><td class="value">${esc(data.totalHT)}</td></tr>
    <tr><td class="label">Remise / Escompte</td><td class="value">${esc(data.discountAmount)}</td></tr>
    <tr><td class="label">Total TVA</td><td class="value">${esc(data.totalVAT)}</td></tr>
    <tr class="ttc"><td class="label">Total TTC</td><td class="value">${esc(data.totalTTC)}</td></tr>
    <tr><td class="label">Acompte (${esc(data.depositPercent)} %)</td><td class="value">${esc(data.depositAmount)}</td></tr>
    <tr><td class="label">Solde restant d&ucirc; (${esc(data.balancePercent)} %)</td><td class="value">${esc(data.balanceAmount)}</td></tr>
  </table>

  <div class="signatures">
    <div class="sig">
      <div class="label">Signature du Vendeur :</div>
      <div class="date">Date : ${esc(data.issueDate)}</div>
    </div>
    <div class="sig">
      <div class="label">Signature du client :</div>
      <div class="date">Date : ${esc(data.issueDate)}</div>
    </div>
  </div>
  <div class="validity">Date de validit&eacute; du devis : ${esc(data.validityDate)}</div>

  <div class="footer">
    <div class="bank">
      D&eacute;tails bancaires — Banque : ${esc(data.sellerBankName)} &nbsp;|&nbsp; IBAN : ${esc(data.sellerIban)} &nbsp;|&nbsp; SWIFT/BIC : ${esc(data.sellerBic)}
    </div>
    <div class="legal">${nl2br(data.legalMentions)}</div>
  </div>
</body>
</html>`;
}

module.exports = { buildHtml, esc, nl2br };
