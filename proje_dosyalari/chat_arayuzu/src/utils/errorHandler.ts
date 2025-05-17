/**
 * Error Handler Utility
 *
 * This utility provides functions for handling and logging errors in the application.
 */

/**
 * Send error to backend logging service
 * @param error - The error object or message
 * @param context - Additional context information
 */
export function logErrorToService(error: any, context?: Record<string, any>): void {
  // Hata nesnesini serileştirilebilir bir formata dönüştürelim
  const errorData = {
    message: error instanceof Error ? error.message : String(error),
    name: error instanceof Error ? error.name : 'Unknown',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    ...context
  };

  console.log("Sending error to server:", errorData); // DEBUG

  fetch('http://localhost:3000/log-client-error', {
    method: 'POST',
    body: JSON.stringify(errorData),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true // Sayfa kapanırken isteğin tamamlanmasına yardımcı olabilir
  }).catch(err => {
    console.error('Failed to send error to server:', err);
  });
}

/**
 * Initialize global error handling
 */
export function initErrorHandling(): void {
  // Global hataları yakalama
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', {
      message: event.message,
      source: event.filename,
      lineNo: event.lineno,
      colNo: event.colno,
      error: event.error
    });

    logErrorToService(event.error || event.message, {
      type: 'window.error',
      source: event.filename,
      lineNo: event.lineno,
      colNo: event.colno
    });

    // Hatanın diğer dinleyicilere de ulaşmasına izin verelim
    return false;
  });

  // Promise rejection'ları yakalama
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    logErrorToService(event.reason, {
      type: 'unhandledrejection',
      promise: String(event.promise)
    });

    // Hatanın diğer dinleyicilere de ulaşmasına izin verelim
    return false;
  });

  // console.error override
  const originalConsoleError = console.error;
  console.error = function (...args) {
    originalConsoleError(...args);

    // İlk argümanı hata olarak gönderelim
    const errorMessage = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    logErrorToService(errorMessage, {
      type: 'console.error',
      args: args.map(arg => typeof arg)
    });
  };

  console.log('Global error handling initialized');
}

/**
 * Log an error with additional context
 * @param error - The error object
 * @param context - Additional context information
 */
export function logError(error: Error, context?: Record<string, any>): void {
  console.error('Application error:', {
    message: error.message,
    stack: error.stack,
    ...context
  });

  // Send errors to logging service with application context
  logErrorToService(error, {
    type: 'application.error',
    ...context
  });
}

/**
 * Try to execute a function and catch any errors
 * @param fn - The function to execute
 * @param errorHandler - Optional custom error handler
 * @returns The result of the function or undefined if an error occurred
 */
export function tryCatch<T>(
  fn: () => T,
  errorHandler?: (error: Error) => void
): T | undefined {
  try {
    return fn();
  } catch (error) {
    if (error instanceof Error) {
      if (errorHandler) {
        errorHandler(error);
      } else {
        logError(error);
      }
    } else {
      console.error('Unknown error:', error);
    }
    return undefined;
  }
}

/**
 * Create an async function that catches errors
 * @param fn - The async function to wrap
 * @param errorHandler - Optional custom error handler
 * @returns A new function that catches errors
 */
export function asyncTryCatch<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler?: (error: Error) => void
): (...args: Args) => Promise<T | undefined> {
  return async (...args: Args): Promise<T | undefined> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        if (errorHandler) {
          errorHandler(error);
        } else {
          logError(error);
        }
      } else {
        console.error('Unknown async error:', error);
      }
      return undefined;
    }
  };
}
