/**
 * Offline Manager Service
 * 
 * This service manages offline functionality for the chat application.
 * It handles:
 * - Detecting online/offline status
 * - Storing messages when offline
 * - Syncing messages when back online
 * - Managing offline data storage
 */

import { Message, User, Conversation } from '../types';

// Queue for storing messages that need to be sent when back online
interface QueuedMessage {
  id: string;
  text: string;
  senderId: string;
  conversationId: string;
  timestamp: number;
  attachments?: any[];
  status: 'pending' | 'failed';
  retryCount: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private messageQueue: QueuedMessage[] = [];
  private syncInProgress: boolean = false;
  private maxRetryCount: number = 3;
  private listeners: { [key: string]: Function[] } = {
    'statusChange': [],
    'syncStart': [],
    'syncComplete': [],
    'syncError': [],
    'messageQueued': [],
    'messageDequeued': [],
  };
  
  private constructor() {
    this.loadQueueFromStorage();
    this.setupEventListeners();
  }
  
  // Get singleton instance
  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }
  
  // Set up event listeners for online/offline status
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('statusChange', true);
      this.syncMessages();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('statusChange', false);
    });
  }
  
  // Load queued messages from local storage
  private loadQueueFromStorage(): void {
    try {
      const storedQueue = localStorage.getItem('offline_message_queue');
      if (storedQueue) {
        this.messageQueue = JSON.parse(storedQueue);
      }
    } catch (error) {
      console.error('Error loading offline message queue:', error);
      this.messageQueue = [];
    }
  }
  
  // Save queued messages to local storage
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('offline_message_queue', JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('Error saving offline message queue:', error);
    }
  }
  
  // Check if the application is online
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }
  
  // Queue a message to be sent when back online
  public queueMessage(message: Omit<Message, 'id' | 'timestamp' | 'status'> & { id?: string }): string {
    const id = message.id || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedMessage: QueuedMessage = {
      id,
      text: message.text,
      senderId: message.senderId,
      conversationId: message.conversationId,
      timestamp: Date.now(),
      attachments: message.attachments,
      status: 'pending',
      retryCount: 0,
    };
    
    this.messageQueue.push(queuedMessage);
    this.saveQueueToStorage();
    this.notifyListeners('messageQueued', queuedMessage);
    
    return id;
  }
  
  // Get all queued messages
  public getQueuedMessages(): QueuedMessage[] {
    return [...this.messageQueue];
  }
  
  // Get queued messages for a specific conversation
  public getQueuedMessagesForConversation(conversationId: string): QueuedMessage[] {
    return this.messageQueue.filter(message => message.conversationId === conversationId);
  }
  
  // Sync messages with the server when back online
  public async syncMessages(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.messageQueue.length === 0) {
      return;
    }
    
    this.syncInProgress = true;
    this.notifyListeners('syncStart');
    
    try {
      const messagesToSync = [...this.messageQueue];
      const successfulIds: string[] = [];
      const failedIds: string[] = [];
      
      for (const message of messagesToSync) {
        try {
          // In a real application, this would call an API to send the message
          // For now, we'll just simulate a successful send
          await this.simulateSendMessage(message);
          
          // Message sent successfully
          successfulIds.push(message.id);
        } catch (error) {
          console.error('Error syncing message:', error);
          
          // Increment retry count
          message.retryCount++;
          
          if (message.retryCount >= this.maxRetryCount) {
            // Mark as failed if max retry count reached
            message.status = 'failed';
            failedIds.push(message.id);
          }
        }
      }
      
      // Remove successful messages from queue
      this.messageQueue = this.messageQueue.filter(message => !successfulIds.includes(message.id));
      
      // Update failed messages in queue
      this.messageQueue.forEach(message => {
        if (failedIds.includes(message.id)) {
          message.status = 'failed';
        }
      });
      
      this.saveQueueToStorage();
      this.notifyListeners('syncComplete', { successful: successfulIds.length, failed: failedIds.length });
    } catch (error) {
      console.error('Error during sync:', error);
      this.notifyListeners('syncError', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  // Simulate sending a message (for demo purposes)
  private async simulateSendMessage(message: QueuedMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        // Simulate 90% success rate
        if (Math.random() < 0.9) {
          resolve();
        } else {
          reject(new Error('Failed to send message'));
        }
      }, 500);
    });
  }
  
  // Retry sending failed messages
  public retryFailedMessages(): void {
    // Mark failed messages as pending again
    this.messageQueue.forEach(message => {
      if (message.status === 'failed') {
        message.status = 'pending';
        message.retryCount = 0;
      }
    });
    
    this.saveQueueToStorage();
    this.syncMessages();
  }
  
  // Clear all queued messages
  public clearQueue(): void {
    this.messageQueue = [];
    this.saveQueueToStorage();
  }
  
  // Store data for offline use
  public storeOfflineData(key: string, data: any): void {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing offline data for ${key}:`, error);
    }
  }
  
  // Get stored offline data
  public getOfflineData<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting offline data for ${key}:`, error);
      return null;
    }
  }
  
  // Add event listener
  public addEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  // Remove event listener
  public removeEventListener(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  // Notify listeners of an event
  private notifyListeners(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();
