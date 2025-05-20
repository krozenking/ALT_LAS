// src/services/__tests__/auth.test.ts
import { authService } from '../auth';
import { rest } from 'msw';
import { server } from '../../mocks/server';

// API URL
const API_URL = 'https://api.alt-las.example';

describe('Auth Service', () => {
  test('login should return token and user data on successful login', async () => {
    const result = await authService.login('admin', 'password123');
    
    expect(result).toEqual({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        username: 'admin',
        name: 'Admin User',
        role: 'admin',
      },
    });
  });
  
  test('login should throw error on failed login', async () => {
    await expect(authService.login('wrong', 'credentials')).rejects.toThrow('Invalid username or password');
  });
  
  test('login should throw error on server error', async () => {
    // Override the default handler for this test
    server.use(
      rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );
    
    await expect(authService.login('admin', 'password123')).rejects.toThrow('Server error');
  });
  
  test('getProfile should return user data with valid token', async () => {
    const result = await authService.getProfile('mock-jwt-token');
    
    expect(result).toEqual({
      id: '1',
      username: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      preferences: {
        theme: 'light',
        language: 'en',
      },
    });
  });
  
  test('getProfile should throw error with invalid token', async () => {
    await expect(authService.getProfile('invalid-token')).rejects.toThrow('Failed to get user profile');
  });
  
  test('logout should complete successfully with valid token', async () => {
    await expect(authService.logout('mock-jwt-token')).resolves.not.toThrow();
  });
  
  test('logout should throw error on server error', async () => {
    // Override the default handler for this test
    server.use(
      rest.post(`${API_URL}/auth/logout`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      })
    );
    
    await expect(authService.logout('mock-jwt-token')).rejects.toThrow('Logout failed');
  });
});
