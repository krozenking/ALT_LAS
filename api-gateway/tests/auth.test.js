const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const authService = require('../src/services/authService');
const passwordResetService = require('../src/services/passwordResetService');

// Mock authService
jest.mock('../src/services/authService');
jest.mock('../src/services/passwordResetService');

describe('Auth Routes', () => {
  let token;
  
  beforeEach(() => {
    // Mock token for authenticated routes
    token = jwt.sign({ userId: '123', roles: ['admin'] }, 'default_jwt_secret_change_in_production');
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      };
      
      authService.register.mockResolvedValue({
        id: '123',
        username: userData.username,
        email: userData.email,
        roles: ['user']
      });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(authService.register).toHaveBeenCalledWith(
        userData.username, 
        userData.password, 
        userData.email, 
        ['user']
      );
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', userData.username);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return tokens', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };
      
      authService.login.mockResolvedValue({
        token: 'fake-token',
        refreshToken: 'fake-refresh-token',
        user: {
          id: '123',
          username: loginData.username,
          roles: ['user']
        }
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);
      
      expect(response.status).toBe(200);
      expect(authService.login).toHaveBeenCalledWith(
        loginData.username, 
        loginData.password
      );
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
    });
    
    it('should return 401 for invalid credentials', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpassword' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens', async () => {
      const refreshData = {
        refreshToken: 'fake-refresh-token'
      };
      
      authService.refreshToken.mockResolvedValue({
        token: 'new-fake-token',
        refreshToken: 'new-fake-refresh-token'
      });
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData);
      
      expect(response.status).toBe(200);
      expect(authService.refreshToken).toHaveBeenCalledWith(refreshData.refreshToken);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
    });
    
    it('should return 401 for invalid refresh token', async () => {
      authService.refreshToken.mockRejectedValue(new Error('Invalid refresh token'));
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset instructions', async () => {
      const email = 'test@example.com';
      
      authService.requestPasswordReset.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });
      
      expect(response.status).toBe(200);
      expect(authService.requestPasswordReset).toHaveBeenCalledWith(email);
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 200 even if email is not found (for security)', async () => {
      authService.requestPasswordReset.mockResolvedValue(false);
      
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetData = {
        token: 'valid-reset-token',
        newPassword: 'newpassword123'
      };
      
      authService.resetPassword.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData);
      
      expect(response.status).toBe(200);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetData.token, 
        resetData.newPassword
      );
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 401 for invalid reset token', async () => {
      authService.resetPassword.mockRejectedValue(new Error('Invalid token'));
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', newPassword: 'newpassword123' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout a user', async () => {
      authService.logout.mockResolvedValue(true);
      
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(authService.logout).toHaveBeenCalled();
      expect(response.body).toHaveProperty('message', 'Successfully logged out');
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/api/auth/logout');
      
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('roles');
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me');
      
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/me/password', () => {
    it('should change user password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };
      
      authService.changePassword.mockResolvedValue(true);
      
      const response = await request(app)
        .put('/api/auth/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData);
      
      expect(response.status).toBe(200);
      expect(authService.changePassword).toHaveBeenCalled();
      expect(response.body).toHaveProperty('message');
    });
    
    it('should return 401 if current password is incorrect', async () => {
      authService.changePassword.mockRejectedValue(new Error('Current password is incorrect'));
      
      const response = await request(app)
        .put('/api/auth/me/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });
      
      expect(response.status).toBe(401);
    });
  });

  describe('Admin Routes', () => {
    describe('GET /api/auth/users', () => {
      it('should return all users for admin', async () => {
        authService.getAllUsers.mockResolvedValue([
          { id: '123', username: 'user1', roles: ['user'] },
          { id: '456', username: 'user2', roles: ['user'] }
        ]);
        
        const response = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
      });
      
      it('should return 403 for non-admin users', async () => {
        const nonAdminToken = jwt.sign(
          { userId: '456', roles: ['user'] }, 
          'default_jwt_secret_change_in_production'
        );
        
        const response = await request(app)
          .get('/api/auth/users')
          .set('Authorization', `Bearer ${nonAdminToken}`);
        
        expect(response.status).toBe(403);
      });
    });

    describe('PUT /api/auth/users/:userId/roles', () => {
      it('should update user roles', async () => {
        const userId = '456';
        const roles = ['user', 'moderator'];
        
        authService.updateUserRoles.mockResolvedValue(true);
        
        const response = await request(app)
          .put(`/api/auth/users/${userId}/roles`)
          .set('Authorization', `Bearer ${token}`)
          .send({ roles });
        
        expect(response.status).toBe(200);
        expect(authService.updateUserRoles).toHaveBeenCalledWith(userId, roles);
        expect(response.body).toHaveProperty('message', 'Roles updated successfully');
      });
      
      it('should return 400 if roles is not an array', async () => {
        const response = await request(app)
          .put('/api/auth/users/456/roles')
          .set('Authorization', `Bearer ${token}`)
          .send({ roles: 'user' });
        
        expect(response.status).toBe(400);
      });
    });
  });
});
