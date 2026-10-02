const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const { imageSize } = require('image-size');
const { AppError } = require('./errors');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// The "lettre" and "travaux" templates hold their logo as an inline picture
// named "DevisLogo", resized to fit maxW x maxH (EMU).
const TEMPLATES = {
  classique: { file: 'devis-template.docx' },
  lettre: {
    file: 'devis-lettre.docx',
    logo: { part: 'word/header1.xml', media: 'word/media/image1.png', maxW: 2160000, maxH: 900000 },
  },
  travaux: {
    file: 'devis-travaux.docx',
    logo: { part: 'word/document.xml', media: 'word/media/logo.png', maxW: 2000000, maxH: 1450000 },
  },
};

const INLINE_LOGO_RUN = /<w:r\b[^>]*>(?:(?!<\/w:r>)[\s\S])*?name="DevisLogo"[\s\S]*?<\/w:r>/;

// Original logo slot in the header (EMU), anchored so its right edge sits at
// a fixed position and its top sits at a fixed position (see devis.docx).
const SLOT_MAX_W = 1699011;
const SLOT_MAX_H = 1638300;
const SLOT_RIGHT_EDGE = 5108575 + 1699011; // original left + width
const SLOT_TOP = -45720;

function patchHeaderLogo(zip, logoPng) {
  const headerFile = zip.file('word/header1.xml');
  if (!headerFile) return;
  let header = headerFile.asText();

  const dims = imageSize(logoPng);
  const scale = Math.min(SLOT_MAX_W / dims.width, SLOT_MAX_H / dims.height);
  const newW = Math.round(dims.width * scale);
  const newH = Math.round(dims.height * scale);
  const newLeft = SLOT_RIGHT_EDGE - newW;

  header = header.replace(
    /<wp:posOffset>5108575<\/wp:posOffset>/,
    `<wp:posOffset>${newLeft}</wp:posOffset>`
  );
  header = header.replace(
    /<wp:posOffset>-45720<\/wp:posOffset>/,
    `<wp:posOffset>${SLOT_TOP}</wp:posOffset>`
  );
  header = header.replace(
    /<wp:extent cx="1699011" cy="1638300"\/>/,
    `<wp:extent cx="${newW}" cy="${newH}"/>`
  );
  header = header.replace(
    /<a:ext cx="1699011" cy="1638300"\/>/,
    `<a:ext cx="${newW}" cy="${newH}"/>`
  );

  zip.file('word/header1.xml', header);
  zip.file('word/media/image1.png', logoPng);
}

function removeHeaderLogo(zip) {
  // No logo for this profile: drop the picture run entirely so the header
  // just shows the "Devis" title with no placeholder image.
  const headerFile = zip.file('word/header1.xml');
  if (!headerFile) return;
  let header = headerFile.asText();
  header = header.replace(/<w:r><w:rPr><w:noProof\/><\/w:rPr><w:drawing>[\s\S]*?<\/w:drawing><\/w:r>/, '');
  zip.file('word/header1.xml', header);
}

function patchInlineLogo(zip, spec, logoPng) {
  const xml = zip.file(spec.part).asText();
  const run = xml.match(INLINE_LOGO_RUN);
  if (!run) return;

  const dims = imageSize(logoPng);
  const scale = Math.min(spec.maxW / dims.width, spec.maxH / dims.height);
  const w = Math.round(dims.width * scale);
  const h = Math.round(dims.height * scale);
  const sized = run[0]
    .replace(/<wp:extent cx="\d+" cy="\d+"\/>/, `<wp:extent cx="${w}" cy="${h}"/>`)
    .replace(/<a:ext cx="\d+" cy="\d+"\/>/, `<a:ext cx="${w}" cy="${h}"/>`);

  zip.file(spec.part, xml.replace(INLINE_LOGO_RUN, () => sized));
  zip.file(spec.media, logoPng);
}

function removeInlineLogo(zip, spec) {
  const xml = zip.file(spec.part).asText();
  zip.file(spec.part, xml.replace(INLINE_LOGO_RUN, ''));
}

// logoPng: PNG Buffer of the profile logo, or null.
function generateDocxBuffer(data, logoPng) {
  const template = TEMPLATES[data.template] || TEMPLATES.classique;
  let content;
  try {
    content = fs.readFileSync(path.join(TEMPLATES_DIR, template.file), 'binary');
  } catch (err) {
    throw new AppError('TEMPLATE_MISSING', err);
  }
  const zip = new PizZip(content);

  if (template.logo) {
    if (logoPng) patchInlineLogo(zip, template.logo, logoPng);
    else removeInlineLogo(zip, template.logo);
  } else if (logoPng) {
    patchHeaderLogo(zip, logoPng);
  } else {
    removeHeaderLogo(zip);
  }

  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true, nullGetter: () => '' });
  doc.render(data);
  return doc.getZip().generate({ type: 'nodebuffer' });
}

module.exports = { generateDocxBuffer };
