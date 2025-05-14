import { EventEmitter } from 'events';

export type WebSocketStatus = 'connecting' | 'open' | 'closing' | 'closed' | 'error';

export interface WebSocketOptions {
  /**
   * Reconnect automatically if connection is closed
   */
  autoReconnect?: boolean;
  /**
   * Maximum number of reconnection attempts
   */
  maxReconnectAttempts?: number;
  /**
   * Delay between reconnection attempts in milliseconds
   */
  reconnectDelay?: number;
  /**
   * Backoff factor for reconnection delay
   */
  reconnectBackoffFactor?: number;
  /**
   * Maximum reconnection delay in milliseconds
   */
  maxReconnectDelay?: number;
  /**
   * Ping interval in milliseconds
   */
  pingInterval?: number;
  /**
   * Ping timeout in milliseconds
   */
  pingTimeout?: number;
  /**
   * WebSocket protocols
   */
  protocols?: string | string[];
  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout?: number;
  /**
   * Headers to send with the WebSocket connection
   */
  headers?: Record<string, string>;
}

export interface WebSocketMessage {
  type: string;
  payload?: any;
  id?: string;
  error?: string;
}

class WebSocketService extends EventEmitter {
  private socket: WebSocket | null = null;
  private url: string = '';
  private status: WebSocketStatus = 'closed';
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private pingTimeout: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private options: Required<WebSocketOptions> = {
    autoReconnect: true,
    maxReconnectAttempts: 10,
    reconnectDelay: 1000,
    reconnectBackoffFactor: 1.5,
    maxReconnectDelay: 30000,
    pingInterval: 30000,
    pingTimeout: 5000,
    protocols: [],
    connectionTimeout: 10000,
    headers: {},
  };

  /**
   * Connect to WebSocket server
   * @param url WebSocket server URL
   * @param options Connection options
   */
  public connect(url: string, options: WebSocketOptions = {}): void {
    this.url = url;
    this.options = { ...this.options, ...options };
    this.status = 'connecting';
    this.emit('status', this.status);

    try {
      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.status === 'connecting') {
          this.status = 'error';
          this.emit('status', this.status);
          this.emit('error', new Error('Connection timeout'));
          this.reconnect();
        }
      }, this.options.connectionTimeout);

      // Create WebSocket connection
      this.socket = new WebSocket(url, this.options.protocols);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
    } catch (error) {
      this.status = 'error';
      this.emit('status', this.status);
      this.emit('error', error);
      this.reconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    if (!this.socket) return;

    this.status = 'closing';
    this.emit('status', this.status);

    // Clear timeouts and intervals
    this.clearTimeouts();

    // Close socket
    try {
      this.socket.close();
    } catch (error) {
      this.emit('error', error);
    }

    this.socket = null;
    this.status = 'closed';
    this.emit('status', this.status);
  }

  /**
   * Send message to WebSocket server
   * @param message Message to send
   * @returns Promise that resolves when message is sent
   */
  public send(message: WebSocketMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || this.status !== 'open') {
        // Queue message if socket is not open
        this.messageQueue.push(message);
        return resolve();
      }

      try {
        this.socket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get current WebSocket status
   */
  public getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.status === 'open';
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.status = 'open';
    this.reconnectAttempts = 0;
    this.emit('status', this.status);
    this.emit('open');

    // Send queued messages
    this.sendQueuedMessages();

    // Start ping interval
    this.startPingInterval();
  }

  /**
   * Handle WebSocket close event
   * @param event Close event
   */
  private handleClose(event: CloseEvent): void {
    this.clearTimeouts();

    this.status = 'closed';
    this.emit('status', this.status);
    this.emit('close', event);

    // Reconnect if enabled
    this.reconnect();
  }

  /**
   * Handle WebSocket error event
   * @param event Error event
   */
  private handleError(event: Event): void {
    this.status = 'error';
    this.emit('status', this.status);
    this.emit('error', event);
  }

  /**
   * Handle WebSocket message event
   * @param event Message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;
      this.emit('message', message);

      // Handle ping/pong messages
      if (message.type === 'pong') {
        if (this.pingTimeout) {
          clearTimeout(this.pingTimeout);
          this.pingTimeout = null;
        }
      }
    } catch (error) {
      this.emit('error', new Error('Invalid message format'));
    }
  }

  /**
   * Reconnect to WebSocket server
   */
  private reconnect(): void {
    if (!this.options.autoReconnect) return;
    if (this.reconnectTimeout) return;
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.emit('reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(this.options.reconnectBackoffFactor, this.reconnectAttempts - 1),
      this.options.maxReconnectDelay
    );

    this.emit('reconnect_attempt', this.reconnectAttempts);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect(this.url, this.options);
    }, delay);
  }

  /**
   * Send queued messages
   */
  private sendQueuedMessages(): void {
    if (this.messageQueue.length === 0) return;

    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach(message => {
      this.send(message).catch(error => {
        this.emit('error', error);
      });
    });
  }

  /**
   * Start ping interval
   */
  private startPingInterval(): void {
    if (this.pingInterval) return;

    this.pingInterval = setInterval(() => {
      if (!this.socket || this.status !== 'open') return;

      // Send ping message
      this.send({ type: 'ping' }).catch(error => {
        this.emit('error', error);
      });

      // Set ping timeout
      this.pingTimeout = setTimeout(() => {
        this.emit('ping_timeout');
        this.disconnect();
        this.reconnect();
      }, this.options.pingTimeout);
    }, this.options.pingInterval);
  }

  /**
   * Clear timeouts and intervals
   */
  private clearTimeouts(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
      this.pingTimeout = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
