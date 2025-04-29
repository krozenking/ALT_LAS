import { Router, Request, Response } from 'express'; // Import Request and Response
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'; // Import authorization
import logger from '../utils/logger';

import { runnerService } from '../services/serviceIntegration'; // Import the service
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
    asyncHandler(async (req: Request, res: Response) => { // Added types
      try {
        const { altFile, options = {} } = req.body;
        if (!altFile) {
            return res.status(400).json({ message: 'altFile is required' });
        }
        
        logger.info(`Runner request by user ${req.user?.id}: ${altFile}`);
        
        // TODO: Validate that the altFile exists and belongs to the user (or user is admin)
        // This might involve checking against segmentation service results or a shared storage

        // Prepare options, adding userId
        const runOptions = {
            ...options,
            metadata: {
                ...(options.metadata || {}),
                userId: req.user?.id,
                altFile: altFile
            }
        };

        // Call the Runner Service asynchronously using the correct method name
        const runnerResponse = await runnerService.runTask(altFile, runOptions); // Fixed method name
        
        logger.info(`Runner process started: ${runnerResponse.id} for altFile ${altFile}`);
        
        // Return the initial response from the runner service (likely includes ID and pending status)
        res.status(202).json(runnerResponse); // 202 Accepted for async start
      } catch (error) {
        logger.error('Error initiating Runner service:', error);
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
    asyncHandler(async (req: Request, res: Response) => { // Added types
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.roles?.includes('admin');

      logger.info(`Runner status query: ${id} by user ${userId}`);

      // Fetch status from the Runner Service using the correct method name
      const statusResult = await runnerService.getTaskStatus(id); // Fixed method name

      // Authorization check: Ensure the user owns the task or is an admin
      if (!isAdmin && statusResult.metadata?.userId !== userId) {
        // Use ForbiddenError from utils/errors if available, otherwise UnauthorizedError
        // Assuming ForbiddenError exists based on previous patterns
        // throw new ForbiddenError('You are not authorized to view this execution process');
        return res.status(403).json({ message: 'You are not authorized to view this execution process' });
      }

      logger.info(`Runner status retrieved for ${id}: ${statusResult.status}`);

      // Return the actual status from the service
      res.json(statusResult);
    })
);

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
    asyncHandler(async (req: Request, res: Response) => { // Added types
      const { id } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.roles?.includes('admin');

      logger.info(`Runner cancel request: ${id} by user ${userId}`);

      // Fetch task details first to check ownership/status using the correct method name
      const currentStatus = await runnerService.getTaskStatus(id); // Fixed method name

      // Authorization check
      if (!isAdmin && currentStatus.metadata?.userId !== userId) {
        // throw new ForbiddenError('You are not authorized to cancel this execution process');
        return res.status(403).json({ message: 'You are not authorized to cancel this execution process' });
      }

      // Check if the task is in a cancellable state
      if (!['pending', 'running'].includes(currentStatus.status)) {
          return res.status(400).json({ message: `Process cannot be cancelled in its current state: ${currentStatus.status}` });
      }

      // Call the Runner Service to request cancellation using the correct method name
      const cancelResult = await runnerService.cancelTask(id); // Fixed method name

      logger.info(`Runner cancellation requested for ${id}`);

      // Return the response from the cancellation request
      res.json(cancelResult);
    })
);

export default router;

