// src/routes/userRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

const router = express.Router();

// Middleware to apply JWT authentication to all user routes
router.use(authenticateJWT);

// GET /api/v1/users - List all users (Admin only)
router.get('/', authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    // Omit sensitive data if necessary before sending
    res.json(users.map(({ ...user }) => user)); // Simple mapping for now
  } catch (error) {
    logger.error('Error fetching all users:', error);
    next(error);
  }
});

// POST /api/v1/users - Create a new user (Admin only, or allow self-registration depending on policy)
router.post('/', authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add validation for request body here (e.g., using Joi or express-validator)
    const { username, email, roles } = req.body;
    if (!username || !email) {
        throw new BadRequestError('Username and email are required');
    }
    const newUser = await userService.createUser({ username, email, roles });
    // Omit sensitive data if necessary
    res.status(201).json(newUser);
  } catch (error) {
    logger.error('Error creating user:', error);
    next(error);
  }
});

// GET /api/v1/users/:id - Get a specific user (Admin or the user themselves)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    // Authorization check: Allow admin or the user themselves to view the profile
    if (req.user?.id !== userId && !req.user?.roles?.includes('admin')) {
        return next(new ForbiddenError('You are not authorized to view this user profile.'));
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    // Omit sensitive data if necessary
    res.json(user);
  } catch (error) {
    logger.error(`Error fetching user ${req.params.id}:`, error);
    next(error);
  }
});

// PUT /api/v1/users/:id - Update a user (Admin or the user themselves)
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    // Authorization check: Allow admin or the user themselves to update the profile
    if (req.user?.id !== userId && !req.user?.roles?.includes('admin')) {
        return next(new ForbiddenError('You are not authorized to update this user profile.'));
    }

    // Add validation for request body here
    const { username, email, roles } = req.body;
    
    // Prevent non-admins from changing roles
    let updateData: any = { username, email };
    if (req.user?.roles?.includes('admin')) {
        updateData.roles = roles;
    }

    const updatedUser = await userService.updateUser(userId, updateData);
    if (!updatedUser) {
        // This case is handled by updateUser throwing NotFoundError, but added for safety
        throw new NotFoundError(`User with ID ${userId} not found for update`);
    }
    // Omit sensitive data if necessary
    res.json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user ${req.params.id}:`, error);
    next(error);
  }
});

// DELETE /api/v1/users/:id - Delete a user (Admin only)
router.delete('/:id', authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    const success = await userService.deleteUser(userId);
    // deleteUser throws NotFoundError if user not found
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    logger.error(`Error deleting user ${req.params.id}:`, error);
    next(error);
  }
});

export default router;

