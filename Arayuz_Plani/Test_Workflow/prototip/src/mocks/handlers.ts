// src/mocks/handlers.ts
import { rest } from 'msw';

// Define API endpoints
const API_URL = 'https://api.alt-las.example';

export const handlers = [
  // Mock login endpoint
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { username, password } = req.body as { username: string; password: string };
    
    if (username === 'admin' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'admin',
            name: 'Admin User',
            role: 'admin',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Invalid username or password',
      })
    );
  }),
  
  // Mock user profile endpoint
  rest.get(`${API_URL}/users/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-jwt-token') {
      return res(
        ctx.status(200),
        ctx.json({
          id: '1',
          username: 'admin',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          preferences: {
            theme: 'light',
            language: 'en',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        error: 'Unauthorized',
      })
    );
  }),
  
  // Mock logout endpoint
  rest.post(`${API_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Logged out successfully',
      })
    );
  }),
];
