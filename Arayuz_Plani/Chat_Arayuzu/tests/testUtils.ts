/**
 * Test utilities for the chat application
 */

import { User, Conversation, Message, Attachment } from '../types';

/**
 * Generate a mock user
 * 
 * @param id - User ID
 * @param name - User name
 * @param status - User status
 * @returns Mock user
 */
export const mockUser = (
  id: string = '1',
  name: string = 'Test User',
  status: 'online' | 'offline' | 'away' = 'online'
): User => {
  return {
    id,
    name,
    status,
    avatar: `https://i.pravatar.cc/150?u=${id}`,
  };
};

/**
 * Generate mock users
 * 
 * @param count - Number of users to generate
 * @returns Array of mock users
 */
export const mockUsers = (count: number = 5): User[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = (i + 1).toString();
    return mockUser(
      id,
      `User ${id}`,
      i % 3 === 0 ? 'online' : i % 3 === 1 ? 'offline' : 'away'
    );
  });
};

/**
 * Generate a mock conversation
 * 
 * @param id - Conversation ID
 * @param type - Conversation type
 * @param participants - Participant IDs
 * @param name - Conversation name (for group conversations)
 * @returns Mock conversation
 */
export const mockConversation = (
  id: string = '1',
  type: 'direct' | 'group' = 'direct',
  participants: string[] = ['1', '2'],
  name?: string
): Conversation => {
  return {
    id,
    type,
    participants,
    name: type === 'group' ? (name || `Group ${id}`) : undefined,
    avatar: type === 'group' ? `https://i.pravatar.cc/150?u=group${id}` : undefined,
    lastMessage: null,
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Generate mock conversations
 * 
 * @param count - Number of conversations to generate
 * @param currentUserId - Current user ID
 * @returns Array of mock conversations
 */
export const mockConversations = (count: number = 5, currentUserId: string = '1'): Conversation[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = (i + 1).toString();
    const type = i % 3 === 0 ? 'group' : 'direct';
    const participants = type === 'direct' 
      ? [currentUserId, (i + 2).toString()] 
      : [currentUserId, ...[2, 3, 4].map(n => (n + i).toString())];
    
    return mockConversation(
      id,
      type,
      participants,
      type === 'group' ? `Group ${id}` : undefined
    );
  });
};

/**
 * Generate a mock message
 * 
 * @param id - Message ID
 * @param text - Message text
 * @param senderId - Sender ID
 * @param conversationId - Conversation ID
 * @param timestamp - Message timestamp
 * @param status - Message status
 * @param attachments - Message attachments
 * @returns Mock message
 */
export const mockMessage = (
  id: string = '1',
  text: string = 'Test message',
  senderId: string = '1',
  conversationId: string = '1',
  timestamp: string = new Date().toISOString(),
  status: 'sent' | 'delivered' | 'read' | 'failed' = 'sent',
  attachments?: Attachment[]
): Message => {
  return {
    id,
    text,
    senderId,
    conversationId,
    timestamp,
    status,
    attachments,
  };
};

/**
 * Generate mock messages
 * 
 * @param count - Number of messages to generate
 * @param conversationId - Conversation ID
 * @param participants - Participant IDs
 * @returns Array of mock messages
 */
export const mockMessages = (
  count: number = 10,
  conversationId: string = '1',
  participants: string[] = ['1', '2']
): Message[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = (i + 1).toString();
    const senderId = participants[i % participants.length];
    const timestamp = new Date(Date.now() - (count - i) * 60000).toISOString();
    
    return mockMessage(
      id,
      `Message ${id} from User ${senderId}`,
      senderId,
      conversationId,
      timestamp,
      'sent'
    );
  });
};

/**
 * Generate a mock attachment
 * 
 * @param id - Attachment ID
 * @param name - Attachment name
 * @param type - Attachment type
 * @param url - Attachment URL
 * @param size - Attachment size
 * @returns Mock attachment
 */
export const mockAttachment = (
  id: string = '1',
  name: string = 'test.jpg',
  type: 'image' | 'file' = 'image',
  url: string = 'https://picsum.photos/200',
  size: number = 1024 * 1024
): Attachment => {
  return {
    id,
    name,
    type,
    url,
    size,
  };
};

/**
 * Generate mock attachments
 * 
 * @param count - Number of attachments to generate
 * @returns Array of mock attachments
 */
export const mockAttachments = (count: number = 3): Attachment[] => {
  return Array.from({ length: count }, (_, i) => {
    const id = (i + 1).toString();
    const type = i % 2 === 0 ? 'image' : 'file';
    const name = type === 'image' ? `image${id}.jpg` : `document${id}.pdf`;
    const url = type === 'image' 
      ? `https://picsum.photos/200?random=${id}` 
      : `https://example.com/files/document${id}.pdf`;
    
    return mockAttachment(id, name, type, url);
  });
};

/**
 * Wait for a specified time
 * 
 * @param ms - Time to wait in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock API response
 * 
 * @param data - Response data
 * @param delay - Response delay in milliseconds
 * @param shouldFail - Whether the response should fail
 * @returns Promise that resolves with the data or rejects with an error
 */
export const mockApiResponse = <T>(
  data: T,
  delay: number = 500,
  shouldFail: boolean = false
): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API request failed'));
      } else {
        resolve(data);
      }
    }, delay);
  });
};
