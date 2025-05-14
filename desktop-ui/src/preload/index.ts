import { contextBridge, ipcRenderer } from 'electron';
import { UpdateDetails } from '../main/services/UpdaterService';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    restart: () => ipcRenderer.invoke('app:restart'),
  },
  
  // Update methods
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('update:check'),
    downloadUpdate: () => ipcRenderer.invoke('update:download'),
    installUpdate: () => ipcRenderer.invoke('update:install'),
    getUpdateDetails: () => ipcRenderer.invoke('update:getDetails'),
    onUpdateStatus: (callback: (details: UpdateDetails) => void) => {
      const subscription = (_: any, details: UpdateDetails) => callback(details);
      ipcRenderer.on('update-status', subscription);
      return () => {
        ipcRenderer.removeListener('update-status', subscription);
      };
    },
  },
  
  // IPC communication
  ipc: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, callback: (...args: any[]) => void) => {
      const subscription = (_: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.once(channel, (_: any, ...args: any[]) => callback(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
  },
});
