const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  appVersion: () => ipcRenderer.invoke('get-app-version'),
  // Add any other methods you need to expose here
});
