import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { join } from 'path';
import log from 'electron-log';
import UpdaterService from './services/UpdaterService';

// Configure logger
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Disable hardware acceleration for Windows 7
if (process.platform === 'win32' && parseInt(process.versions.electron) <= 9) {
  app.disableHardwareAcceleration();
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName());
}

// Ensure single instance
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Global references
let mainWindow: BrowserWindow | null = null;

// Create updater service
const updaterService = new UpdaterService({
  checkOnStartup: true,
  autoDownload: true,
  autoInstallOnAppQuit: true,
  allowPrerelease: false,
  showNotifications: true,
  updateCheckInterval: 60 * 60 * 1000, // 1 hour
  provider: 'github',
  owner: 'krozenking',
  repo: 'ALT_LAS',
});

/**
 * Create the main window
 */
async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      sandbox: false,
    },
    // Set window properties
    title: 'ALT_LAS Desktop UI',
    backgroundColor: '#2e2c29',
    autoHideMenuBar: true,
  });

  // Load the app
  if (MAIN_WINDOW_WEBPACK_ENTRY) {
    await mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Initialize updater service
  updaterService.initialize(mainWindow);

  // Log app start
  log.info('Application started');
}

/**
 * App ready event
 */
app.whenReady().then(async () => {
  await createWindow();

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

/**
 * Window all closed event
 */
app.on('window-all-closed', () => {
  // On macOS, applications stay active until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Second instance event
 */
app.on('second-instance', () => {
  // Focus the main window if a second instance is launched
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

/**
 * App will quit event
 */
app.on('will-quit', () => {
  // Clean up resources
  log.info('Application will quit');
});

/**
 * Uncaught exception event
 */
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
});

/**
 * Unhandled rejection event
 */
process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});

// IPC handlers
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});

ipcMain.handle('app:getPath', (_, name: string) => {
  return app.getPath(name as any);
});

ipcMain.handle('app:restart', () => {
  app.relaunch();
  app.exit(0);
});

// Export for tests
export { mainWindow };
