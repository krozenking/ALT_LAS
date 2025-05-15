import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { autoUpdater, UpdateCheckResult, UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import { EventEmitter } from 'events';

/**
 * Update status
 */
export enum UpdateStatus {
  CHECKING = 'checking',
  AVAILABLE = 'available',
  NOT_AVAILABLE = 'not-available',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded',
  ERROR = 'error',
}

/**
 * Update progress
 */
export interface UpdateProgress {
  /**
   * Download percentage (0-100)
   */
  percent: number;
  /**
   * Bytes per second
   */
  bytesPerSecond: number;
  /**
   * Total bytes
   */
  total: number;
  /**
   * Transferred bytes
   */
  transferred: number;
}

/**
 * Update info
 */
export interface UpdateDetails {
  /**
   * Update status
   */
  status: UpdateStatus;
  /**
   * Update info
   */
  info?: UpdateInfo;
  /**
   * Update progress
   */
  progress?: UpdateProgress;
  /**
   * Error message
   */
  error?: string;
}

/**
 * Updater service options
 */
export interface UpdaterServiceOptions {
  /**
   * Whether to check for updates on startup
   */
  checkOnStartup?: boolean;
  /**
   * Whether to download updates automatically
   */
  autoDownload?: boolean;
  /**
   * Whether to install updates automatically when the app is closed
   */
  autoInstallOnAppQuit?: boolean;
  /**
   * Whether to allow prerelease versions
   */
  allowPrerelease?: boolean;
  /**
   * Whether to show notifications
   */
  showNotifications?: boolean;
  /**
   * Update check interval in milliseconds
   */
  updateCheckInterval?: number;
  /**
   * GitHub repository owner
   */
  owner?: string;
  /**
   * GitHub repository name
   */
  repo?: string;
  /**
   * Provider type (github, s3, etc.)
   */
  provider?: 'github' | 's3' | 'generic' | 'custom';
  /**
   * Update server URL (for generic provider)
   */
  updateServerUrl?: string;
}

/**
 * Default updater service options
 */
const DEFAULT_OPTIONS: UpdaterServiceOptions = {
  checkOnStartup: true,
  autoDownload: true,
  autoInstallOnAppQuit: true,
  allowPrerelease: false,
  showNotifications: true,
  updateCheckInterval: 60 * 60 * 1000, // 1 hour
  provider: 'github',
};

/**
 * Updater service for automatic updates
 */
class UpdaterService extends EventEmitter {
  private options: UpdaterServiceOptions;
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private updateDetails: UpdateDetails = { status: UpdateStatus.NOT_AVAILABLE };
  private isInitialized: boolean = false;

  /**
   * Constructor
   * @param options Updater service options
   */
  constructor(options: UpdaterServiceOptions = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Configure logger
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    
    // Configure auto updater
    autoUpdater.autoDownload = this.options.autoDownload!;
    autoUpdater.autoInstallOnAppQuit = this.options.autoInstallOnAppQuit!;
    autoUpdater.allowPrerelease = this.options.allowPrerelease!;
    
    // Set provider
    if (this.options.provider === 'github' && this.options.owner && this.options.repo) {
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: this.options.owner,
        repo: this.options.repo,
      });
    } else if (this.options.provider === 'generic' && this.options.updateServerUrl) {
      autoUpdater.setFeedURL({
        provider: 'generic',
        url: this.options.updateServerUrl,
      });
    }
  }

  /**
   * Initialize updater service
   * @param mainWindow Main window
   */
  public initialize(mainWindow: BrowserWindow): void {
    if (this.isInitialized) {
      return;
    }
    
    this.mainWindow = mainWindow;
    this.setupEventListeners();
    this.setupIpcHandlers();
    
    // Check for updates on startup
    if (this.options.checkOnStartup) {
      this.checkForUpdates();
    }
    
    // Set up update check interval
    if (this.options.updateCheckInterval && this.options.updateCheckInterval > 0) {
      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates();
      }, this.options.updateCheckInterval);
    }
    
    this.isInitialized = true;
  }

  /**
   * Check for updates
   * @returns Promise with update check result
   */
  public async checkForUpdates(): Promise<UpdateCheckResult | null> {
    if (app.isPackaged) {
      try {
        this.updateDetails = { status: UpdateStatus.CHECKING };
        this.emitUpdateStatus();
        
        const result = await autoUpdater.checkForUpdates();
        return result;
      } catch (error) {
        this.handleError(error as Error);
        return null;
      }
    } else {
      log.info('Update check skipped in development mode');
      return null;
    }
  }

  /**
   * Download update
   */
  public downloadUpdate(): void {
    if (this.updateDetails.status === UpdateStatus.AVAILABLE) {
      autoUpdater.downloadUpdate();
    }
  }

  /**
   * Install update
   */
  public installUpdate(): void {
    if (this.updateDetails.status === UpdateStatus.DOWNLOADED) {
      autoUpdater.quitAndInstall(false, true);
    }
  }

  /**
   * Get update details
   * @returns Update details
   */
  public getUpdateDetails(): UpdateDetails {
    return this.updateDetails;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Checking for update
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.updateDetails = { status: UpdateStatus.CHECKING };
      this.emitUpdateStatus();
    });

    // Update available
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      log.info('Update available:', info);
      this.updateDetails = { status: UpdateStatus.AVAILABLE, info };
      this.emitUpdateStatus();
      
      if (this.options.showNotifications) {
        this.showUpdateAvailableNotification(info);
      }
    });

    // Update not available
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      log.info('Update not available:', info);
      this.updateDetails = { status: UpdateStatus.NOT_AVAILABLE, info };
      this.emitUpdateStatus();
    });

    // Download progress
    autoUpdater.on('download-progress', (progress: UpdateProgress) => {
      log.info(`Download progress: ${progress.percent.toFixed(2)}%`);
      this.updateDetails = {
        status: UpdateStatus.DOWNLOADING,
        info: this.updateDetails.info,
        progress,
      };
      this.emitUpdateStatus();
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      log.info('Update downloaded:', info);
      this.updateDetails = { status: UpdateStatus.DOWNLOADED, info };
      this.emitUpdateStatus();
      
      if (this.options.showNotifications) {
        this.showUpdateDownloadedNotification(info);
      }
    });

    // Error
    autoUpdater.on('error', (error: Error) => {
      this.handleError(error);
    });
  }

  /**
   * Set up IPC handlers
   */
  private setupIpcHandlers(): void {
    // Check for updates
    ipcMain.handle('update:check', async () => {
      return this.checkForUpdates();
    });

    // Download update
    ipcMain.handle('update:download', () => {
      this.downloadUpdate();
    });

    // Install update
    ipcMain.handle('update:install', () => {
      this.installUpdate();
    });

    // Get update details
    ipcMain.handle('update:getDetails', () => {
      return this.updateDetails;
    });
  }

  /**
   * Emit update status
   */
  private emitUpdateStatus(): void {
    this.emit('update-status', this.updateDetails);
    
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('update-status', this.updateDetails);
    }
  }

  /**
   * Handle error
   * @param error Error
   */
  private handleError(error: Error): void {
    log.error('Update error:', error);
    this.updateDetails = {
      status: UpdateStatus.ERROR,
      error: error.message,
    };
    this.emitUpdateStatus();
  }

  /**
   * Show update available notification
   * @param info Update info
   */
  private showUpdateAvailableNotification(info: UpdateInfo): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return;
    }
    
    const dialogOptions = {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available.`,
      detail: `Would you like to download it now?\n\nRelease notes:\n${info.releaseNotes || 'No release notes available.'}`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1,
    };
    
    dialog.showMessageBox(this.mainWindow, dialogOptions).then(({ response }) => {
      if (response === 0) {
        this.downloadUpdate();
      }
    });
  }

  /**
   * Show update downloaded notification
   * @param info Update info
   */
  private showUpdateDownloadedNotification(info: UpdateInfo): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      return;
    }
    
    const dialogOptions = {
      type: 'info',
      title: 'Update Ready',
      message: `A new version (${info.version}) has been downloaded.`,
      detail: 'The update will be installed when you restart the application. Would you like to restart now?',
      buttons: ['Restart', 'Later'],
      defaultId: 0,
      cancelId: 1,
    };
    
    dialog.showMessageBox(this.mainWindow, dialogOptions).then(({ response }) => {
      if (response === 0) {
        this.installUpdate();
      }
    });
  }
}

export default UpdaterService;
