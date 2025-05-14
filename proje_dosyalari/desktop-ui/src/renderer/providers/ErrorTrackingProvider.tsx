import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { ErrorBoundary } from '../components/error-tracking/ErrorBoundary';
import useErrorTracking, { UseErrorTrackingResult } from '../hooks/useErrorTracking';

// Create context
const ErrorTrackingContext = createContext<UseErrorTrackingResult | undefined>(undefined);

export interface ErrorTrackingProviderProps {
  /**
   * Children components
   */
  children: ReactNode;
  /**
   * Whether to set up global error handler
   */
  setupGlobalHandler?: boolean;
  /**
   * Whether to use error boundary
   */
  useErrorBoundary?: boolean;
  /**
   * Error boundary fallback component
   */
  fallback?: ReactNode;
  /**
   * Whether to reset error boundary on error
   */
  resetOnError?: boolean;
  /**
   * Reset timeout in milliseconds
   */
  resetTimeout?: number;
}

/**
 * Error tracking provider component
 */
export const ErrorTrackingProvider: React.FC<ErrorTrackingProviderProps> = ({
  children,
  setupGlobalHandler = true,
  useErrorBoundary = true,
  fallback,
  resetOnError = false,
  resetTimeout = 5000,
}) => {
  const errorTracking = useErrorTracking();

  // Set up global error handler
  useEffect(() => {
    if (setupGlobalHandler) {
      const cleanup = errorTracking.setupGlobalErrorHandler();
      return cleanup;
    }
  }, [setupGlobalHandler, errorTracking]);

  // Render with error boundary
  if (useErrorBoundary) {
    return (
      <ErrorTrackingContext.Provider value={errorTracking}>
        <ErrorBoundary
          captureError={errorTracking.captureError}
          fallback={fallback}
          resetOnError={resetOnError}
          resetTimeout={resetTimeout}
        >
          {children}
        </ErrorBoundary>
      </ErrorTrackingContext.Provider>
    );
  }

  // Render without error boundary
  return (
    <ErrorTrackingContext.Provider value={errorTracking}>
      {children}
    </ErrorTrackingContext.Provider>
  );
};

/**
 * Hook to use error tracking context
 * @returns Error tracking context
 */
export const useErrorTrackingContext = (): UseErrorTrackingResult => {
  const context = useContext(ErrorTrackingContext);
  if (!context) {
    throw new Error('useErrorTrackingContext must be used within an ErrorTrackingProvider');
  }
  return context;
};

export default ErrorTrackingProvider;
