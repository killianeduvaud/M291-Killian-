// Fictional sample quotes used for the template previews (choose-template screen).

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="110" viewBox="0 0 360 110">
  <rect x="4" y="9" width="92" height="92" rx="22" fill="#0071e3"/>
  <path d="M30 78 L50 30 L70 78 M38 62 H62" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="114" y="52" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#1d1d1f">Atelier</text>
  <text x="114" y="90" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="300" fill="#1d1d1f">Exemple</text>
</svg>`;
const SAMPLE_LOGO = `data:image/svg+xml;base64,${Buffer.from(LOGO_SVG).toString('base64')}`;

const SELLER = {
  sellerName: 'Atelier Exemple Sàrl',
  sellerAddress1: 'Rue du Marché 12',
  sellerAddress2: '1003 Lausanne',
  sellerPhone: '+41 21 555 12 34',
  sellerEmail: 'contact@atelier-exemple.ch',
  sellerSiret: 'CHE-123.456.789',
  sellerVat: '',
  sellerBankName: 'Banque Exemple',
  sellerIban: 'CH12 3456 7890 1234 5678 9',
  sellerBic: 'EXMPCH22',
  sellerHeaderLine: 'Atelier Exemple Sàrl / Rue du Marché 12 / 1003 Lausanne',
  legalMentions: 'Devis valable 30 jours.',
};

const SAMPLES = {
  classique: {
    ...SELLER,
    clientName: 'Sophie Martin',
    clientAddress1: 'Avenue des Alpes 8',
    clientAddress2: '1820 Montreux',
    clientNumber: '0042',
    quoteNumber: '0108',
    additionalInfo: 'Projet : identité visuelle',
    issueDate: '02/10/2026',
    validityDate: '01/11/2026',
    lines: [
      { isSection: true, description: 'Conception', quantity: '', unit: '', unitPriceHT: '', vatRatePct: '', lineVatAmount: '', lineTotalTTC: '' },
      { description: 'Création du logo', quantity: '1', unit: 'forfait', unitPriceHT: '600,00 €', vatRatePct: '20 %', lineVatAmount: '120,00 €', lineTotalTTC: '720,00 €' },
      { description: 'Charte graphique', quantity: '1', unit: 'forfait', unitPriceHT: '400,00 €', vatRatePct: '20 %', lineVatAmount: '80,00 €', lineTotalTTC: '480,00 €' },
      { isSection: true, description: 'Impression', quantity: '', unit: '', unitPriceHT: '', vatRatePct: '', lineVatAmount: '', lineTotalTTC: '' },
      { description: 'Cartes de visite (500 ex.)', quantity: '2', unit: 'lots', unitPriceHT: '75,00 €', vatRatePct: '20 %', lineVatAmount: '30,00 €', lineTotalTTC: '180,00 €' },
    ],
    totalHT: '1 150,00 €',
    discountAmount: '0,00 €',
    totalVAT: '230,00 €',
    totalTTC: '1 380,00 €',
    depositPercent: '30',
    depositAmount: '414,00 €',
    balancePercent: '70',
    balanceAmount: '966,00 €',
  },

  lettre: {
    ...SELLER,
    managers: ['- Julie Bernard', '- julie.bernard@atelier-exemple.ch'],
    placeDate: 'Lausanne, le 02.10.2026',
    clientBlock: 'Commune de Bellevue\nMme Sophie Martin\nPlace du Village 1\n1290 Bellevue',
    quoteTitle: 'Devis_2026_014_Brochure',
    salutation: 'Madame,',
    salutationName: 'Madame',
    introText: 'À la suite de notre échange du 30.09.2026, nous nous permettons de vous transmettre notre devis concernant le projet mentionné ci-dessus.',
    rows: [
      { isSection: true, title: 'Conception' },
      { isSection: false, description: 'Maquette de la brochure, 8 pages', qtyUnit: '6h', unitPrice: 'CHF 25.00', totalHT: 'CHF 150.00' },
      { isSection: true, title: 'Mise en page' },
      { isSection: false, description: 'Intégration des textes et des photos', qtyUnit: '10h', unitPrice: 'CHF 25.00', totalHT: 'CHF 250.00' },
      { isSection: true, title: 'Livraison' },
      { isSection: false, description: 'Fichiers d\'impression PDF', qtyUnit: '2h', unitPrice: 'CHF 25.00', totalHT: 'CHF 50.00' },
    ],
    totalQty: '18h',
    totalHT: 'CHF 450.00',
    hasDiscount: false,
    vatRows: [{ label: 'TVA arrondie au 0,05 cts', rate: '8.1 %', amount: 'CHF 36.45' }],
    totalTTC: 'CHF 486.45',
    hasDeposit: false,
    hasOtherInfo: true,
    otherInfoLines: ['L\'offre est valable 30 jours.', 'Si l\'offre vous convient, merci de nous la retourner datée et signée.'],
    signatories: ['Julie Bernard', 'Thomas Morel'],
  },

  travaux: {
    ...SELLER,
    clientName: 'M. et Mme Dubois',
    clientAddress1: 'Chemin des Vignes 4',
    clientAddress2: '1096 Cully',
    clientNumber: '0057',
    quoteNumber: '0112',
    issueDate: '02/10/2026',
    validityDate: '01/11/2026',
    workStart: '19/10/2026',
    workDuration: '5 jours',
    rows: [
      { isSection: true, secWhite: true, title: '1. Cuisine' },
      { itemGrey: true, description: 'Main d\'œuvre', unit: 'h', qty: '4', unitPrice: '45,00', vatRatePct: '10 %', totalHT: '180,00' },
      { itemWhite: true, description: 'Carrelage', unit: 'm²', qty: '12', unitPrice: '32,50', vatRatePct: '10 %', totalHT: '390,00' },
      { isSection: true, secGrey: true, title: '2. Salle de bain' },
      { itemWhite: true, description: 'Main d\'œuvre', unit: 'h', qty: '3', unitPrice: '45,00', vatRatePct: '20 %', totalHT: '135,00' },
      { itemGrey: true, description: 'Isolation', unit: 'm²', qty: '5', unitPrice: '28,00', vatRatePct: '5,5 %', totalHT: '140,00' },
    ],
    vat1Base: '135,00 €', vat1Rate: '20 %', vat1Amount: '27,00 €', vat1Ttc: '162,00 €',
    vat2Base: '570,00 €', vat2Rate: '10 %', vat2Amount: '57,00 €', vat2Ttc: '627,00 €',
    vat3Base: '140,00 €', vat3Rate: '5,5 %', vat3Amount: '7,70 €', vat3Ttc: '147,70 €',
    netHT: '845,00 €',
    totalVAT: '91,70 €',
    totalTTC: '936,70 €',
    netToPay: '936,70 €',
    paymentBlock: 'Acompte de 30 % à la commande, solde à la fin des travaux.\n\nCoordonnées bancaires :\nIBAN : CH12 3456 7890 1234 5678 9',
    comments: 'Accès au chantier par le garage.',
    hasLegalFooter: true,
    legalFooter: 'IDE : CHE-123.456.789\nDevis valable 30 jours.',
  },
};

function sampleQuote(template) {
  const key = SAMPLES[template] ? template : 'classique';
  return { data: { ...SAMPLES[key], template: key }, logoDataUrl: SAMPLE_LOGO };
}

module.exports = { sampleQuote };
