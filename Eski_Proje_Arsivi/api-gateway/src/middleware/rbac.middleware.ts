import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload as AuthServiceJwtPayload } from '../modules/auth/auth.service'; // Adjust path as needed

// --- Role and Permission Definitions ---

// Define permissions (actions that can be performed)
export enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  READ_DATA = 'read:data',
  WRITE_DATA = 'write:data',
  // Add more specific permissions as needed
}

// Define roles and their associated permissions
export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
  GUEST = 'guest',
}

// Map roles to permissions (can be loaded from config/DB)
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [Permission.READ_USERS, Permission.WRITE_USERS, Permission.DELETE_USERS, Permission.READ_DATA, Permission.WRITE_DATA],
  [UserRole.EDITOR]: [Permission.READ_DATA, Permission.WRITE_DATA],
  [UserRole.USER]: [Permission.READ_DATA],
  [UserRole.GUEST]: [],
};

// --- Express Request Extension ---

// Align with existing Express.User which expects 'id'
// AuthServiceJwtPayload already has userId, we'll map it to id
interface ExtendedJwtPayload extends AuthServiceJwtPayload {
    id: string | number; // Add id based on userId
    roles?: UserRole[]; // Use UserRole[] here
    jti?: string;
}

// Extend Express Request interface to include user information
export interface AuthenticatedRequest extends Request {
  user?: ExtendedJwtPayload & { // Combine payload with derived permissions
    permissions?: Permission[];
  };
}

// --- Authentication Service Instance ---

const authService = new AuthService();

// --- Middleware Functions ---

/**
 * Middleware to authenticate requests using JWT.
 * Verifies the token and attaches user payload (including roles and derived permissions) to the request.
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    // Assuming verifyToken returns the payload including roles and jti if present
    const verifiedPayload = authService.verifyToken(token);

    // Ensure roles are an array of valid UserRole enum values, default to USER if not present/valid
    const validatedRoles: UserRole[] = Array.isArray(verifiedPayload.roles) && verifiedPayload.roles.length > 0
                  ? verifiedPayload.roles.filter((role): role is UserRole => Object.values(UserRole).includes(role as UserRole))
                  : [UserRole.USER];
    // If after filtering, roles array is empty (e.g., token had invalid roles), default to USER
    if (validatedRoles.length === 0) {
        validatedRoles.push(UserRole.USER);
    }

    // Derive permissions from the validated roles
    const permissions = validatedRoles.reduce((acc, role) => {
      const rolePerms = rolePermissions[role] || [];
      rolePerms.forEach(perm => acc.add(perm));
      return acc;
    }, new Set<Permission>());

    // Construct the final req.user object with validated roles and derived permissions
    req.user = {
        ...verifiedPayload, // Spread the original verified payload (userId, jti, etc.)
        id: verifiedPayload.userId, // Map userId to id for compatibility with Express.User
        roles: validatedRoles, // Assign the validated roles
        permissions: Array.from(permissions)
    };

    next(); // pass the execution to the next handler/middleware
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    // Send appropriate status based on error type (e.g., 403 for expired/invalid)
    return res.status(403).json({ message: error.message || 'Invalid or expired token' });
  }
};

/**
 * Middleware factory to authorize requests based on required roles.
 * @param requiredRoles - An array of roles, user must have at least one.
 */
export const authorizeRoles = (requiredRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: 'Access forbidden: User roles not found' });
    }

    const hasRequiredRole = req.user.roles.some(role => requiredRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({ message: 'Access forbidden: Insufficient role' });
    }

    next(); // user has the required role, proceed
  };
};

/**
 * Middleware factory to authorize requests based on required permissions.
 * @param requiredPermissions - An array of permissions, user must have all.
 */
export const authorizePermissions = (requiredPermissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({ message: 'Access forbidden: User permissions not found' });
    }

    // Ensure permissions array exists before checking
    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
    }

    next(); // user has all required permissions, proceed
  };
};

// --- Example Usage ---
// import { authenticateToken, authorizeRoles, authorizePermissions, UserRole, Permission } from './middleware/rbac.middleware';
// router.get('/admin-only', authenticateToken, authorizeRoles([UserRole.ADMIN]), (req, res) => { ... });
// router.get('/users', authenticateToken, authorizePermissions([Permission.READ_USERS]), (req, res) => { ... });
// router.post('/users', authenticateToken, authorizePermissions([Permission.WRITE_USERS]), (req, res) => { ... });

