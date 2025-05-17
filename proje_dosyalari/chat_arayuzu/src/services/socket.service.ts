import { io, Socket } from 'socket.io-client';
// Import Message type from types.ts
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Socket Service for real-time communication
 */
class SocketService {
  private socket: Socket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private typingListeners: ((data: { userId: string, isTyping: boolean }) => void)[] = [];
  private aiTypingListeners: ((data: { conversationId: string }) => void)[] = [];
  private aiTypingDoneListeners: ((data: { conversationId: string }) => void)[] = [];

  /**
   * Initialize the socket connection
   */
  init(): void {
    if (this.socket) return;

    this.socket = io(SOCKET_URL);

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('newMessage', (message: Message) => {
      this.messageListeners.forEach(listener => listener(message));
    });

    this.socket.on('userTyping', (data: { userId: string, isTyping: boolean }) => {
      this.typingListeners.forEach(listener => listener(data));
    });

    this.socket.on('aiTyping', (data: { conversationId: string }) => {
      this.aiTypingListeners.forEach(listener => listener(data));
    });

    this.socket.on('aiTypingDone', (data: { conversationId: string }) => {
      this.aiTypingDoneListeners.forEach(listener => listener(data));
    });
  }

  /**
   * Join a conversation
   * @param userId - The ID of the user
   * @param conversationId - The ID of the conversation
   */
  joinConversation(userId: string, conversationId: string): void {
    if (!this.socket) this.init();
    this.socket?.emit('join', { userId, conversationId });
  }

  /**
   * Send a message
   * @param content - The message content
   * @param userId - The ID of the user sending the message
   * @param conversationId - The ID of the conversation
   */
  sendMessage(content: string, userId: string, conversationId: string): void {
    if (!this.socket) this.init();
    this.socket?.emit('sendMessage', { content, userId, conversationId });
  }

  /**
   * Send typing status
   * @param userId - The ID of the user
   * @param conversationId - The ID of the conversation
   * @param isTyping - Whether the user is typing
   */
  sendTyping(userId: string, conversationId: string, isTyping: boolean): void {
    if (!this.socket) this.init();
    this.socket?.emit('typing', { userId, conversationId, isTyping });
  }

  /**
   * Add a listener for new messages
   * @param listener - The listener function
   */
  onNewMessage(listener: (message: Message) => void): void {
    this.messageListeners.push(listener);
  }

  /**
   * Add a listener for typing status
   * @param listener - The listener function
   */
  onUserTyping(listener: (data: { userId: string, isTyping: boolean }) => void): void {
    this.typingListeners.push(listener);
  }

  /**
   * Add a listener for AI typing status
   * @param listener - The listener function
   */
  onAiTyping(listener: (data: { conversationId: string }) => void): void {
    this.aiTypingListeners.push(listener);
  }

  /**
   * Add a listener for AI typing done status
   * @param listener - The listener function
   */
  onAiTypingDone(listener: (data: { conversationId: string }) => void): void {
    this.aiTypingDoneListeners.push(listener);
  }

  /**
   * Remove a listener for new messages
   * @param listener - The listener function to remove
   */
  removeMessageListener(listener: (message: Message) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  /**
   * Remove a listener for typing status
   * @param listener - The listener function to remove
   */
  removeTypingListener(listener: (data: { userId: string, isTyping: boolean }) => void): void {
    this.typingListeners = this.typingListeners.filter(l => l !== listener);
  }

  /**
   * Disconnect the socket
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export default new SocketService();
