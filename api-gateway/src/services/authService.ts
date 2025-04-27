import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import logger from '../utils/logger';
import jwtService from '../services/jwtService';
import sessionService, { DeviceInfo } from '../services/sessionService';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';
import crypto from 'crypto'; // For generating reset tokens

// --- Mock Data Store --- 

interface User {
  id: string;
  username: string;
  passwordHash: string; // Store hashed passwords
  email?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  // refreshToken?: string; // Removed: Handled by sessionService
}

interface PasswordResetToken {
    userId: string;
    token: string;
    expiresAt: Date;
}

// Mock user database (replace with actual DB interaction)
const users = new Map<string, User>();
const passwordResetTokens = new Map<string, PasswordResetToken>(); // token -> ResetTokenInfo

// Helper to hash password (use a proper library like bcrypt in production)
const simpleHash = (password: string): string => {
    // WARNING: Insecure hashing for demonstration only!
    return `hashed_${password}`;
}

// Helper to compare password
const comparePassword = (plainPassword: string, hash: string): boolean => {
    // WARNING: Insecure comparison for demonstration only!
    return `hashed_${plainPassword}` === hash;
}

// Seed initial users
users.set('1', {
  id: '1',
  username: 'admin',
  passwordHash: simpleHash('password'), 
  email: 'admin@example.com',
  roles: ['admin'],
  permissions: ['read:users', 'manage:users', 'manage:roles', 'manage:permissions', 'delete:users', 'read:permissions'],
  isActive: true
});

users.set('2', {
  id: '2',
  username: 'user',
  passwordHash: simpleHash('password'), 
  email: 'user@example.com',
  roles: ['user'],
  permissions: [],
  isActive: true
});

// --- Service Functions --- 

/**
 * Register a new user.
 */
const register = async (
  username: string,
  password: string,
  email: string,
  roles: string[] = ['user']
): Promise<{ user: Partial<User>; token: string; refreshToken: string }> => {
  if (Array.from(users.values()).some(u => u.username === username)) {
    throw new BadRequestError('Bu kullanıcı adı zaten kullanılıyor');
  }
  if (Array.from(users.values()).some(u => u.email === email)) {
    throw new BadRequestError('Bu e-posta adresi zaten kullanılıyor');
  }
  if (!password || password.length < 6) {
    throw new BadRequestError('Şifre en az 6 karakter olmalıdır');
  }

  const id = crypto.randomUUID();
  const newUser: User = {
    id,
    username,
    passwordHash: simpleHash(password),
    email,
    roles,
    permissions: [], // Assign default empty permissions
    isActive: true // Activate user by default
  };

  users.set(id, newUser);
  logger.info(`Yeni kullanıcı kaydedildi: ${username} (ID: ${id})`);

  const tokenPayload = { userId: id, username, roles: newUser.roles, permissions: newUser.permissions };
  const token = jwtService.generateToken(tokenPayload);
  const refreshToken = jwtService.generateRefreshToken(id);
  
  // Store refresh token (simple single token strategy)
  newUser.refreshToken = refreshToken;

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    token,
    refreshToken
  };
};

/**
 * Log in a user.
 */
const login = async (
  username: string,
  password: string,
  deviceInfo: DeviceInfo // Added deviceInfo
): Promise<{ user: Partial<User>; token: string; refreshToken: string }> => {
  const user = Array.from(users.values()).find(u => u.username === username);

  if (!user || !user.isActive || !comparePassword(password, user.passwordHash)) {
    logger.warn(`Geçersiz giriş denemesi: ${username}`);
    throw new UnauthorizedError("Geçersiz kullanıcı adı veya şifre ya da kullanıcı aktif değil");
  }

  logger.info(`Kullanıcı girişi başarılı: ${username}`);

  const tokenPayload = { userId: user.id, username: user.username, roles: user.roles, permissions: user.permissions };
  const token = jwtService.generateToken(tokenPayload);
  const refreshToken = jwtService.generateRefreshToken(user.id);

  // Create a new session using sessionService
  sessionService.createSession(user.id, refreshToken, deviceInfo);

  const { passwordHash: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
    refreshToken
  };
};

/**
 * Refresh access token using a refresh token.
 */
const refreshToken = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  try {
    // Get session by refresh token
    const session = sessionService.getSessionByRefreshToken(refreshToken);
    const userId = session.userId;
    
    // Get user details
    const user = users.get(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Kullanıcı bulunamadı veya aktif değil');
    }

    // Generate new tokens
    const tokenPayload = { userId: user.id, username: user.username, roles: user.roles, permissions: user.permissions };
    const newAccessToken = jwtService.generateToken(tokenPayload);
    const newRefreshToken = jwtService.generateRefreshToken(user.id);

    // Update session with new refresh token
    sessionService.updateSession(session.id, {
      refreshToken: newRefreshToken,
      lastUsedAt: new Date()
    });

    logger.info(`Token yenileme başarılı for user ${user.id}, session ${session.id}`);
    return { token: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    logger.warn('Token yenileme başarısız:', error);
    if (error instanceof UnauthorizedError) throw error;
    throw new UnauthorizedError('Refresh token doğrulama hatası');
  }
};

/**
 * Log out a user (invalidate session and blacklist access token).
 */
const logout = async (token: string, refreshToken?: string): Promise<void> => {
  // Invalidate the specific session if refresh token is provided
  if (refreshToken) {
    try {
      sessionService.invalidateSessionByRefreshToken(refreshToken);
    } catch (error) {
      logger.warn(`Error invalidating session by refresh token during logout: ${error.message}`);
    }
  } else {
    // If only access token is provided, try to find the user and invalidate all their sessions
    // This is less specific but better than nothing
    try {
      const decoded = jwtService.verifyToken(token) as any; // Verify to get user ID
      if (decoded && decoded.userId) {
        sessionService.invalidateAllUserSessions(decoded.userId);
        logger.info(`All sessions invalidated for user ${decoded.userId} during logout (access token only).`);
      }
    } catch (error) {
      logger.warn("Error invalidating all user sessions during logout (access token only):", error);
    }
  }

  // Blacklist the access token itself
  jwtService.blacklistToken(token);
  logger.info("Access token blacklisted.");
};

/**
 * Get user details by ID (excluding password).
 */
const getUserById = async (userId: string): Promise<Partial<User>> => {
  const user = users.get(userId);
  if (!user) {
    throw new NotFoundError('Kullanıcı bulunamadı');
  }
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user details needed for authentication middleware.
 */
const getUserDetailsForAuth = async (userId: string): Promise<Express.User | null> => {
    const user = users.get(userId);
    if (!user || !user.isActive) {
        return null; // Return null if user not found or inactive
    }
    // Return only necessary fields for the req.user object
    return {
        id: user.id,
        username: user.username,
        roles: user.roles,
        permissions: user.permissions
    };
};

/**
 * Get all users (excluding password).
 */
const getAllUsers = async (): Promise<Partial<User>[]> => {
  return Array.from(users.values()).map(user => {
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

/**
 * Request a password reset.
 */
const requestPasswordReset = async (email: string): Promise<void> => {
    const user = Array.from(users.values()).find(u => u.email === email && u.isActive);
    if (!user) {
        logger.warn(`Password reset requested for non-existent or inactive email: ${email}`);
        // Don't throw error, just return to prevent email enumeration
        return;
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    // Store the token (associate with user ID)
    passwordResetTokens.set(token, { userId: user.id, token, expiresAt });

    // TODO: Send email to user.email with the reset link/token
    logger.info(`Password reset token generated for user ${user.id}. Token: ${token}. Email not sent (mock).`);
};

/**
 * Reset password using a token.
 */
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const resetInfo = passwordResetTokens.get(token);

    if (!resetInfo || resetInfo.expiresAt < new Date()) {
        throw new UnauthorizedError('Geçersiz veya süresi dolmuş şifre sıfırlama tokenı');
    }

    const user = users.get(resetInfo.userId);
    if (!user) {
        // Should not happen if token is valid, but check anyway
        throw new NotFoundError('Token ile ilişkili kullanıcı bulunamadı');
    }

    // TODO: Add password strength validation
    if (!newPassword || newPassword.length < 6) {
        throw new BadRequestError('Yeni şifre en az 6 karakter olmalıdır');
    }

    // Update password
    user.passwordHash = simpleHash(newPassword);

    // Invalidate the reset token
    passwordResetTokens.delete(token);
    // Invalidate any active refresh tokens for the user
    user.refreshToken = undefined;

    logger.info(`User ${user.id} password reset successfully.`);
};

/**
 * Change password for an authenticated user.
 */
const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }

    if (!comparePassword(currentPassword, user.passwordHash)) {
        throw new UnauthorizedError('Mevcut şifre yanlış');
    }

    // TODO: Add password strength validation
    if (!newPassword || newPassword.length < 6) {
        throw new BadRequestError('Yeni şifre en az 6 karakter olmalıdır');
    }
    if (currentPassword === newPassword) {
        throw new BadRequestError('Yeni şifre mevcut şifre ile aynı olamaz');
    }

    user.passwordHash = simpleHash(newPassword);
    // Invalidate refresh token on password change
    user.refreshToken = undefined;

    logger.info(`User ${userId} changed their password successfully.`);
};

/**
 * Update user roles.
 */
const updateUserRoles = async (userId: string, roles: string[]): Promise<void> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }
    // TODO: Validate roles against a predefined list
    user.roles = roles;
    logger.info(`User ${userId} roles updated to: ${roles.join(', ')}`);
};

/**
 * Get user permissions.
 */
const getUserPermissions = async (userId: string): Promise<string[]> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }
    return user.permissions || [];
};

/**
 * Update user permissions.
 */
const updateUserPermissions = async (userId: string, permissions: string[]): Promise<void> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }
    // TODO: Validate permissions against a predefined list
    user.permissions = permissions;
    logger.info(`User ${userId} permissions updated.`);
};

/**
 * Update user profile information.
 */
const updateUserProfile = async (userId: string, updateData: Partial<Pick<User, 'username' | 'email' | 'isActive'>>): Promise<Partial<User>> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }

    // Validate and update fields
    if (updateData.username && updateData.username !== user.username) {
        if (Array.from(users.values()).some(u => u.username === updateData.username && u.id !== userId)) {
            throw new BadRequestError('Kullanıcı adı zaten kullanılıyor');
        }
        user.username = updateData.username;
    }
    if (updateData.email && updateData.email !== user.email) {
         if (Array.from(users.values()).some(u => u.email === updateData.email && u.id !== userId)) {
            throw new BadRequestError('E-posta adresi zaten kullanılıyor');
        }
        // TODO: Add email format validation
        user.email = updateData.email;
    }
    if (typeof updateData.isActive === 'boolean') {
        user.isActive = updateData.isActive;
    }
    // Add other updatable fields here

    logger.info(`User ${userId} profile updated.`);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Delete a user.
 */
const deleteUser = async (userId: string): Promise<void> => {
    if (!users.has(userId)) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }
    // TODO: Consider soft delete vs hard delete
    users.delete(userId);
    // Clean up any related data (e.g., password reset tokens)
    Array.from(passwordResetTokens.entries()).forEach(([token, info]) => {
        if (info.userId === userId) {
            passwordResetTokens.delete(token);
        }
    });
    logger.info(`User ${userId} deleted.`);
};


export default {
  register,
  login,
  refreshToken,
  logout,
  getUserById,
  getAllUsers,
  getUserDetailsForAuth, // Exported for authMiddleware
  requestPasswordReset,  // Exported for authRoutes
  resetPassword,         // Exported for authRoutes
  changePassword,        // Exported for authRoutes
  updateUserRoles,       // Exported for authRoutes
  getUserPermissions,    // Exported for authRoutes
  updateUserPermissions, // Exported for authRoutes
  updateUserProfile,     // Exported for authRoutes
  deleteUser             // Exported for authRoutes
};

