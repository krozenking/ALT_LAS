import { vi } from 'vitest';
import { User, Message, Conversation } from '../../types';

// Mock kullanıcı verileri
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Test Kullanıcı',
    email: 'test@example.com',
    avatar: null,
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'user-2',
    name: 'Demo Kullanıcı',
    email: 'demo@example.com',
    avatar: 'https://example.com/avatar.jpg',
    createdAt: '2025-01-02T00:00:00.000Z'
  }
];

// Mock mesaj verileri
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'Merhaba, nasıl yardımcı olabilirim?',
    sender: 'ai',
    timestamp: '2025-01-01T12:00:00.000Z',
    status: 'delivered'
  },
  {
    id: 'msg-2',
    content: 'Türkiye\'nin başkenti neresidir?',
    sender: 'user',
    timestamp: '2025-01-01T12:01:00.000Z',
    status: 'delivered'
  },
  {
    id: 'msg-3',
    content: 'Türkiye\'nin başkenti Ankara\'dır.',
    sender: 'ai',
    timestamp: '2025-01-01T12:01:30.000Z',
    status: 'delivered'
  }
];

// Mock konuşma verileri
export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Türkiye Hakkında Sorular',
    messages: mockMessages,
    createdAt: '2025-01-01T12:00:00.000Z',
    updatedAt: '2025-01-01T12:01:30.000Z'
  },
  {
    id: 'conv-2',
    title: 'Boş Konuşma',
    messages: [],
    createdAt: '2025-01-02T10:00:00.000Z',
    updatedAt: '2025-01-02T10:00:00.000Z'
  }
];

// Mock API servisi
export const mockApiService = {
  // Kullanıcı işlemleri
  getCurrentUser: vi.fn().mockResolvedValue(mockUsers[0]),
  getUser: vi.fn().mockImplementation((id: string) => {
    const user = mockUsers.find(u => u.id === id);
    return user ? Promise.resolve(user) : Promise.reject(new Error('Kullanıcı bulunamadı'));
  }),
  createUser: vi.fn().mockImplementation((name: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: null,
      avatar: null,
      createdAt: new Date().toISOString()
    };
    return Promise.resolve(newUser);
  }),
  updateUser: vi.fn().mockImplementation((user: User) => {
    return Promise.resolve(user);
  }),
  
  // Konuşma işlemleri
  getConversations: vi.fn().mockResolvedValue(mockConversations),
  getConversation: vi.fn().mockImplementation((id: string) => {
    const conversation = mockConversations.find(c => c.id === id);
    return conversation ? Promise.resolve(conversation) : Promise.reject(new Error('Konuşma bulunamadı'));
  }),
  createConversation: vi.fn().mockImplementation((title: string) => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return Promise.resolve(newConversation);
  }),
  updateConversation: vi.fn().mockImplementation((conversation: Conversation) => {
    return Promise.resolve(conversation);
  }),
  deleteConversation: vi.fn().mockResolvedValue(true),
  
  // Mesaj işlemleri
  sendMessage: vi.fn().mockImplementation((conversationId: string, content: string, sender: 'user' | 'ai') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender,
      timestamp: new Date().toISOString(),
      status: 'delivered'
    };
    return Promise.resolve(newMessage);
  }),
  
  // Dosya işlemleri
  uploadFile: vi.fn().mockImplementation((file: File) => {
    return Promise.resolve({
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `https://example.com/files/${file.name}`
    });
  }),
  downloadFile: vi.fn().mockImplementation((fileId: string) => {
    return Promise.resolve(new Blob(['test file content'], { type: 'text/plain' }));
  })
};

export default mockApiService;
