import { useState, useEffect, useCallback, useRef } from 'react';
import webSocketService, { WebSocketStatus, WebSocketMessage, WebSocketOptions } from '../services/WebSocketService';

export interface UseWebSocketOptions extends WebSocketOptions {
  /**
   * Connect automatically on mount
   */
  autoConnect?: boolean;
  /**
   * Reconnect automatically on URL change
   */
  reconnectOnUrlChange?: boolean;
}

export interface UseWebSocketResult {
  /**
   * Current WebSocket status
   */
  status: WebSocketStatus;
  /**
   * Last received message
   */
  lastMessage: WebSocketMessage | null;
  /**
   * Last error
   */
  lastError: Error | Event | null;
  /**
   * Send message to WebSocket server
   */
  sendMessage: (message: WebSocketMessage) => Promise<void>;
  /**
   * Connect to WebSocket server
   */
  connect: () => void;
  /**
   * Disconnect from WebSocket server
   */
  disconnect: () => void;
  /**
   * Check if WebSocket is connected
   */
  isConnected: boolean;
  /**
   * Current reconnection attempt
   */
  reconnectAttempt: number;
}

/**
 * Hook for WebSocket communication
 * @param url WebSocket server URL
 * @param options WebSocket options
 * @returns WebSocket state and methods
 */
export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketResult => {
  const {
    autoConnect = true,
    reconnectOnUrlChange = true,
    ...wsOptions
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>(webSocketService.getStatus());
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [lastError, setLastError] = useState<Error | Event | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);
  const urlRef = useRef<string>(url);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    webSocketService.connect(urlRef.current, wsOptions);
  }, [wsOptions]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Send message to WebSocket server
  const sendMessage = useCallback(async (message: WebSocketMessage) => {
    return webSocketService.send(message);
  }, []);

  // Update URL ref when URL changes
  useEffect(() => {
    const previousUrl = urlRef.current;
    urlRef.current = url;

    // Reconnect if URL changed and reconnectOnUrlChange is true
    if (previousUrl !== url && reconnectOnUrlChange) {
      disconnect();
      connect();
    }
  }, [url, reconnectOnUrlChange, connect, disconnect]);

  // Set up event listeners
  useEffect(() => {
    const handleStatus = (newStatus: WebSocketStatus) => {
      setStatus(newStatus);
    };

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
    };

    const handleError = (error: Error | Event) => {
      setLastError(error);
    };

    const handleReconnectAttempt = (attempt: number) => {
      setReconnectAttempt(attempt);
    };

    // Add event listeners
    webSocketService.on('status', handleStatus);
    webSocketService.on('message', handleMessage);
    webSocketService.on('error', handleError);
    webSocketService.on('reconnect_attempt', handleReconnectAttempt);

    // Connect if autoConnect is true
    if (autoConnect) {
      connect();
    }

    // Remove event listeners on cleanup
    return () => {
      webSocketService.off('status', handleStatus);
      webSocketService.off('message', handleMessage);
      webSocketService.off('error', handleError);
      webSocketService.off('reconnect_attempt', handleReconnectAttempt);
    };
  }, [autoConnect, connect]);

  return {
    status,
    lastMessage,
    lastError,
    sendMessage,
    connect,
    disconnect,
    isConnected: status === 'open',
    reconnectAttempt,
  };
};

export default useWebSocket;
