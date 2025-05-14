import { useState, useEffect, useCallback } from 'react';
import { ErrorData } from '../../main/services/ErrorTrackingService';

// Declare electron global
declare global {
  interface Window {
    electron: {
      errorTracking: {
        captureError: (error: Error | string, additionalData?: Record<string, any>, source?: string, handled?: boolean) => Promise<void>;
        getErrorLog: () => Promise<ErrorData[]>;
        clearErrorLog: () => Promise<void>;
      };
    };
  }
}

/**
 * Error tracking hook result
 */
export interface UseErrorTrackingResult {
  /**
   * Error log
   */
  errorLog: ErrorData[];
  /**
   * Whether error log is loading
   */
  isLoading: boolean;
  /**
   * Capture error
   */
  captureError: (error: Error | string, additionalData?: Record<string, any>, source?: string, handled?: boolean) => Promise<void>;
  /**
   * Refresh error log
   */
  refreshErrorLog: () => Promise<void>;
  /**
   * Clear error log
   */
  clearErrorLog: () => Promise<void>;
  /**
   * Set up global error handler
   */
  setupGlobalErrorHandler: () => () => void;
}

/**
 * Hook for using error tracking
 * @returns Error tracking state and methods
 */
export const useErrorTracking = (): UseErrorTrackingResult => {
  const [errorLog, setErrorLog] = useState<ErrorData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Capture error
  const captureError = useCallback(async (
    error: Error | string,
    additionalData: Record<string, any> = {},
    source: string = 'renderer',
    handled: boolean = true
  ): Promise<void> => {
    try {
      await window.electron.errorTracking.captureError(error, additionalData, source, handled);
      await refreshErrorLog();
    } catch (err) {
      console.error('Failed to capture error:', err);
    }
  }, []);

  // Refresh error log
  const refreshErrorLog = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const log = await window.electron.errorTracking.getErrorLog();
      setErrorLog(log);
    } catch (error) {
      console.error('Failed to get error log:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error log
  const clearErrorLog = useCallback(async (): Promise<void> => {
    try {
      await window.electron.errorTracking.clearErrorLog();
      setErrorLog([]);
    } catch (error) {
      console.error('Failed to clear error log:', error);
    }
  }, []);

  // Set up global error handler
  const setupGlobalErrorHandler = useCallback(() => {
    // Save original error handlers
    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    // Set up error handler
    window.onerror = (message, source, lineno, colno, error) => {
      captureError(
        error || String(message),
        { source, lineno, colno },
        'renderer',
        false
      );

      // Call original handler
      if (typeof originalOnError === 'function') {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Set up unhandled rejection handler
    window.onunhandledrejection = (event) => {
      const reason = event.reason;
      captureError(
        reason instanceof Error ? reason : String(reason),
        {},
        'renderer',
        false
      );

      // Call original handler
      if (typeof originalOnUnhandledRejection === 'function') {
        return originalOnUnhandledRejection(event);
      }
    };

    // Return cleanup function
    return () => {
      window.onerror = originalOnError;
      window.onunhandledrejection = originalOnUnhandledRejection;
    };
  }, [captureError]);

  // Load error log on mount
  useEffect(() => {
    refreshErrorLog();
  }, [refreshErrorLog]);

  return {
    errorLog,
    isLoading,
    captureError,
    refreshErrorLog,
    clearErrorLog,
    setupGlobalErrorHandler,
  };
};

export default useErrorTracking;
