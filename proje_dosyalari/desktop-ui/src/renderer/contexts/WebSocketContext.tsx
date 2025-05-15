import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import useWebSocket, { UseWebSocketResult } from '../hooks/useWebSocket';
import { WebSocketMessage, WebSocketOptions } from '../services/WebSocketService';

export interface WebSocketContextValue extends UseWebSocketResult {
  /**
   * Subscribe to specific message types
   */
  subscribe: <T = any>(type: string, callback: (payload: T) => void) => () => void;
  /**
   * Send message with type and payload
   */
  send: <T = any>(type: string, payload?: T) => Promise<void>;
  /**
   * Send request and wait for response
   */
  request: <TReq = any, TRes = any>(type: string, payload?: TReq) => Promise<TRes>;
}

// Create context
const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export interface WebSocketProviderProps {
  /**
   * WebSocket server URL
   */
  url: string;
  /**
   * WebSocket options
   */
  options?: WebSocketOptions;
  /**
   * Children components
   */
  children: ReactNode;
}

/**
 * WebSocket context provider
 */
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  url,
  options,
  children,
}) => {
  const ws = useWebSocket(url, options);
  const [subscriptions, setSubscriptions] = useState<Map<string, Set<(payload: any) => void>>>(new Map());
  const [requestCallbacks, setRequestCallbacks] = useState<Map<string, (response: any) => void>>(new Map());

  // Handle incoming messages
  useEffect(() => {
    if (!ws.lastMessage) return;

    const { type, payload, id, error } = ws.lastMessage;

    // Handle response messages
    if (id && requestCallbacks.has(id)) {
      const callback = requestCallbacks.get(id);
      if (callback) {
        if (error) {
          callback({ error });
        } else {
          callback(payload);
        }
        // Remove callback after handling
        setRequestCallbacks(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    }

    // Handle subscription messages
    if (type && subscriptions.has(type)) {
      const callbacks = subscriptions.get(type);
      if (callbacks) {
        callbacks.forEach(callback => {
          callback(payload);
        });
      }
    }
  }, [ws.lastMessage, subscriptions, requestCallbacks]);

  // Subscribe to message type
  const subscribe = useCallback(<T = any>(type: string, callback: (payload: T) => void) => {
    setSubscriptions(prev => {
      const next = new Map(prev);
      const callbacks = next.get(type) || new Set();
      callbacks.add(callback as any);
      next.set(type, callbacks);
      return next;
    });

    // Return unsubscribe function
    return () => {
      setSubscriptions(prev => {
        const next = new Map(prev);
        const callbacks = next.get(type);
        if (callbacks) {
          callbacks.delete(callback as any);
          if (callbacks.size === 0) {
            next.delete(type);
          } else {
            next.set(type, callbacks);
          }
        }
        return next;
      });
    };
  }, []);

  // Send message with type and payload
  const send = useCallback(async <T = any>(type: string, payload?: T) => {
    return ws.sendMessage({ type, payload });
  }, [ws.sendMessage]);

  // Send request and wait for response
  const request = useCallback(async <TReq = any, TRes = any>(type: string, payload?: TReq): Promise<TRes> => {
    return new Promise((resolve, reject) => {
      // Generate unique ID for request
      const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add callback to request callbacks
      setRequestCallbacks(prev => {
        const next = new Map(prev);
        next.set(id, (response: any) => {
          if (response && response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
        return next;
      });

      // Send request
      ws.sendMessage({ type, payload, id }).catch(reject);

      // Set timeout for request
      setTimeout(() => {
        setRequestCallbacks(prev => {
          const next = new Map(prev);
          if (next.has(id)) {
            next.delete(id);
            reject(new Error('Request timeout'));
          }
          return next;
        });
      }, 30000); // 30 seconds timeout
    });
  }, [ws.sendMessage]);

  // Context value
  const value: WebSocketContextValue = {
    ...ws,
    subscribe,
    send,
    request,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

/**
 * Hook to use WebSocket context
 */
export const useWebSocketContext = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
