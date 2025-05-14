import React, { ReactNode, useEffect, useState } from 'react';
import { WebSocketProvider as WSProvider } from '../contexts/WebSocketContext';
import { useConfig } from '../hooks/useConfig';
import { useAuth } from '../hooks/useAuth';

export interface WebSocketProviderProps {
  children: ReactNode;
}

/**
 * Global WebSocket provider that connects to the API gateway
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { config } = useConfig();
  const { isAuthenticated, getToken } = useAuth();
  const [wsUrl, setWsUrl] = useState<string>('');

  // Update WebSocket URL when config or auth state changes
  useEffect(() => {
    if (!config || !config.apiGateway || !config.apiGateway.wsUrl) {
      return;
    }

    let url = config.apiGateway.wsUrl;

    // Add authentication token if authenticated
    if (isAuthenticated) {
      const token = getToken();
      if (token) {
        // Add token as query parameter
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}token=${encodeURIComponent(token)}`;
      }
    }

    setWsUrl(url);
  }, [config, isAuthenticated, getToken]);

  // Don't render provider until we have a URL
  if (!wsUrl) {
    return <>{children}</>;
  }

  return (
    <WSProvider
      url={wsUrl}
      options={{
        autoReconnect: true,
        maxReconnectAttempts: 10,
        reconnectDelay: 1000,
        reconnectBackoffFactor: 1.5,
        maxReconnectDelay: 30000,
        pingInterval: 30000,
        pingTimeout: 5000,
      }}
    >
      {children}
    </WSProvider>
  );
};

export default WebSocketProvider;
