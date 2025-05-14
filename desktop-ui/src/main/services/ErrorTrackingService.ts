import { app, BrowserWindow, dialog } from 'electron';
import { EventEmitter } from 'events';
import log from 'electron-log';
import * as Sentry from '@sentry/electron';
import { RewriteFrames } from '@sentry/integrations';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

/**
 * Error tracking service options
 */
export interface ErrorTrackingOptions {
  /**
   * Whether to enable Sentry error tracking
   */
  enableSentry?: boolean;
  /**
   * Sentry DSN
   */
  sentryDsn?: string;
  /**
   * Environment name
   */
  environment?: string;
  /**
   * Whether to show error dialogs
   */
  showErrorDialog?: boolean;
  /**
   * Whether to log errors to file
   */
  logToFile?: boolean;
  /**
   * Log file path
   */
  logFilePath?: string;
  /**
   * Maximum number of errors to keep in the log file
   */
  maxErrorsInLog?: number;
  /**
   * Whether to track renderer process errors
   */
  trackRendererErrors?: boolean;
  /**
   * Whether to track unhandled rejections
   */
  trackUnhandledRejections?: boolean;
  /**
   * Whether to track uncaught exceptions
   */
  trackUncaughtExceptions?: boolean;
  /**
   * Whether to include PII (Personally Identifiable Information)
   */
  includePII?: boolean;
  /**
   * Whether to include stack traces
   */
  includeStackTraces?: boolean;
}

/**
 * Error data interface
 */
export interface ErrorData {
  /**
   * Error message
   */
  message: string;
  /**
   * Error name
   */
  name: string;
  /**
   * Error stack trace
   */
  stack?: string;
  /**
   * Error timestamp
   */
  timestamp: number;
  /**
   * Error source
   */
  source: 'main' | 'renderer' | 'preload' | 'unknown';
  /**
   * Additional data
   */
  data?: Record<string, any>;
  /**
   * Whether the error was handled
   */
  handled: boolean;
}

/**
 * Default error tracking options
 */
const DEFAULT_OPTIONS: ErrorTrackingOptions = {
  enableSentry: false,
  sentryDsn: '',
  environment: process.env.NODE_ENV || 'production',
  showErrorDialog: false,
  logToFile: true,
  logFilePath: '',
  maxErrorsInLog: 100,
  trackRendererErrors: true,
  trackUnhandledRejections: true,
  trackUncaughtExceptions: true,
  includePII: false,
  includeStackTraces: true,
};

/**
 * Error tracking service
 */
class ErrorTrackingService extends EventEmitter {
  private options: Required<ErrorTrackingOptions>;
  private mainWindow: BrowserWindow | null = null;
  private errorLog: ErrorData[] = [];
  private isInitialized: boolean = false;

  /**
   * Constructor
   * @param options Error tracking options
   */
  constructor(options: ErrorTrackingOptions = {}) {
    super();
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<ErrorTrackingOptions>;
    
    // Set default log file path if not provided
    if (!this.options.logFilePath) {
      this.options.logFilePath = join(app.getPath('userData'), 'logs', 'errors.json');
    }
    
    // Load error log from file
    this.loadErrorLog();
  }

  /**
   * Initialize error tracking service
   * @param mainWindow Main window
   */
  public initialize(mainWindow: BrowserWindow): void {
    if (this.isInitialized) {
      return;
    }
    
    this.mainWindow = mainWindow;
    
    // Initialize Sentry if enabled
    if (this.options.enableSentry && this.options.sentryDsn) {
      this.initializeSentry();
    }
    
    // Set up global error handlers
    this.setupErrorHandlers();
    
    // Set up IPC handlers
    this.setupIpcHandlers();
    
    this.isInitialized = true;
    log.info('Error tracking service initialized');
  }

  /**
   * Capture error
   * @param error Error object
   * @param additionalData Additional data
   * @param source Error source
   * @param handled Whether the error was handled
   */
  public captureError(
    error: Error | string,
    additionalData: Record<string, any> = {},
    source: 'main' | 'renderer' | 'preload' | 'unknown' = 'main',
    handled: boolean = false
  ): void {
    // Create error data
    const errorData: ErrorData = {
      message: typeof error === 'string' ? error : error.message,
      name: typeof error === 'string' ? 'Error' : error.name,
      stack: typeof error === 'string' ? undefined : error.stack,
      timestamp: Date.now(),
      source,
      data: additionalData,
      handled,
    };
    
    // Log error
    log.error(`[${source}] ${errorData.name}: ${errorData.message}`, {
      stack: errorData.stack,
      data: errorData.data,
    });
    
    // Add to error log
    this.addToErrorLog(errorData);
    
    // Send to Sentry if enabled
    if (this.options.enableSentry && this.options.sentryDsn) {
      this.sendToSentry(errorData);
    }
    
    // Show error dialog if enabled
    if (this.options.showErrorDialog && this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.showErrorDialog(errorData);
    }
    
    // Emit error event
    this.emit('error', errorData);
  }

  /**
   * Get error log
   * @returns Error log
   */
  public getErrorLog(): ErrorData[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
    this.saveErrorLog();
    this.emit('clear');
  }

  /**
   * Initialize Sentry
   */
  private initializeSentry(): void {
    try {
      Sentry.init({
        dsn: this.options.sentryDsn,
        environment: this.options.environment,
        release: app.getVersion(),
        integrations: [
          new RewriteFrames({
            root: process.cwd(),
          }),
        ],
        beforeSend: (event) => {
          // Remove PII if not allowed
          if (!this.options.includePII) {
            if (event.user) {
              delete event.user;
            }
            
            if (event.request && event.request.headers) {
              delete event.request.headers.Authorization;
              delete event.request.headers.Cookie;
            }
          }
          
          // Remove stack traces if not allowed
          if (!this.options.includeStackTraces) {
            if (event.exception && event.exception.values) {
              event.exception.values.forEach((value) => {
                if (value.stacktrace) {
                  delete value.stacktrace;
                }
              });
            }
          }
          
          return event;
        },
      });
      
      // Set user if PII is allowed
      if (this.options.includePII) {
        Sentry.configureScope((scope) => {
          scope.setUser({
            id: app.getPath('userData'),
            username: require('os').userInfo().username,
          });
        });
      }
      
      log.info('Sentry initialized');
    } catch (error) {
      log.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Set up global error handlers
   */
  private setupErrorHandlers(): void {
    // Uncaught exceptions
    if (this.options.trackUncaughtExceptions) {
      process.on('uncaughtException', (error) => {
        this.captureError(error, {}, 'main', false);
      });
    }
    
    // Unhandled rejections
    if (this.options.trackUnhandledRejections) {
      process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.captureError(error, {}, 'main', false);
      });
    }
    
    // Renderer process errors
    if (this.options.trackRendererErrors && this.mainWindow) {
      this.mainWindow.webContents.on('render-process-gone', (event, details) => {
        this.captureError(
          `Renderer process gone: ${details.reason}`,
          { details },
          'renderer',
          false
        );
      });
      
      this.mainWindow.webContents.on('crashed', () => {
        this.captureError('Renderer process crashed', {}, 'renderer', false);
      });
    }
  }

  /**
   * Set up IPC handlers
   */
  private setupIpcHandlers(): void {
    // Capture error from renderer
    app.whenReady().then(() => {
      const { ipcMain } = require('electron');
      
      ipcMain.handle('error:capture', (event, errorData: ErrorData) => {
        this.captureError(
          errorData.message,
          errorData.data || {},
          errorData.source,
          errorData.handled
        );
      });
      
      ipcMain.handle('error:getLog', () => {
        return this.getErrorLog();
      });
      
      ipcMain.handle('error:clearLog', () => {
        this.clearErrorLog();
      });
    });
  }

  /**
   * Send error to Sentry
   * @param errorData Error data
   */
  private sendToSentry(errorData: ErrorData): void {
    try {
      Sentry.captureException(new Error(errorData.message), {
        tags: {
          source: errorData.source,
          handled: String(errorData.handled),
        },
        extra: errorData.data,
      });
    } catch (error) {
      log.error('Failed to send error to Sentry:', error);
    }
  }

  /**
   * Show error dialog
   * @param errorData Error data
   */
  private showErrorDialog(errorData: ErrorData): void {
    try {
      dialog.showErrorBox(
        `Error: ${errorData.name}`,
        `${errorData.message}\n\n${errorData.stack || ''}`
      );
    } catch (error) {
      log.error('Failed to show error dialog:', error);
    }
  }

  /**
   * Add error to log
   * @param errorData Error data
   */
  private addToErrorLog(errorData: ErrorData): void {
    this.errorLog.unshift(errorData);
    
    // Limit the number of errors in the log
    if (this.errorLog.length > this.options.maxErrorsInLog) {
      this.errorLog = this.errorLog.slice(0, this.options.maxErrorsInLog);
    }
    
    // Save to file if enabled
    if (this.options.logToFile) {
      this.saveErrorLog();
    }
  }

  /**
   * Load error log from file
   */
  private loadErrorLog(): void {
    if (!this.options.logToFile) {
      return;
    }
    
    try {
      // Create directory if it doesn't exist
      const logDir = join(this.options.logFilePath, '..');
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }
      
      // Read log file
      if (existsSync(this.options.logFilePath)) {
        const logData = readFileSync(this.options.logFilePath, 'utf-8');
        this.errorLog = JSON.parse(logData);
      }
    } catch (error) {
      log.error('Failed to load error log:', error);
      this.errorLog = [];
    }
  }

  /**
   * Save error log to file
   */
  private saveErrorLog(): void {
    if (!this.options.logToFile) {
      return;
    }
    
    try {
      // Create directory if it doesn't exist
      const logDir = join(this.options.logFilePath, '..');
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }
      
      // Write log file
      writeFileSync(this.options.logFilePath, JSON.stringify(this.errorLog, null, 2), 'utf-8');
    } catch (error) {
      log.error('Failed to save error log:', error);
    }
  }
}

// Create singleton instance
const errorTrackingService = new ErrorTrackingService();

export default errorTrackingService;
