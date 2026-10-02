const { contextBridge, ipcRenderer } = require('electron');

// The main process answers { ok, value } or { ok: false, error }. Errors are
// thrown as plain objects { code, name, title, message, hint, details } so
// they keep all their fields when crossing into the page.
async function call(channel, ...args) {
  const res = await ipcRenderer.invoke(channel, ...args);
  if (!res.ok) throw res.error;
  return res.value;
}

contextBridge.exposeInMainWorld('api', {
  listProfiles: () => call('profiles:list'),
  getProfile: (id) => call('profiles:get', id),
  saveProfile: (profile) => call('profiles:save', profile),
  deleteProfile: (id) => call('profiles:delete', id),
  pickLogo: () => call('profiles:pickLogo'),
  getLogoPath: (id) => call('profiles:logoPath', id),

  peekNextNumbers: () => call('counters:peek'),
  previewTemplate: (template) => call('templates:preview', template),

  generateAndSave: (payload) => call('generate:save', payload),

  onShowTutorial: (callback) => ipcRenderer.on('menu:tutorial', () => callback()),
});
