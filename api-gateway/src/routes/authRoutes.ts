import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles, authorizePermissions } from '../middleware/authMiddleware'; 
import sessionService, { DeviceInfo } from '../services/sessionService';
import authService from '../services/authService'; 
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization operations
 */

// --- Public Routes --- 

router.post('/register', asyncHandler(async (req, res) => {
  const { username, password, email } = req.body; // Added email
  // TODO: Validate input (username, password strength, email format)
  // Assign default role 'user'
  const result = await authService.register(username, password, email, ['user']); 
  logger.info(`New user registered: ${username}`);
  res.status(201).json(result);
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  // TODO: Validate input
  
  // Extract device info from request headers (example)
  const deviceInfo: DeviceInfo = {
    userAgent: req.headers["user-agent"],
    ip: req.ip, // Ensure express is configured to trust proxy if needed
    // You might add more specific device identification logic here
    deviceName: req.headers["user-agent"]?.split("(")[1]?.split(")")[0] || "Unknown Device"
  };

  const result = await authService.login(username, password, deviceInfo);
  logger.info(`User login successful: ${username} from ${deviceInfo.deviceName}`);
  res.json(result);
}));

router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  // TODO: Validate input
  const result = await authService.refreshToken(refreshToken);
  logger.info('Token refresh successful');
  res.json(result);
}));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Sends a password reset request
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset instructions sent (if email is registered)
 *       400:
 *         description: Invalid request (email missing/format error)
 *       404:
 *         description: Email address not found (Usually returns 200 for security)
 *       500:
 *         description: Server error
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
    const { email } = req.body;
    // TODO: Validate email format
    if (!email) {
        return res.status(400).json({ message: 'Email address is required' });
    }
    // TODO: Implement authService.requestPasswordReset(email)
    // This service should generate a reset token, store it (with expiry), and send an email
    await authService.requestPasswordReset(email);
    logger.info(`Password reset request sent for: ${email}`);
    // Always return a generic success message for security
    res.json({ message: 'If your email address is registered in our system, password reset instructions will be sent.' });
}));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Sets a new password (with reset token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - token
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid request (token/password missing or password doesn't meet policy)
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    // TODO: Validate token and newPassword (strength)
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }
    // TODO: Implement authService.resetPassword(token, newPassword)
    // This service should validate the token, find the user, update the password, and invalidate the token
    await authService.resetPassword(token, newPassword);
    logger.info('Password reset successfully');
    res.json({ message: 'Your password has been successfully reset.' });
}));

// --- Authenticated Routes --- 

router.use(authenticateJWT);

router.post("/logout", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1] || "";
  const { refreshToken } = req.body; // Get refresh token from body if provided
  
  await authService.logout(token, refreshToken); 
  logger.info(`User logout: ${req.user?.username}`);
  res.json({ message: "Successfully logged out" });
}));

router.get('/me', asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    // This should ideally not happen if authenticateJWT is working correctly
    return res.status(401).json({ message: 'Authorization required' }); 
  }
  // Use the user object already fetched by authenticateJWT
  logger.info(`User details requested: ${req.user?.username}`);
  // Omit sensitive data if necessary before sending
  const { id, username, roles, permissions, /* other safe fields */ } = req.user || {};
  res.json({ id, username, roles, permissions });
}));

/**
 * @swagger
 * /api/auth/me/password:
 *   put:
 *     summary: Changes the current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Invalid request (passwords missing or new password doesn't meet policy)
 *       401:
 *         description: Current password incorrect
 *       500:
 *         description: Server error
 */
router.put('/me/password', asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    // TODO: Validate passwords
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Authorization required' });
    }
    // TODO: Implement authService.changePassword(userId, currentPassword, newPassword)
    await authService.changePassword(userId, currentPassword, newPassword);
    logger.info(`User ${userId} changed password`);
    res.json({ message: 'Your password has been successfully changed.' });
}));

// --- Admin & Permissioned Routes --- 

router.get(
    '/users', 
    authorizeRoles('admin'), 
    authorizePermissions('read:users'), 
    asyncHandler(async (req, res) => {
      const users = await authService.getAllUsers();
      logger.info(`All users listed by admin ${req.user?.id}`);
      res.json(users);
}));

router.get(
    '/users/:userId',
    authorizeRoles('admin'), 
    authorizePermissions('read:users'), 
    asyncHandler(async (req, res) => {
      const targetUserId = req.params.userId;
      const user = await authService.getUserById(targetUserId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      logger.info(`User ${targetUserId} details requested by admin ${req.user?.id}`);
      res.json(user);
}));

router.put(
    '/users/:userId/roles',
    authorizeRoles('admin'), 
    authorizePermissions('manage:roles'), 
    asyncHandler(async (req, res) => {
      const targetUserId = req.params.userId;
      const { roles } = req.body;
      if (!Array.isArray(roles)) {
          return res.status(400).json({ message: 'Roles must be an array' });
      }
      // TODO: Validate roles against a predefined list of valid roles
      await authService.updateUserRoles(targetUserId, roles);
      logger.info(`User ${targetUserId} roles updated by admin ${req.user?.id}`);
      res.json({ message: 'Roles updated successfully' });
}));

router.get(
    '/users/:userId/permissions',
    authorizeRoles('admin'), 
    authorizePermissions('read:permissions'), 
    asyncHandler(async (req, res) => {
        const targetUserId = req.params.userId;
        // TODO: Implement authService.getUserPermissions(targetUserId)
        const permissions = await authService.getUserPermissions(targetUserId); 
        logger.info(`User ${targetUserId} permissions viewed by admin ${req.user?.id}`);
        res.json({ userId: targetUserId, permissions });
}));

router.put(
    '/users/:userId/permissions',
    authorizeRoles('admin'), 
    authorizePermissions('manage:permissions'), 
    asyncHandler(async (req, res) => {
        const targetUserId = req.params.userId;
        const { permissions } = req.body;
        if (!Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Permissions must be an array' });
        }
        // TODO: Validate permissions against a predefined list of valid permissions
        // TODO: Implement authService.updateUserPermissions(targetUserId, permissions)
        await authService.updateUserPermissions(targetUserId, permissions);
        logger.info(`User ${targetUserId} permissions updated by admin ${req.user?.id}`);
        res.json({ message: 'Permissions updated successfully' });
}));

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   put:
 *     summary: Updates user profile (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isActive:
 *                 type: boolean
 *             # Add other updatable fields
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authorization error
 *       403:
 *         description: Permission error (Admin required)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put(
    '/users/:userId',
    authorizeRoles('admin'),
    authorizePermissions('manage:users'), // Requires permission to manage users
    asyncHandler(async (req, res) => {
        const targetUserId = req.params.userId;
        const updateData = req.body; // Contains fields like username, email, isActive, etc.
        // TODO: Validate updateData
        // TODO: Implement authService.updateUserProfile(targetUserId, updateData)
        const updatedUser = await authService.updateUserProfile(targetUserId, updateData);
        logger.info(`User ${targetUserId} profile updated by admin ${req.user?.id}`);
        res.json(updatedUser);
}));

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   delete:
 *     summary: Deletes a user (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Authorization error
 *       403:
 *         description: Permission error (Admin required)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/users/:userId',
    authorizeRoles('admin'),
    authorizePermissions('delete:users'), // Requires permission to delete users
    asyncHandler(async (req, res) => {
        const targetUserId = req.params.userId;
        // Prevent admin from deleting themselves? Add check if needed.
        // if (targetUserId === req.user?.id) { ... }
        // TODO: Implement authService.deleteUser(targetUserId)
        await authService.deleteUser(targetUserId);
        logger.info(`User ${targetUserId} deleted by admin ${req.user?.id}`);
        res.status(204).send(); // No Content response
}));

export default router;




// --- Session Management Routes ---

/**
 * @swagger
 * /api/auth/me/sessions:
 *   get:
 *     summary: Lists the current user's active sessions
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   deviceInfo:
 *                     type: object
 *                     properties:
 *                       deviceName:
 *                         type: string
 *                       browser:
 *                         type: string
 *                       os:
 *                         type: string
 *                       ip:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   lastUsedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Authorization error
 *       500:
 *         description: Server error
 */
router.get("/me/sessions", asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Authorization required" });
    }
    const activeSessions = sessionService.getUserActiveSessions(userId);
    // Map sessions to exclude sensitive info like full refreshToken
    const safeSessions = activeSessions.map(s => ({
        id: s.id,
        deviceInfo: {
            deviceName: s.deviceInfo.deviceName,
            browser: s.deviceInfo.browser,
            os: s.deviceInfo.os,
            ip: s.deviceInfo.ip // Consider masking part of the IP
        },
        createdAt: s.createdAt,
        lastUsedAt: s.lastUsedAt
    }));
    logger.info(`User ${userId} listed their active sessions`);
    res.json(safeSessions);
}));

/**
 * @swagger
 * /api/auth/me/sessions/{sessionId}:
 *   delete:
 *     summary: Revokes a specific session for the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Session revoked successfully
 *       401:
 *         description: Authorization error
 *       403:
 *         description: Forbidden (trying to revoke another user's session)
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.delete("/me/sessions/:sessionId", asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const sessionIdToRevoke = req.params.sessionId;

    if (!userId) {
        return res.status(401).json({ message: "Authorization required" });
    }

    // Verify the session belongs to the current user before revoking
    const session = sessionService.getUserActiveSessions(userId).find(s => s.id === sessionIdToRevoke);
    if (!session) {
        // Session not found or doesn't belong to the user
        return res.status(404).json({ message: "Session not found or access denied" });
    }

    sessionService.invalidateSession(sessionIdToRevoke);
    logger.info(`User ${userId} revoked session ${sessionIdToRevoke}`);
    res.status(204).send();
}));

