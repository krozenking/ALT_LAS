import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import logger from '../utils/logger';
import jwtService from '../services/jwtService';
import sessionService, { DeviceInfo } from '../services/sessionService';
import authorizationService from '../services/authorizationService'; // Import authorizationService
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
  firstName?: string; // Added for profile
  lastName?: string; // Added for profile
  createdAt?: Date; // Added for profile
  updatedAt?: Date; // Added for profile
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
    // In a real app, use bcrypt.hashSync(password, saltRounds);
    return `hashed_${password}`;
}

// Helper to compare password
const comparePassword = (plainPassword: string, hash: string): boolean => {
    // WARNING: Insecure comparison for demonstration only!
    // In a real app, use bcrypt.compareSync(plainPassword, hash);
    return `hashed_${plainPassword}` === hash;
}

// Seed initial users
users.set('1', {
  id: '1',
  username: 'admin',
  passwordHash: simpleHash('password'), 
  email: 'admin@example.com',
  roles: ['admin'],
  permissions: Object.keys(authorizationService.getPermissions()), // Admin has all permissions
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

users.set('2', {
  id: '2',
  username: 'user',
  passwordHash: simpleHash('password'), 
  email: 'user@example.com',
  roles: ['user'],
  permissions: [], // User might get permissions dynamically or via roles
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// --- Service Functions --- 

/**
 * Create a new user.
 */
const createUser = async (
  userData: Pick<User, 'username' | 'email' | 'passwordHash' | 'firstName' | 'lastName' | 'roles'>
): Promise<Partial<User>> => {
  if (Array.from(users.values()).some(u => u.username === userData.username)) {
    throw new BadRequestError('Bu kullanıcı adı zaten kullanılıyor');
  }
  if (userData.email && Array.from(users.values()).some(u => u.email === userData.email)) {
    throw new BadRequestError('Bu e-posta adresi zaten kullanılıyor');
  }
  if (!userData.passwordHash || userData.passwordHash.length < 6) {
    // Note: This check should be on the plain password before hashing in a real app
    throw new BadRequestError('Şifre en az 6 karakter olmalıdır');
  }

  const id = crypto.randomUUID();
  const newUser: User = {
    id,
    username: userData.username,
    passwordHash: simpleHash(userData.passwordHash), // Hash the password
    email: userData.email,
    roles: userData.roles || ['user'],
    permissions: [], // Start with no direct permissions
    isActive: true, // Activate user by default
    firstName: userData.firstName,
    lastName: userData.lastName,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.set(id, newUser);
  logger.info(`Yeni kullanıcı oluşturuldu: ${newUser.username} (ID: ${id})`);

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Validate user credentials.
 */
const validateUser = async (username: string, password: string): Promise<User> => {
  const user = Array.from(users.values()).find(u => u.username === username);

  if (!user || !user.isActive || !comparePassword(password, user.passwordHash)) {
    logger.warn(`Geçersiz giriş denemesi: ${username}`);
    throw new UnauthorizedError("Geçersiz kullanıcı adı veya şifre ya da kullanıcı aktif değil");
  }
  return user;
};

/**
 * Save refresh token (associating with user - simple example).
 * In a real app, this would be stored securely, likely in the session store.
 */
const saveRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  // This is a placeholder. Refresh tokens are managed by sessionService.
  logger.debug(`Placeholder saveRefreshToken called for user ${userId}`);
};

/**
 * Validate refresh token.
 * In a real app, check against the session store.
 */
const validateRefreshToken = async (userId: string, refreshToken: string): Promise<boolean> => {
  try {
    const session = sessionService.getSessionByRefreshToken(refreshToken);
    return session.userId === userId && session.expiresAt > new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Invalidate refresh token.
 * In a real app, remove/invalidate from the session store.
 */
const invalidateRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  try {
    sessionService.invalidateSessionByRefreshToken(refreshToken);
  } catch (error) {
    logger.warn(`Error invalidating refresh token via sessionService: ${error.message}`);
  }
};

/**
 * Create a user session.
 */
const createSession = async (userId: string, sessionId: string, ipAddress: string, userAgent: string): Promise<void> => {
  // This is a placeholder. Sessions are managed by sessionService.
  // A refresh token would typically be generated here and stored in the session.
  const refreshToken = jwtService.generateRefreshToken(userId); // Generate a token
  sessionService.createSession(userId, refreshToken, { ipAddress, userAgent, id: sessionId });
  logger.info(`Session created for user ${userId}, session ID: ${sessionId}`);
};

/**
 * End a specific user session.
 */
const endSession = async (userId: string, sessionId: string): Promise<void> => {
  try {
    sessionService.invalidateSessionById(sessionId);
  } catch (error) {
    logger.warn(`Error ending session ${sessionId} for user ${userId}: ${error.message}`);
    throw new NotFoundError('Oturum bulunamadı veya zaten sonlandırılmış');
  }
};

/**
 * End all sessions for a user.
 */
const endAllSessions = async (userId: string): Promise<void> => {
  sessionService.invalidateAllUserSessions(userId);
  logger.info(`All sessions ended for user ${userId}`);
};

/**
 * End all sessions for a user except the specified one.
 */
const endAllSessionsExcept = async (userId: string, currentSessionId: string): Promise<void> => {
  const sessions = sessionService.getUserSessions(userId);
  sessions.forEach(session => {
    if (session.id !== currentSessionId) {
      try {
        sessionService.invalidateSessionById(session.id);
      } catch (error) {
        logger.warn(`Error ending session ${session.id} for user ${userId}: ${error.message}`);
      }
    }
  });
  logger.info(`All sessions except ${currentSessionId} ended for user ${userId}`);
};

/**
 * Get user details by ID (excluding password).
 */
const getUserById = async (userId: string): Promise<Partial<User> | null> => {
  const user = users.get(userId);
  if (!user) {
    return null;
  }
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Get user details by Email (excluding password).
 */
const getUserByEmail = async (email: string): Promise<Partial<User> | null> => {
  const user = Array.from(users.values()).find(u => u.email === email);
  if (!user) {
    return null;
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
 * Get user sessions.
 */
const getUserSessions = async (userId: string): Promise<any[]> => {
  return sessionService.getUserSessions(userId);
};

/**
 * Save password reset token.
 */
const savePasswordResetToken = async (userId: string, token: string, expiresAt: Date): Promise<void> => {
  passwordResetTokens.set(token, { userId, token, expiresAt });
  logger.info(`Password reset token saved for user ${userId}`);
};

/**
 * Validate password reset token.
 */
const validatePasswordResetToken = async (token: string): Promise<Partial<User> | null> => {
  const resetInfo = passwordResetTokens.get(token);
  if (!resetInfo || resetInfo.expiresAt < new Date()) {
    return null;
  }
  return getUserById(resetInfo.userId);
};

/**
 * Invalidate password reset token.
 */
const invalidatePasswordResetToken = async (token: string): Promise<void> => {
  passwordResetTokens.delete(token);
  logger.info(`Password reset token invalidated: ${token}`);
};

/**
 * Request a password reset.
 */
const requestPasswordReset = async (email: string): Promise<string | null> => {
    const user = Array.from(users.values()).find(u => u.email === email && u.isActive);
    if (!user) {
        logger.warn(`Password reset requested for non-existent or inactive email: ${email}`);
        return null; // Don't throw error, just return to prevent email enumeration
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    // Store the token (associate with user ID)
    await savePasswordResetToken(user.id, token, expiresAt);

    // TODO: Send email to user.email with the reset link/token
    logger.info(`Password reset token generated for user ${user.id}. Token: ${token}. Email not sent (mock).`);
    return token; // Return token for potential use (e.g., in response during dev)
};

/**
 * Reset password using a token.
 */
const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const user = await validatePasswordResetToken(token);
    if (!user) {
        throw new UnauthorizedError('Geçersiz veya süresi dolmuş şifre sıfırlama tokenı');
    }

    const userToUpdate = users.get(user.id!);
    if (!userToUpdate) {
        throw new NotFoundError('Token ile ilişkili kullanıcı bulunamadı');
    }

    // Update password
    userToUpdate.passwordHash = simpleHash(newPassword);
    userToUpdate.updatedAt = new Date();

    // Invalidate the reset token
    await invalidatePasswordResetToken(token);
    // Invalidate all active sessions for the user
    await endAllSessions(user.id!);

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

    if (currentPassword === newPassword) {
        throw new BadRequestError('Yeni şifre mevcut şifre ile aynı olamaz');
    }

    user.passwordHash = simpleHash(newPassword);
    user.updatedAt = new Date();
    // Invalidate all active sessions on password change
    await endAllSessions(userId);

    logger.info(`User ${userId} changed their password successfully.`);
};

/**
 * Update user roles.
 */
const updateUserRoles = async (userId: string, roles: string[]): Promise<Partial<User>> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }

    // Validate roles against the available roles in authorizationService
    const availableRoles = Object.keys(authorizationService.getRoles());
    const invalidRoles = roles.filter(role => !availableRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestError(`Geçersiz roller: ${invalidRoles.join(', ')}`);
    }

    user.roles = roles;
    user.updatedAt = new Date();
    logger.info(`User ${userId} roles updated to: ${roles.join(', ')}`);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Get user permissions (direct and from roles).
 */
const getUserPermissions = async (userId: string): Promise<string[]> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }
    
    let allPermissions = new Set<string>(user.permissions || []);
    
    // Add permissions from roles
    user.roles.forEach(roleName => {
        const role = authorizationService.getRole(roleName);
        if (role && role.permissions) {
            role.permissions.forEach(permission => allPermissions.add(permission));
        }
    });

    return Array.from(allPermissions);
};

/**
 * Update user's direct permissions.
 */
const updateUserPermissions = async (userId: string, permissions: string[]): Promise<Partial<User>> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }

    // Validate permissions against the available permissions in authorizationService
    const availablePermissions = Object.keys(authorizationService.getPermissions());
    const invalidPermissions = permissions.filter(permission => !availablePermissions.includes(permission));
    if (invalidPermissions.length > 0) {
      throw new BadRequestError(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
    }

    user.permissions = permissions;
    user.updatedAt = new Date();
    logger.info(`User ${userId} direct permissions updated.`);
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

/**
 * Update user profile information.
 */
const updateUser = async (userId: string, updateData: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'isActive'>>): Promise<Partial<User>> => {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
    }

    let updated = false;

    // Validate and update fields
    if (updateData.firstName !== undefined && updateData.firstName !== user.firstName) {
        user.firstName = updateData.firstName;
        updated = true;
    }
    if (updateData.lastName !== undefined && updateData.lastName !== user.lastName) {
        user.lastName = updateData.lastName;
        updated = true;
    }
    if (updateData.email && updateData.email !== user.email) {
         if (Array.from(users.values()).some(u => u.email === updateData.email && u.id !== userId)) {
            throw new BadRequestError('E-posta adresi zaten kullanılıyor');
        }
        // TODO: Add email format validation
        user.email = updateData.email;
        updated = true;
    }
    if (typeof updateData.isActive === 'boolean' && updateData.isActive !== user.isActive) {
        user.isActive = updateData.isActive;
        updated = true;
    }
    // Add other updatable fields here

    if (updated) {
        user.updatedAt = new Date();
        logger.info(`User ${userId} profile updated.`);
    }

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
    // Clean up any related data (e.g., password reset tokens, sessions)
    Array.from(passwordResetTokens.entries()).forEach(([token, info]) => {
        if (info.userId === userId) {
            passwordResetTokens.delete(token);
        }
    });
    sessionService.invalidateAllUserSessions(userId);
    logger.info(`User ${userId} deleted.`);
};


export default {
  createUser,
  validateUser,
  saveRefreshToken, // Keep for potential direct use, though sessionService is primary
  validateRefreshToken, // Keep for potential direct use
  invalidateRefreshToken, // Keep for potential direct use
  createSession,
  endSession,
  endAllSessions,
  endAllSessionsExcept,
  getUserById,
  getUserByEmail,
  getAllUsers,
  getUserDetailsForAuth, // Exported for authMiddleware
  getUserSessions,
  savePasswordResetToken,
  validatePasswordResetToken,
  invalidatePasswordResetToken,
  requestPasswordReset,  // Exported for passwordRoutes
  resetPassword,         // Exported for passwordRoutes
  changePassword,        // Exported for passwordRoutes
  updateUserRoles,       // Exported for authRoutes (admin)
  getUserPermissions,    // Exported for authRoutes (admin)
  updateUserPermissions, // Exported for authRoutes (admin)
  updateUser,            // Exported for authRoutes (profile & admin)
  deleteUser             // Exported for authRoutes (admin)
};

