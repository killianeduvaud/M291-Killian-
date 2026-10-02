const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const store = require('./src/store');
const { generateDocxBuffer } = require('./src/docxGenerator');
const { generatePdfBuffer, buildQuoteHtml } = require('./src/pdfGenerator');
const { sampleQuote } = require('./src/sampleQuotes');
const { AppError, fileErrorKey, toPayload } = require('./src/errors');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 840,
    minWidth: 860,
    minHeight: 600,
    // Hidden title bar: each view's top bar is the drag area (see styles.css),
    // with the traffic lights centred in its 52px height.
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 19 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

function buildMenu() {
  const template = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [{
        label: 'Revoir le tutoriel',
        click: () => mainWindow && mainWindow.webContents.send('menu:tutorial'),
      }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Every IPC call answers { ok: true, value } or { ok: false, error } where
// error carries a code and a readable message (see src/errors.js).
function handle(channel, fallbackError, fn) {
  ipcMain.handle(channel, async (...args) => {
    try {
      return { ok: true, value: await fn(...args) };
    } catch (err) {
      console.error(`[${channel}]`, err);
      return { ok: false, error: toPayload(err, fallbackError) };
    }
  });
}

// --- Profiles -----------------------------------------------------------

handle('profiles:list', 'PROFILE_LIST_FAILED', () => store.listProfiles());

handle('profiles:get', 'PROFILE_NOT_FOUND', (_e, id) => store.getProfile(id));

handle('profiles:save', 'PROFILE_SAVE_FAILED', (_e, profile) => store.saveProfile(profile));

handle('profiles:delete', 'PROFILE_DELETE_FAILED', (_e, id) => {
  store.deleteProfile(id);
  return true;
});

handle('profiles:pickLogo', 'LOGO_UNREADABLE', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choisir un logo',
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp'] }],
    properties: ['openFile'],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  const png = store.readLogoPng(filePath);
  return { filePath, dataUrl: `data:image/png;base64,${png.toString('base64')}` };
});

handle('profiles:logoPath', 'PROFILE_NOT_FOUND', (_e, id) => store.logoPngPath(id));

// --- Numbering ------------------------------------------------------------

handle('counters:peek', 'UNEXPECTED', () => store.peekNextNumbers());

// --- Templates --------------------------------------------------------------

handle('templates:preview', 'PREVIEW_FAILED', (_e, template) => {
  const { data, logoDataUrl } = sampleQuote(template);
  return buildQuoteHtml(data, logoDataUrl);
});

// --- Generation -------------------------------------------------------------

handle('generate:save', 'UNEXPECTED', async (_e, { format, data, quoteNumber, clientNumber, logoPath, fileName }) => {
  const defaultName = fileName || `Devis-${quoteNumber || 'nouveau'}`;
  const filters = format === 'pdf'
    ? [{ name: 'PDF', extensions: ['pdf'] }]
    : [{ name: 'Word', extensions: ['docx'] }];

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Enregistrer le devis',
    defaultPath: `${defaultName}.${format}`,
    filters,
  });

  if (result.canceled || !result.filePath) return { canceled: true };

  const logoPng = logoPath && fs.existsSync(logoPath) ? store.readLogoPng(logoPath) : null;

  let buffer;
  if (format === 'docx') {
    try {
      buffer = generateDocxBuffer(data, logoPng);
    } catch (err) {
      throw err instanceof AppError ? err : new AppError('WORD_GENERATION_FAILED', err);
    }
  } else {
    try {
      buffer = await generatePdfBuffer(data, logoPng && `data:image/png;base64,${logoPng.toString('base64')}`);
    } catch (err) {
      throw err instanceof AppError ? err : new AppError('PDF_GENERATION_FAILED', err);
    }
  }

  try {
    fs.writeFileSync(result.filePath, buffer);
  } catch (err) {
    throw new AppError(fileErrorKey(err) || 'FILE_WRITE_FAILED', err);
  }

  try {
    store.commitUsedNumbers({ quoteNumber, clientNumber });
  } catch (err) {
    throw new AppError('NUMBERING_FAILED', err);
  }

  return { canceled: false, filePath: result.filePath };
});
