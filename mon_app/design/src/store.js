const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { app, nativeImage } = require('electron');
const { AppError } = require('./errors');

// Logos wider than this are scaled down: big images bloat the documents.
const LOGO_MAX_WIDTH = 1200;

function baseDir() {
  return app.getPath('userData');
}

function profilesDir() {
  const dir = path.join(baseDir(), 'profiles');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function configPath() {
  return path.join(baseDir(), 'config.json');
}

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf-8'));
  } catch {
    return { lastQuoteNumber: 0, lastClientNumber: 0 };
  }
}

function writeConfig(cfg) {
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
}

function pad4(n) {
  return String(n).padStart(4, '0');
}

function peekNextNumbers() {
  const cfg = readConfig();
  return {
    nextQuoteNumber: pad4((cfg.lastQuoteNumber || 0) + 1),
    nextClientNumber: pad4((cfg.lastClientNumber || 0) + 1),
  };
}

function commitUsedNumbers({ quoteNumber, clientNumber }) {
  const cfg = readConfig();
  const q = parseInt(String(quoteNumber).replace(/\D/g, ''), 10);
  const c = parseInt(String(clientNumber).replace(/\D/g, ''), 10);
  if (!Number.isNaN(q)) cfg.lastQuoteNumber = q;
  if (!Number.isNaN(c)) cfg.lastClientNumber = c;
  writeConfig(cfg);
}

function profileDir(id) {
  return path.join(profilesDir(), id);
}

function listProfiles() {
  const dir = profilesDir();
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      try {
        const p = JSON.parse(fs.readFileSync(path.join(dir, d.name, 'profile.json'), 'utf-8'));
        return { id: p.id, name: p.name, hasLogo: !!p.hasLogo };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

function getProfile(id) {
  const p = JSON.parse(fs.readFileSync(path.join(profileDir(id), 'profile.json'), 'utf-8'));
  if (p.hasLogo) {
    const logoPath = path.join(profileDir(id), 'logo.png');
    if (fs.existsSync(logoPath)) {
      p.logoDataUrl = nativeImage.createFromPath(logoPath).toDataURL();
    }
  }
  return p;
}

function saveProfile(profile) {
  const id = profile.id || crypto.randomUUID();
  const dir = profileDir(id);
  fs.mkdirSync(dir, { recursive: true });

  let hasLogo = false;
  if (profile.newLogoPath) {
    fs.writeFileSync(path.join(dir, 'logo.png'), readLogoPng(profile.newLogoPath));
    hasLogo = true;
  } else if (profile.removeLogo) {
    hasLogo = false;
    const logoPath = path.join(dir, 'logo.png');
    if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
  } else {
    hasLogo = fs.existsSync(path.join(dir, 'logo.png'));
  }

  const toStore = { ...profile, id, hasLogo };
  delete toStore.newLogoPath;
  delete toStore.removeLogo;
  delete toStore.logoDataUrl;

  fs.writeFileSync(path.join(dir, 'profile.json'), JSON.stringify(toStore, null, 2));
  return { id, name: toStore.name, hasLogo };
}

function deleteProfile(id) {
  fs.rmSync(profileDir(id), { recursive: true, force: true });
}

// Reads an image file as PNG, scaled down to LOGO_MAX_WIDTH if needed.
function readLogoPng(filePath) {
  let img = nativeImage.createFromPath(filePath);
  if (img.isEmpty()) throw new AppError('LOGO_UNREADABLE', new Error(`Image vide ou format non reconnu : ${path.basename(filePath)}`));
  if (img.getSize().width > LOGO_MAX_WIDTH) img = img.resize({ width: LOGO_MAX_WIDTH, quality: 'best' });
  return img.toPNG();
}

function logoPngPath(id) {
  const p = path.join(profileDir(id), 'logo.png');
  return fs.existsSync(p) ? p : null;
}

module.exports = {
  peekNextNumbers,
  commitUsedNumbers,
  listProfiles,
  getProfile,
  saveProfile,
  deleteProfile,
  logoPngPath,
  readLogoPng,
};
