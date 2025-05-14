import { useState, useEffect } from 'react';

export interface ApiGatewayConfig {
  baseUrl: string;
  wsUrl: string;
  timeout: number;
}

export interface AppConfig {
  apiGateway: ApiGatewayConfig;
  appName: string;
  appVersion: string;
  environment: 'development' | 'production' | 'test';
  features: Record<string, boolean>;
  [key: string]: any;
}

export interface UseConfigResult {
  config: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * Hook to access application configuration
 */
export const useConfig = (): UseConfigResult => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load configuration
  const loadConfig = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real application, this would load from a config file or API
      // For now, we'll use a mock configuration
      const mockConfig: AppConfig = {
        apiGateway: {
          baseUrl: 'http://localhost:8080/api',
          wsUrl: 'ws://localhost:8080/ws',
          timeout: 30000,
        },
        appName: 'ALT_LAS Desktop UI',
        appVersion: '0.1.0',
        environment: process.env.NODE_ENV as 'development' | 'production' | 'test',
        features: {
          darkMode: true,
          notifications: true,
          offlineMode: false,
        },
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setConfig(mockConfig);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load configuration'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Reload configuration
  const reload = async (): Promise<void> => {
    await loadConfig();
  };

  return {
    config,
    isLoading,
    error,
    reload,
  };
};

export default useConfig;
