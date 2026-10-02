const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app, BrowserWindow } = require('electron');
const { buildHtml } = require('./pdfTemplate');
const { buildLettreHtml } = require('./pdfTemplateLettre');
const { buildTravauxHtml } = require('./pdfTemplateTravaux');

const HTML_BUILDERS = {
  classique: buildHtml,
  lettre: buildLettreHtml,
  travaux: buildTravauxHtml,
};

function buildQuoteHtml(data, logoDataUrl) {
  const build = HTML_BUILDERS[data.template] || buildHtml;
  return build(data, logoDataUrl);
}

async function generatePdfBuffer(data, logoDataUrl) {
  // The page goes through a temporary file: a data: URL is limited to 2 MB,
  // which a large logo alone can exceed.
  const htmlPath = path.join(app.getPath('temp'), `devis-${crypto.randomUUID()}.html`);
  fs.writeFileSync(htmlPath, buildQuoteHtml(data, logoDataUrl));

  const win = new BrowserWindow({
    show: false,
    webPreferences: { offscreen: true },
  });

  try {
    await win.loadFile(htmlPath);
    const buffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { marginType: 'none' },
    });
    return buffer;
  } finally {
    win.destroy();
    fs.rmSync(htmlPath, { force: true });
  }
}

module.exports = { generatePdfBuffer, buildQuoteHtml };
