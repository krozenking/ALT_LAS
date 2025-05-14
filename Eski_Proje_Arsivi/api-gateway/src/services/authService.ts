import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorMiddleware";
import logger from "../utils/logger";
import jwtService from "../services/jwtService";
import sessionService, { DeviceInfo, SessionInfo } from "../services/sessionService";
import authorizationService from "../services/authorizationService";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../utils/errors";
import * as bcrypt from "bcrypt";
import crypto from "crypto";
import userService, { UserType as ExternalUserType, IUserService } from "./userService"; // Import userService and its types

// --- Mock Data Store (authService might still manage its own user representation or extend userService's) ---

interface User extends ExternalUserType { // Extend or use ExternalUserType
  // authService specific fields if any, otherwise ExternalUserType covers it
  // Ensure all fields used by authRoutes are here or in ExternalUserType
  // isEmailVerified, emailVerificationToken, emailVerificationTokenExpires should come from ExternalUserType
  // passwordHash is essential for authService
  passwordHash: string; 
  isAccountLocked?: boolean; // For admin updates
}

interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
}

// Mock user database (replace with actual DB interaction)
// This user map in authService should be consistent with or leverage userService's user store.
// For simplicity in this mock, we might have some redundancy or a strategy to keep them in sync.
// Ideally, userService is the single source of truth for user data, and authService uses it.
const users = new Map<string, User>(); // This might need to be refactored to use userService as primary store
const passwordResetTokens = new Map<string, PasswordResetToken>();

const saltRounds = 10;

const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, saltRounds);
};

const comparePassword = (plainPassword: string, hash: string): boolean => {
  try {
    return bcrypt.compareSync(plainPassword, hash);
  } catch (error) {
    logger.error("Bcrypt comparison failed:", error);
    return false;
  }
};

// Seed initial users - This should ideally use userService.createUser and then authService can retrieve
// For now, let's assume this seeding is for authService's local understanding or test data.
users.set("1", {
  id: "1",
  username: "admin",
  passwordHash: hashPassword("password"),
  email: "admin@example.com",
  roles: ["admin"],
  permissions: Object.keys(authorizationService.getPermissions()),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isEmailVerified: true,
  isAccountLocked: false,
});

users.set("2", {
  id: "2",
  username: "user",
  passwordHash: hashPassword("password"),
  email: "user@example.com",
  roles: ["user"],
  permissions: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  isEmailVerified: true,
  isAccountLocked: false,
});

// --- Service Functions --- 

const createUser = async (
  userData: Pick<
    User,
    "username" | "email" | "passwordHash" | "firstName" | "lastName" | "roles"
  >
): Promise<Partial<User>> => {
  // Delegate user creation to userService, then potentially add auth-specific info or just return userService result
  const createdUserPartial = await userService.createUser({
      username: userData.username,
      email: userData.email!,
      passwordHash: userData.passwordHash, // userService expects passwordHash now
      firstName: userData.firstName,
      lastName: userData.lastName,
      roles: userData.roles,
  });
  // Simulate fetching the full user if userService returns partial, or assume it's sufficient
  // For this example, we'll assume createdUserPartial is what we need to return from authService's perspective
  // If authService needs to store its own User record, it would do so here based on createdUserPartial.id
  const localUser = users.get(createdUserPartial.id!); // Attempt to get if it was seeded or sync
  if (localUser) {
      Object.assign(localUser, createdUserPartial, { passwordHash: hashPassword(userData.passwordHash) });
      users.set(localUser.id, localUser);
  } else {
      // If not found, create a local representation. This indicates a need for better sync strategy.
      const fullNewUser: User = {
          id: createdUserPartial.id!,
          username: createdUserPartial.username!,
          email: createdUserPartial.email!,
          passwordHash: hashPassword(userData.passwordHash),
          roles: createdUserPartial.roles || ["user"],
          permissions: [],
          isActive: true,
          firstName: createdUserPartial.firstName,
          lastName: createdUserPartial.lastName,
          createdAt: new Date(),
          updatedAt: new Date(),
          isEmailVerified: false, // Should align with userService
      };
      users.set(fullNewUser.id, fullNewUser);
  }
  // Return the partial user as per userService's return type for consistency
  return createdUserPartial;
};

const validateUser = async (
  username: string,
  password: string
): Promise<User> => {
  // This should ideally fetch user from userService, then compare password.
  // For now, using local `users` map for simplicity of auth logic.
  const user = Array.from(users.values()).find((u) => u.username === username);

  if (!user || !user.isActive) {
     logger.warn(`Giriş denemesi - Kullanıcı bulunamadı veya aktif değil: ${username}`);
     throw new UnauthorizedError("Geçersiz kullanıcı adı veya şifre ya da kullanıcı aktif değil");
  }
  // Email verification check using the User object from this service (which should be in sync)
  if (!user.isEmailVerified) { 
    logger.warn(`Giriş denemesi - E-posta doğrulanmamış: ${username}`);
    throw new UnauthorizedError("Lütfen giriş yapmadan önce e-posta adresinizi doğrulayın.");
  }
  if (!comparePassword(password, user.passwordHash)) {
    logger.warn(`Giriş denemesi - Yanlış şifre: ${username}`);
    throw new UnauthorizedError("Geçersiz kullanıcı adı veya şifre.");
  }
  return user;
};

const logout = async (accessToken: string, refreshToken: string): Promise<void> => {
    try {
        const decoded = jwtService.verifyToken(accessToken);
        if (decoded && decoded.userId) {
            // Invalidate the session associated with the refresh token
            sessionService.invalidateSessionByRefreshToken(refreshToken);
            logger.info(`User ${decoded.userId} logged out. Session for refresh token invalidated.`);
        } else {
            logger.warn(`Logout attempt with invalid access token.`);
            // Even if access token is invalid, try to invalidate refresh token if provided
            sessionService.invalidateSessionByRefreshToken(refreshToken);
        }
    } catch (error) {
        logger.error("Error during logout:", error);
        // Still attempt to invalidate refresh token as a best effort
        try {
            sessionService.invalidateSessionByRefreshToken(refreshToken);
        } catch (refreshError) {
            logger.error("Error invalidating refresh token during logout failure:", refreshError);
        }
        throw new UnauthorizedError("Logout failed. Invalid token.");
    }
};

const updateUser = async (userId: string, updateData: Partial<User>): Promise<Partial<User>> => {
    // Delegate to userService for actual update
    const updatedUserFromService = await userService.updateUser(userId, updateData);
    if (!updatedUserFromService) {
        throw new NotFoundError("Kullanıcı bulunamadı (userService)");
    }

    // Update local mock store if necessary (for authService's own logic if any)
    const localUser = users.get(userId);
    if (localUser) {
        // If password is being updated, hash it
        if (updateData.passwordHash && typeof updateData.passwordHash === 'string') {
            updateData.passwordHash = hashPassword(updateData.passwordHash);
        }
        Object.assign(localUser, updateData);
        localUser.updatedAt = new Date();
        users.set(userId, localUser);
        logger.info(`User ${userId} updated in authService local store.`);
    }
    // Return what userService returned
    const { passwordHash, ...userToReturn } = updatedUserFromService as User; // Cast to ensure passwordHash is omitted
    return userToReturn;
};

const deleteUser = async (userId: string): Promise<void> => {
    const success = await userService.deleteUser(userId);
    if (!success) {
        throw new NotFoundError("Kullanıcı silinemedi veya bulunamadı (userService)");
    }
    // Remove from local mock store if it exists
    if (users.has(userId)) {
        users.delete(userId);
        logger.info(`User ${userId} deleted from authService local store.`);
    }
};

const saveRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  logger.debug(`Placeholder saveRefreshToken called for user ${userId}`);
};

const validateRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    const session = sessionService.getSessionByRefreshToken(refreshToken);
    return session.userId === userId && session.expiresAt > new Date();
  } catch (error) {
    return false;
  }
};

const invalidateRefreshToken = async (
  userId: string,
  refreshToken: string
): Promise<void> => {
  try {
    sessionService.invalidateSessionByRefreshToken(refreshToken);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(
      `Error invalidating refresh token via sessionService: ${message}`
    );
  }
};

const createSession = async (
  userId: string,
  sessionId: string, // sessionId is not used as sessionService generates it
  ipAddress: string,
  userAgent: string
): Promise<void> => {
  const refreshToken = jwtService.generateRefreshToken(userId);
  sessionService.createSession(userId, refreshToken, { ip: ipAddress, userAgent });
  logger.info(`Session created for user ${userId}`);
};

const endSession = async (userId: string, sessionId: string): Promise<void> => {
  try {
    sessionService.invalidateSession(sessionId);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.warn(`Error ending session ${sessionId} for user ${userId}: ${message}`);
    throw new NotFoundError("Oturum bulunamadı veya zaten sonlandırılmış");
  }
};

const endAllSessions = async (userId: string): Promise<void> => {
  sessionService.invalidateAllUserSessions(userId);
  logger.info(`All sessions ended for user ${userId}`);
};

const endAllSessionsExcept = async (
  userId: string,
  currentSessionId: string
): Promise<void> => {
  const sessions = sessionService.getUserActiveSessions(userId);
  sessions.forEach((session: SessionInfo) => {
    if (session.id !== currentSessionId) {
      try {
        sessionService.invalidateSession(session.id);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(
          `Error ending session ${session.id} for user ${userId}: ${message}`
        );
      }
    }
  });
  logger.info(
    `All sessions except ${currentSessionId} ended for user ${userId}`
  );
};

const getUserById = async (userId: string): Promise<Partial<User> | null> => {
    // Prefer userService as the source of truth
    const userFromService = await userService.getUserById(userId);
    if (!userFromService) return null;

    // If authService needs to augment or use its local (potentially outdated) passwordHash:
    const localUser = users.get(userId);
    const passwordHash = localUser ? localUser.passwordHash : undefined;

    // Combine, ensuring passwordHash is not exposed unless specifically needed internally
    const combinedUser: Partial<User> = {
        ...userFromService,
        // passwordHash: passwordHash, // Only include if necessary for some authService logic, but not for external return
    };
    // For returning to routes, ensure passwordHash is stripped
    const { passwordHash: _, ...userToReturn } = combinedUser as User;
    return userToReturn;
};

const getUserByEmail = async (email: string): Promise<Partial<User> | null> => {
  // This should ideally use userService
  const user = Array.from(users.values()).find((u) => u.email === email); // Example: still using local mock
  if (!user) {
    return null;
  }
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const getUserDetailsForAuth = async (
  userId: string
): Promise<Express.User | null> => {
  const user = users.get(userId); // Using local mock for simplicity here
  if (!user || !user.isActive) {
    return null;
  }
  return {
    id: user.id,
    username: user.username,
    roles: user.roles,
    permissions: await getUserPermissions(user.id), // Recalculate effective permissions
  };
};

const getAllUsers = async (): Promise<Partial<User>[]> => {
  // Delegate to userService
  const usersFromService = await userService.getAllUsers();
  // Map to ensure passwordHash is not included from authService's perspective if it were to merge
  return usersFromService.map(u => {
      const { passwordHash, ...userToReturn } = u as User;
      return userToReturn;
  });
};

const getUserSessions = async (userId: string): Promise<SessionInfo[]> => {
  return sessionService.getUserActiveSessions(userId);
};

const savePasswordResetToken = async (
  userId: string,
  token: string,
  expiresAt: Date
): Promise<void> => {
  passwordResetTokens.set(token, { userId, token, expiresAt });
  logger.info(`Password reset token saved for user ${userId}`);
};

const validatePasswordResetToken = async (
  token: string
): Promise<Partial<User> | null> => {
  const resetInfo = passwordResetTokens.get(token);
  if (!resetInfo || resetInfo.expiresAt < new Date()) {
    return null;
  }
  return getUserById(resetInfo.userId);
};

const invalidatePasswordResetToken = async (token: string): Promise<void> => {
  passwordResetTokens.delete(token);
  logger.info(`Password reset token invalidated: ${token}`);
};

const requestPasswordReset = async (email: string): Promise<string | null> => {
  const userArray = Array.from(users.values()); // Using local mock
  const user = userArray.find(
    (u) => u.email === email && u.isActive
  );
  if (!user) {
    logger.warn(
      `Password reset requested for non-existent or inactive email: ${email}`
    );
    return null;
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000);
  await savePasswordResetToken(user.id, token, expiresAt);
  logger.info(
    `Password reset token generated for user ${user.id}. Token: ${token}. Email not sent (mock).`
  );
  return token;
};

const resetPassword = async (
  token: string,
  newPassword: string
): Promise<void> => {
  const userPartial = await validatePasswordResetToken(token);
  if (!userPartial || !userPartial.id) {
    throw new UnauthorizedError("Geçersiz veya süresi dolmuş şifre sıfırlama tokenı");
  }
  const userToUpdate = users.get(userPartial.id); // Get from local mock
  if (!userToUpdate) {
    throw new NotFoundError("Token ile ilişkili kullanıcı bulunamadı");
  }
  userToUpdate.passwordHash = hashPassword(newPassword);
  userToUpdate.updatedAt = new Date();
  users.set(userToUpdate.id, userToUpdate);
  await invalidatePasswordResetToken(token);
  await endAllSessions(userToUpdate.id);
  logger.info(`User ${userToUpdate.id} password reset successfully.`);
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const user = users.get(userId); // Local mock
  if (!user) {
    throw new NotFoundError("Kullanıcı bulunamadı");
  }
  if (!comparePassword(currentPassword, user.passwordHash)) {
    throw new UnauthorizedError("Mevcut şifre yanlış");
  }
  if (currentPassword === newPassword) {
    throw new BadRequestError("Yeni şifre mevcut şifre ile aynı olamaz");
  }
  user.passwordHash = hashPassword(newPassword);
  user.updatedAt = new Date();
  users.set(userId, user);
  await endAllSessions(userId);
  logger.info(`User ${userId} changed their password successfully.`);
};

const updateUserRoles = async (
  userId: string,
  roles: string[]
): Promise<Partial<User>> => {
  const user = users.get(userId); // Local mock
  if (!user) {
    throw new NotFoundError("Kullanıcı bulunamadı");
  }
  const availableRoles = Object.keys(authorizationService.getRoles());
  const invalidRoles = roles.filter((role) => !availableRoles.includes(role));
  if (invalidRoles.length > 0) {
    throw new BadRequestError(`Geçersiz roller: ${invalidRoles.join(", ")}`);
  }
  user.roles = roles;
  user.updatedAt = new Date();
  users.set(userId, user);
  logger.info(`User ${userId} roles updated to: ${roles.join(", ")}`);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const getUserPermissions = async (userId: string): Promise<string[]> => {
  const user = users.get(userId); // Local mock
  if (!user) {
    throw new NotFoundError("Kullanıcı bulunamadı");
  }
  let allPermissions = new Set<string>(user.permissions || []);
  user.roles.forEach((roleName) => {
    const role = authorizationService.getRole(roleName);
    if (role && role.permissions) {
      role.permissions.forEach((permission) => allPermissions.add(permission));
    }
  });
  return Array.from(allPermissions);
};

const updateUserPermissions = async (
  userId: string,
  permissions: string[]
): Promise<Partial<User>> => {
  const user = users.get(userId); // Local mock
  if (!user) {
    throw new NotFoundError("Kullanıcı bulunamadı");
  }
  const availablePermissions = Object.keys(
    authorizationService.getPermissions()
  );
  const invalidPermissions = permissions.filter(
    (permission) => !availablePermissions.includes(permission)
  );
  if (invalidPermissions.length > 0) {
    throw new BadRequestError(
      `Geçersiz izinler: ${invalidPermissions.join(", ")}`
    );
  }
  user.permissions = permissions;
  user.updatedAt = new Date();
  users.set(userId, user);
  logger.info(`User ${userId} direct permissions updated.`);
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const refreshAccessToken = async (
  refreshToken: string
): Promise<{ token: string }> => {
  const session = sessionService.getSessionByRefreshToken(refreshToken);
  if (!session || session.expiresAt < new Date()) {
    throw new UnauthorizedError("Geçersiz veya süresi dolmuş refresh token");
  }
  const user = await getUserById(session.userId); // Uses updated getUserById
  if (!user || !(user as User).isActive) { // Cast to User to check isActive if it's on the local User type
    throw new UnauthorizedError("Kullanıcı bulunamadı veya aktif değil");
  }
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    roles: user.roles,
    permissions: await getUserPermissions(user.id!),
  };
  const newAccessToken = jwtService.generateToken(tokenPayload);
  return { token: newAccessToken };
};

export default {
  createUser,
  validateUser,
  logout, // Added
  updateUser, // Added
  deleteUser, // Added
  saveRefreshToken,
  validateRefreshToken,
  invalidateRefreshToken,
  createSession,
  endSession,
  endAllSessions,
  endAllSessionsExcept,
  getUserById,
  getUserByEmail,
  getUserDetailsForAuth,
  getAllUsers,
  getUserSessions,
  savePasswordResetToken,
  validatePasswordResetToken,
  invalidatePasswordResetToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateUserRoles,
  getUserPermissions,
  updateUserPermissions,
  refreshAccessToken,
};
