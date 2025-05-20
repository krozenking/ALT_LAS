/**
 * API Service Integration Tests
 */

import { apiService, ApiError } from '../../services/api';
import { authService } from '../../services/auth';
import { offlineManager } from '../../services/offlineManager';

// Mock fetch
global.fetch = jest.fn();

// Mock XMLHttpRequest
class MockXMLHttpRequest {
  public upload = {
    addEventListener: jest.fn(),
  };
  public status = 200;
  public responseText = '';
  public open = jest.fn();
  public send = jest.fn();
  public setRequestHeader = jest.fn();
  public addEventListener = jest.fn();
  
  constructor() {
    // Simulate successful response after 100ms
    setTimeout(() => {
      this.responseText = JSON.stringify({
        success: true,
        data: {
          file: {
            id: 'f1',
            name: 'test.jpg',
            type: 'image/jpeg',
            size: 1024,
            url: 'https://example.com/test.jpg',
          },
        },
      });
      
      // Call load event handler
      const loadHandler = this.addEventListener.mock.calls.find(
        call => call[0] === 'load'
      )?.[1];
      
      if (loadHandler) {
        loadHandler();
      }
    }, 100);
  }
}

global.XMLHttpRequest = MockXMLHttpRequest as any;

// Mock auth service
jest.mock('../../services/auth', () => ({
  authService: {
    getToken: jest.fn(() => 'mock-token'),
    getRefreshToken: jest.fn(() => 'mock-refresh-token'),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock offline manager
jest.mock('../../services/offlineManager', () => ({
  offlineManager: {
    isNetworkOnline: jest.fn(() => true),
  },
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: { result: 'success' },
      }),
    });
  });
  
  describe('Request methods', () => {
    test('should make GET request', async () => {
      await apiService.get('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
    
    test('should make POST request with data', async () => {
      const data = { foo: 'bar' };
      await apiService.post('/test', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
    
    test('should make PUT request with data', async () => {
      const data = { foo: 'bar' };
      await apiService.put('/test', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
    
    test('should make DELETE request', async () => {
      await apiService.delete('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });
  });
  
  describe('Error handling', () => {
    test('should throw ApiError on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Bad request',
          },
        }),
      });
      
      await expect(apiService.get('/test')).rejects.toThrow(ApiError);
      await expect(apiService.get('/test')).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Bad request',
        status: 400,
      });
    });
    
    test('should refresh token on 401 error', async () => {
      // First request fails with 401
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token expired',
          },
        }),
      });
      
      // Second request succeeds after token refresh
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { result: 'success' },
        }),
      });
      
      await apiService.get('/test');
      
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    test('should logout on failed token refresh', async () => {
      // Request fails with 401
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Token expired',
          },
        }),
      });
      
      // Token refresh fails
      (authService.refreshToken as jest.Mock).mockRejectedValueOnce(new Error('Refresh failed'));
      
      await expect(apiService.get('/test')).rejects.toThrow(ApiError);
      
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(authService.logout).toHaveBeenCalled();
    });
    
    test('should throw error when offline', async () => {
      (offlineManager.isNetworkOnline as jest.Mock).mockReturnValueOnce(false);
      
      await expect(apiService.get('/test')).rejects.toThrow(ApiError);
      await expect(apiService.get('/test')).rejects.toMatchObject({
        code: 'NETWORK_OFFLINE',
        message: 'Network is offline',
      });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
  
  describe('File upload', () => {
    test('should upload file', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const onProgress = jest.fn();
      
      const result = await apiService.uploadFile(file, onProgress);
      
      expect(result).toEqual({
        id: 'f1',
        name: 'test.jpg',
        type: 'image/jpeg',
        size: 1024,
        url: 'https://example.com/test.jpg',
      });
      
      const xhr = new MockXMLHttpRequest();
      expect(xhr.open).toHaveBeenCalled();
      expect(xhr.setRequestHeader).toHaveBeenCalled();
      expect(xhr.send).toHaveBeenCalled();
      expect(xhr.upload.addEventListener).toHaveBeenCalled();
    });
  });
  
  describe('Auth API', () => {
    test('should login user', async () => {
      const user = { id: '1', name: 'Test User' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            token: 'new-token',
            refreshToken: 'new-refresh-token',
            user,
          },
        }),
      });
      
      const result = await apiService.login('test@example.com', 'password');
      
      expect(result).toEqual(user);
      expect(authService.setTokens).toHaveBeenCalledWith('new-token', 'new-refresh-token');
    });
    
    test('should logout user', async () => {
      await apiService.logout();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refreshToken: 'mock-refresh-token' }),
        })
      );
      
      expect(authService.clearTokens).toHaveBeenCalled();
    });
  });
  
  describe('User API', () => {
    test('should get users', async () => {
      const users = [{ id: '1', name: 'User 1' }, { id: '2', name: 'User 2' }];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { users },
        }),
      });
      
      const result = await apiService.getUsers();
      
      expect(result).toEqual(users);
    });
    
    test('should get user by ID', async () => {
      const user = { id: '1', name: 'User 1' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { user },
        }),
      });
      
      const result = await apiService.getUser('1');
      
      expect(result).toEqual(user);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/users/1'),
        expect.any(Object)
      );
    });
  });
  
  describe('Conversation API', () => {
    test('should get conversations', async () => {
      const conversations = [
        { id: '1', type: 'direct', participants: ['1', '2'] },
        { id: '2', type: 'group', name: 'Group', participants: ['1', '2', '3'] },
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { conversations },
        }),
      });
      
      const result = await apiService.getConversations();
      
      expect(result).toEqual(conversations);
    });
    
    test('should create conversation', async () => {
      const conversation = { id: '3', type: 'group', name: 'New Group', participants: ['1', '2', '3'] };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { conversation },
        }),
      });
      
      const result = await apiService.createConversation({
        type: 'group',
        name: 'New Group',
        participants: ['2', '3'],
      });
      
      expect(result).toEqual(conversation);
    });
  });
  
  describe('Message API', () => {
    test('should get messages', async () => {
      const messages = [
        { id: '1', text: 'Hello', senderId: '1', conversationId: '1' },
        { id: '2', text: 'Hi', senderId: '2', conversationId: '1' },
      ];
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { messages, hasMore: false },
        }),
      });
      
      const result = await apiService.getMessages('1');
      
      expect(result).toEqual({ messages, hasMore: false });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/conversations/1/messages'),
        expect.any(Object)
      );
    });
    
    test('should send message', async () => {
      const message = { id: '3', text: 'New message', senderId: '1', conversationId: '1' };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { message },
        }),
      });
      
      const result = await apiService.sendMessage('1', 'New message');
      
      expect(result).toEqual(message);
    });
  });
});
