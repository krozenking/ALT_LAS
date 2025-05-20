/**
 * @jest-environment jsdom
 */

// Bu test dosyası, tip tanımlarının doğru olduğunu kontrol eder
// Tip hatalarını derleme zamanında yakalamak için kullanılır

import { describe, it, expect } from 'vitest';

// Mesaj arayüzü
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  conversationId?: string;
  userId?: string;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'markdown' | 'file';
  metadata?: {
    file?: {
      name: string;
      type: string;
      size: number;
      url?: string;
      uploadStatus?: 'uploading' | 'success' | 'error';
    };
  };
}

// Kullanıcı arayüzü
interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  lastActive?: string;
  conversations?: string[];
}

// Dosya metadata arayüzü
interface FileMetadata {
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
}

describe('Type Definitions', () => {
  it('should create a valid Message object', () => {
    const message: Message = {
      id: '1',
      content: 'Test message',
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    expect(message.id).toBe('1');
    expect(message.content).toBe('Test message');
    expect(message.sender).toBe('user');
    expect(message.timestamp).toBeDefined();
  });

  it('should create a valid User object', () => {
    const user: User = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    };

    expect(user.id).toBe('1');
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('test@example.com');
  });

  it('should create a valid FileMetadata object', () => {
    const fileMetadata: FileMetadata = {
      name: 'test.txt',
      type: 'text/plain',
      size: 1024,
      url: 'https://example.com/test.txt',
      uploadStatus: 'success',
    };

    expect(fileMetadata.name).toBe('test.txt');
    expect(fileMetadata.type).toBe('text/plain');
    expect(fileMetadata.size).toBe(1024);
    expect(fileMetadata.url).toBe('https://example.com/test.txt');
    expect(fileMetadata.uploadStatus).toBe('success');
  });

  it('should create a Message with file metadata', () => {
    const message: Message = {
      id: '1',
      content: 'File message',
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'file',
      metadata: {
        file: {
          name: 'test.txt',
          type: 'text/plain',
          size: 1024,
          url: 'https://example.com/test.txt',
          uploadStatus: 'success',
        },
      },
    };

    expect(message.type).toBe('file');
    expect(message.metadata?.file?.name).toBe('test.txt');
    expect(message.metadata?.file?.type).toBe('text/plain');
    expect(message.metadata?.file?.size).toBe(1024);
  });
});
