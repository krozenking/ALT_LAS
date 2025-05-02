// src/services/userService.ts
import { NotFoundError, BadRequestError } from "../utils/errors";

// Basic User interface (expand as needed)
interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Type for creating a user (roles optional)
type CreateUserData = { username: string; email: string; roles?: string[] };

// Interface for the userService object
interface IUserService {
  createUser(userData: CreateUserData): Promise<User>; // Restored
  getAllUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User | null>; // Restored
  updateUser(id: string, updateData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null>; // Restored
  deleteUser(id: string): Promise<boolean>; // Restored
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
  // Restored createUser
  async createUser(userData: CreateUserData): Promise<User> {
    if (!userData.username || !userData.email) {
      throw new BadRequestError("Username and email are required");
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
      roles: userData.roles || ["user"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(newUser.id, newUser);
    console.log(`User created: ${newUser.username} (ID: ${newUser.id})`);
    return newUser;
  },

  async getAllUsers(): Promise<User[]> {
    // Simplified implementation for testing
    console.log("getAllUsers called in simplified service");
    return Array.from(users.values());
  },

  async getUserById(id: string): Promise<User | null> {
    const user = users.get(id);
    if (!user) {
      return null;
    }
    return user;
  },

  async updateUser(id: string, updateData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User | null> {
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
    console.log(`User updated: ${updatedUser.username} (ID: ${updatedUser.id})`);
    return updatedUser;
  },

  async deleteUser(id: string): Promise<boolean> {
    const deleted = users.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    console.log(`User deleted: (ID: ${id})`);
    return true;
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

