// src/services/userService.ts
import { NotFoundError, BadRequestError } from "../utils/errors";
import crypto from "crypto"; // For generating tokens
import logger from "../utils/logger";

// Basic User interface (expand as needed)
interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified?: boolean; // Added
  emailVerificationToken?: string; // Added
  emailVerificationTokenExpires?: Date; // Added
  // Add other fields like passwordHash if this User model is also used for authService internal storage
  // For now, keeping it as per the errors indicated for userService usage
  passwordHash?: string; // Assuming it might be needed if userService handles password directly
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  permissions?: string[];
}

// Type for creating a user (roles optional)
type CreateUserData = {
  username: string;
  email: string;
  passwordHash: string; // Assuming password comes hashed or needs hashing here
  roles?: string[];
  firstName?: string;
  lastName?: string;
};

// Interface for the userService object
interface IUserService {
  createUser(userData: CreateUserData): Promise<Partial<User>>; // Changed to Partial<User> to align with authService
  getAllUsers(): Promise<Partial<User>[]>; // Changed to Partial<User>
  getUserById(id: string): Promise<Partial<User> | null>; // Changed to Partial<User>
  updateUser(id: string, updateData: Partial<Omit<User, "id" | "createdAt">>): Promise<Partial<User> | null>; // Changed to Partial<User>
  deleteUser(id: string): Promise<boolean>;
  verifyEmail(token: string): Promise<void>; // Added
  generateEmailVerificationToken(userId: string): Promise<string>; // Added
  // getUserDetailsForAuth(userId: string): Promise<Express.User | null>; // Commented out
}

// In-memory store for demonstration purposes
const users: Map<string, User> = new Map();
let nextUserId = 1;

// Helper to generate unique IDs
const generateId = (): string => {
  return String(nextUserId++);
};

// Define the service object implementing the interface
const userService: IUserService = {
  async createUser(userData: CreateUserData): Promise<Partial<User>> {
    if (!userData.username || !userData.email || !userData.passwordHash) {
      throw new BadRequestError("Username, email, and password are required");
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(userData.email)) {
      throw new BadRequestError("Invalid email format");
    }
    for (const user of users.values()) {
      if (user.email === userData.email) {
        throw new BadRequestError("Email already exists");
      }
      if (user.username === userData.username) {
        throw new BadRequestError("Username already exists");
      }
    }
    const newUser: User = {
      id: generateId(),
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash, // Assuming passwordHash is provided or handled by authService
      roles: userData.roles || ["user"],
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEmailVerified: false,
      isActive: true, // Typically users are active, email verification is a separate step
    };
    users.set(newUser.id, newUser);
    logger.info(`User created: ${newUser.username} (ID: ${newUser.id})`);
    // Generate verification token upon creation
    await this.generateEmailVerificationToken(newUser.id);
    const { passwordHash, emailVerificationToken, emailVerificationTokenExpires, ...userToReturn } = newUser;
    return userToReturn;
  },

  async getAllUsers(): Promise<Partial<User>[]> {
    return Array.from(users.values()).map(user => {
      const { passwordHash, emailVerificationToken, emailVerificationTokenExpires, ...userToReturn } = user;
      return userToReturn;
    });
  },

  async getUserById(id: string): Promise<Partial<User> | null> {
    const user = users.get(id);
    if (!user) {
      return null;
    }
    const { passwordHash, emailVerificationToken, emailVerificationTokenExpires, ...userToReturn } = user;
    return userToReturn;
  },

  async updateUser(id: string, updateData: Partial<Omit<User, "id" | "createdAt">>): Promise<Partial<User> | null> {
    const user = users.get(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    if (updateData.email && updateData.email !== user.email) {
      for (const u of users.values()) {
        if (u.id !== id && u.email === updateData.email) {
          throw new BadRequestError("Email already exists");
        }
      }
      // If email is changed, mark as unverified and generate new token
      updateData.isEmailVerified = false;
    }
    if (updateData.username && updateData.username !== user.username) {
      for (const u of users.values()) {
        if (u.id !== id && u.username === updateData.username) {
          throw new BadRequestError("Username already exists");
        }
      }
    }
    const updatedUser: User = {
        ...user,
        ...updateData,
        roles: updateData.roles !== undefined ? updateData.roles : user.roles,
        updatedAt: new Date(),
    };
    users.set(id, updatedUser);
    logger.info(`User updated: ${updatedUser.username} (ID: ${updatedUser.id})`);
    if (updateData.email && updateData.email !== user.email) {
        await this.generateEmailVerificationToken(id);
        logger.info(`Email changed for user ${id}. New verification token generated.`);
    }
    const { passwordHash, emailVerificationToken, emailVerificationTokenExpires, ...userToReturn } = updatedUser;
    return userToReturn;
  },

  async deleteUser(id: string): Promise<boolean> {
    const deleted = users.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    logger.info(`User deleted: (ID: ${id})`);
    return true;
  },

  async verifyEmail(token: string): Promise<void> {
    const user = Array.from(users.values()).find(u => u.emailVerificationToken === token);
    if (!user) {
        throw new BadRequestError("Invalid or expired email verification token.");
    }
    if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
        // Optionally, regenerate token or prompt user to request a new one
        await this.generateEmailVerificationToken(user.id); // Regenerate on expiry for simplicity here
        throw new BadRequestError("Email verification token has expired. A new token has been generated and sent (mock).");
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    user.updatedAt = new Date();
    users.set(user.id, user);
    logger.info(`Email verified for user ${user.username} (ID: ${user.id})`);
  },

  async generateEmailVerificationToken(userId: string): Promise<string> {
    const user = users.get(userId);
    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found.`);
    }
    if (user.isEmailVerified) {
        // This case might be handled in routes, but good to have a check here too
        logger.info(`Email already verified for user ${userId}. No new token generated.`);
        return "Email already verified.";
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 3600000); // Token expires in 24 hours
    user.updatedAt = new Date();
    users.set(user.id, user);
    logger.info(`Email verification token generated for user ${userId}: ${token}. (Mock email sent)`);
    // In a real app, send an email with this token
    return token;
  },

  /* // Commented out getUserDetailsForAuth
  async getUserDetailsForAuth(userId: string): Promise<Express.User | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      username: user.username,
      roles: user.roles,
    };
  }
  */
};

export default userService;
export type { User as UserType, IUserService }; // Export UserType for use in authService if needed

