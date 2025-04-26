import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'; // Import authorization
import logger from '../utils/logger';

// Swagger JSDoc for route definitions
/**
 * @swagger
 * tags:
 *   name: Runner
 *   description: Alt task execution operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RunnerRequest:
 *       type: object
 *       required:
 *         - altFile
 *       properties:
 *         altFile:
 *           type: string
 *           description: Name of the .alt file to process (usually related to segmentation ID)
 *         options:
 *           type: object
 *           additionalProperties: true
 *           description: Execution options
 *     RunnerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Execution process ID
 *         status:
 *           type: string
 *           enum: [success, error, pending, running, cancelled] # Added cancelled
 *           description: Process status
 *         lastFile:
 *           type: string
 *           description: Name of the generated .last file (on success)
 *         progress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Process progress percentage
 *         metadata:
 *           type: object
 *           properties:
 *             startTime:
 *               type: string
 *               format: date-time
 *             endTime:
 *               type: string
 *               format: date-time
 *             altFile:
 *               type: string
 */

const router = Router();

// Apply JWT authentication to all runner routes
router.use(authenticateJWT);

/**
 * @swagger
 * /api/v1/runner:
 *   post:
 *     summary: Run alt task
 *     description: Processes an .alt file and generates a .last file (User role required)
 *     tags: [Runner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RunnerRequest'
 *     responses:
 *       202:
 *         description: Execution successfully started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RunnerResponse'
 *       400:
 *         description: Invalid request (e.g., missing altFile)
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role)
 *       500:
 *         description: Server error (Runner service unreachable, etc.)
 */
router.post(
    '/', 
    authorizeRoles('user', 'admin'), // Requires user or admin role
    asyncHandler(async (req, res) => {
      try {
        const { altFile, options = {} } = req.body;
        if (!altFile) {
            return res.status(400).json({ message: 'altFile is required' });
        }
        
        logger.info(`Runner request by user ${req.user?.id}: ${altFile}`);
        
        // In a real application, make a request to the Runner Service
        // TODO: Validate that the altFile exists and belongs to the user (or user is admin)
        // TODO: Call the actual Runner Service asynchronously

        // Mock response
        const runnerId = `run_${Math.random().toString(36).substring(2, 9)}`;
        const startTime = new Date().toISOString();
        
        const response = {
          id: runnerId,
          status: 'pending', // Indicate the process has started/queued
          progress: 0,
          lastFile: null,
          metadata: {
              startTime: startTime,
              altFile: altFile,
              userId: req.user?.id
          }
        };
        
        res.status(202).json(response); // 202 Accepted for async start
      } catch (error) {
        logger.error('Error in Runner service:', error);
        throw error;
      }
}));

/**
 * @swagger
 * /api/v1/runner/{id}:
 *   get:
 *     summary: Get execution status
 *     description: Queries the status of an execution process (User role required)
 *     tags: [Runner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution process ID
 *     responses:
 *       200:
 *         description: Execution status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RunnerResponse'
 *       404:
 *         description: Not found
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role or process does not belong to user)
 *       500:
 *         description: Server error
 */
router.get(
    '/:id', 
    authorizeRoles('user', 'admin'), // Requires user or admin role
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.roles?.includes('admin');
      
      logger.info(`Runner status query: ${id} by user ${userId}`);
      
      // In a real application, query status from the Runner Service
      // TODO: Implement logic to fetch status from the actual service
      // TODO: Check if the requesting user owns the runner task or is an admin

      // Mock response - assuming the task exists and belongs to the user or user is admin
      const progress = Math.floor(Math.random() * 101); // 0-100
      let status = 'running';
      let lastFile = null;
      let endTime = null;
      if (progress >= 100) {
          status = 'success';
          lastFile = `result_${id}.last`;
          endTime = new Date().toISOString();
      } else if (id.endsWith('e')) { // Simulate error for testing
          status = 'error';
          endTime = new Date().toISOString();
      } else if (id.endsWith('c')) { // Simulate cancelled for testing
          status = 'cancelled';
          endTime = new Date().toISOString();
      }

      // Basic authorization check (example - needs proper implementation)
      // if (!isAdmin && fetchedTask.userId !== userId) { 
      //   throw new ForbiddenError('You are not authorized to view this execution process');
      // }
      
      res.json({
        id,
        status,
        progress,
        lastFile,
        metadata: {
            startTime: new Date(Date.now() - 120000).toISOString(), // Simulate past time
            endTime: endTime,
            altFile: `task_${id.substring(4)}.alt`, // Guessing altFile name
            userId: userId // Placeholder
        }
      });
}));

/**
 * @swagger
 * /api/v1/runner/{id}/cancel:
 *   post:
 *     summary: Cancel execution process
 *     description: Cancels an ongoing execution process (User role required)
 *     tags: [Runner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution process ID
 *     responses:
 *       200:
 *         description: Cancellation request successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RunnerResponse'
 *       404:
 *         description: Process not found or already completed/cancelled
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role or process does not belong to user)
 *       500:
 *         description: Server error
 */
router.post(
    '/:id/cancel', 
    authorizeRoles('user', 'admin'), // Requires user or admin role
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.roles?.includes('admin');
      
      logger.info(`Runner cancel request: ${id} by user ${userId}`);
      
      // In a real application, send cancel request to Runner Service
      // TODO: Fetch task details first to check ownership/status
      // TODO: Check if the requesting user owns the runner task or is an admin
      // TODO: Check if the task is in a cancellable state (pending/running)
      // TODO: Call the actual Runner Service to request cancellation

      // Mock response - assuming cancellation request was accepted
      res.json({
        id,
        status: 'cancelling', // Indicate cancellation is in progress
        progress: 0, // Or current progress
        lastFile: null,
        metadata: {
            // ... existing metadata ...
            userId: userId
        }
      });
}));

export default router;

