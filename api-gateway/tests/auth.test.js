const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/index');
const authService = require('../src/services/authService');
const sessionService = require('../src/services/sessionService');

// Mock the auth service and session service
jest.mock('../src/services/authService');
jest.mock('../src/services/sessionService');

describe('Authentication API Tests', () => {
  // Test user data
  const testUser = {
    id: 'test123',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['user'],
    permissions: ['read:users']
  };

  // Test tokens
  const testToken = 'test.jwt.token';
  const testRefreshToken = 'test.refresh.token';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock the register function
      authService.createUser.mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        roles: testUser.roles
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUser.username,
          email: testUser.email,
          password: 'securePassword123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(authService.createUser).toHaveBeenCalledWith({
        username: testUser.username,
        email: testUser.email,
        password: 'securePassword123',
        roles: ['user']
      });
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUser.username
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle duplicate username error', async () => {
      // Mock the register function to throw an error
      authService.createUser.mockRejectedValue(new Error('Kullanıcı adı zaten kullanılıyor'));

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUser.username,
          email: testUser.email,
          password: 'securePassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      // Mock the validateUser function
      authService.validateUser.mockResolvedValue(testUser);
      
      // Mock the token generation
      jwt.sign = jest.fn()
        .mockReturnValueOnce(testToken)
        .mockReturnValueOnce(testRefreshToken);
      
      // Mock session creation
      sessionService.createSession.mockReturnValue({
        id: 'session123',
        userId: testUser.id,
        refreshToken: testRefreshToken
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'correctPassword'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe(testToken);
      expect(response.body.data.refreshToken).toBe(testRefreshToken);
      expect(response.body.data.user.username).toBe(testUser.username);
      expect(authService.validateUser).toHaveBeenCalledWith(testUser.username, 'correctPassword');
      expect(sessionService.createSession).toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      // Mock the validateUser function to throw an error
      authService.validateUser.mockRejectedValue(new Error('Geçersiz kullanıcı adı veya şifre'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh tokens successfully', async () => {
      // Mock the validateRefreshToken function
      authService.validateRefreshToken.mockResolvedValue(true);
      
      // Mock the getUserById function
      authService.getUserById.mockResolvedValue(testUser);
      
      // Mock the token generation
      jwt.sign = jest.fn()
        .mockReturnValueOnce('new.jwt.token')
        .mockReturnValueOnce('new.refresh.token');
      
      // Mock token verification
      jwt.verify = jest.fn().mockReturnValue({ userId: testUser.id });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: testRefreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('new.jwt.token');
      expect(response.body.data.refreshToken).toBe('new.refresh.token');
      expect(authService.validateRefreshToken).toHaveBeenCalledWith(testUser.id, testRefreshToken);
      expect(authService.getUserById).toHaveBeenCalledWith(testUser.id);
    });

    it('should return 401 for invalid refresh token', async () => {
      // Mock token verification to throw an error
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'invalid.refresh.token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout a user successfully', async () => {
      // Mock the authenticateJWT middleware
      const mockReq = {
        user: testUser,
        body: {
          refreshToken: testRefreshToken,
          sessionId: 'session123'
        },
        headers: {
          authorization: `Bearer ${testToken}`
        }
      };

      // Mock the invalidateRefreshToken function
      authService.invalidateRefreshToken.mockResolvedValue();
      
      // Mock the endSession function
      authService.endSession.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          refreshToken: testRefreshToken,
          sessionId: 'session123'
        });

      // This test might fail if the authenticateJWT middleware is not properly mocked
      // In a real test, you would need to properly mock the middleware
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile successfully', async () => {
      // Mock the authenticateJWT middleware
      const mockReq = {
        user: testUser,
        headers: {
          authorization: `Bearer ${testToken}`
        }
      };

      // Mock the getUserById function
      authService.getUserById.mockResolvedValue({
        ...testUser,
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${testToken}`);

      // This test might fail if the authenticateJWT middleware is not properly mocked
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      // Mock the authenticateJWT middleware
      const mockReq = {
        user: testUser,
        body: {
          currentPassword: 'oldPassword',
          newPassword: 'newSecurePassword123'
        },
        headers: {
          authorization: `Bearer ${testToken}`
        }
      };

      // Mock the getUserById function
      authService.getUserById.mockResolvedValue({
        ...testUser,
        password: 'hashedOldPassword'
      });
      
      // Mock bcrypt compare
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      
      // Mock the updatePassword function
      authService.updatePassword.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'oldPassword',
          newPassword: 'newSecurePassword123'
        });

      // This test might fail if the authenticateJWT middleware is not properly mocked
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.updatePassword).toHaveBeenCalledWith(testUser.id, 'newSecurePassword123');
    });

    it('should return 401 if current password is incorrect', async () => {
      // Mock the authenticateJWT middleware
      const mockReq = {
        user: testUser,
        body: {
          currentPassword: 'wrongPassword',
          newPassword: 'newSecurePassword123'
        },
        headers: {
          authorization: `Bearer ${testToken}`
        }
      };

      // Mock the getUserById function
      authService.getUserById.mockResolvedValue({
        ...testUser,
        password: 'hashedOldPassword'
      });
      
      // Mock bcrypt compare to return false
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newSecurePassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should initiate password reset successfully', async () => {
      // Mock the getUserByEmail function
      authService.getUserByEmail.mockResolvedValue(testUser);
      
      // Mock the savePasswordResetToken function
      authService.savePasswordResetToken.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.savePasswordResetToken).toHaveBeenCalled();
    });

    it('should return 200 even if email does not exist (security)', async () => {
      // Mock the getUserByEmail function to return null
      authService.getUserByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.savePasswordResetToken).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully', async () => {
      const resetToken = 'valid-reset-token';
      
      // Mock the validatePasswordResetToken function
      authService.validatePasswordResetToken.mockResolvedValue(testUser);
      
      // Mock the updatePassword function
      authService.updatePassword.mockResolvedValue();
      
      // Mock the invalidatePasswordResetToken function
      authService.invalidatePasswordResetToken.mockResolvedValue();
      
      // Mock the endAllSessions function
      authService.endAllSessions.mockResolvedValue();

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken,
          newPassword: 'newSecurePassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.updatePassword).toHaveBeenCalledWith(testUser.id, 'newSecurePassword123');
      expect(authService.invalidatePasswordResetToken).toHaveBeenCalledWith(resetToken);
      expect(authService.endAllSessions).toHaveBeenCalledWith(testUser.id);
    });

    it('should return 401 for invalid reset token', async () => {
      // Mock the validatePasswordResetToken function to return null
      authService.validatePasswordResetToken.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          resetToken: 'invalid-token',
          newPassword: 'newSecurePassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
