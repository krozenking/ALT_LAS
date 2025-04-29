import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'; // Import authorization
import logger from '../utils/logger';

import { segmentationService } from '../services/serviceIntegration'; // Import the service
/**
 * @swagger
 * tags:
 *   name: Segmentation
 *   description: Command segmentation operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SegmentationRequest:
 *       type: object
 *       required:
 *         - command
 *       properties:
 *         command:
 *           type: string
 *           description: Command text
 *         mode:
 *           type: string
 *           enum: [Normal, Dream, Explore, Chaos]
 *           default: Normal
 *           description: Operating mode
 *         persona:
 *           type: string
 *           enum: [empathetic_assistant, technical_expert, creative_designer, security_focused, efficiency_optimizer, learning_tutor]
 *           default: technical_expert
 *           description: Persona type
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata
 *     SegmentationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Segmentation process ID
 *         status:
 *           type: string
 *           enum: [success, error, pending, completed] # Added completed
 *           description: Process status
 *         altFile:
 *           type: string
 *           description: Name of the generated .alt file
 *         metadata:
 *           type: object
 *           properties:
 *             timestamp:
 *               type: string
 *               format: date-time
 *               description: Process timestamp
 *             mode:
 *               type: string
 *               description: Operating mode used
 *             persona:
 *               type: string
 *               description: Persona type used
 */

const router = Router();

// Apply JWT authentication to all segmentation routes
router.use(authenticateJWT);

/**
 * @swagger
 * /api/v1/segmentation:
 *   post:
 *     summary: Command segmentation
 *     description: Divides a command into subtasks and creates an *.alt file (User role required)
 *     tags: [Segmentation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SegmentationRequest'
 *     responses:
 *       202:
 *         description: Successful segmentation (Process started)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SegmentationResponse'
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role)
 *       500:
 *         description: Server error
 */
router.post(
    '/', 
    authorizeRoles('user', 'admin'), // Requires user or admin role
    asyncHandler(async (req, res) => {
      try {
        const { command, mode = 'Normal', persona = 'technical_expert', metadata = {} } = req.body;
        
        logger.info(`Segmentation request by user ${req.user?.id}: "${command.substring(0, 50)}${command.length > 50 ? '...' : ''}" (${mode}, ${persona})`);
        
        // Use the segmentation service to process the command
        const segmentationId = `seg_${Math.random().toString(36).substring(2, 9)}`;
        const timestamp = new Date().toISOString();
        
        // Create request payload
        const segmentationRequest = {
          command,
          options: {
            mode,
            persona,
            metadata: {
              userId: req.user?.id,
              timestamp,
              ...metadata
            }
          }
        };
        
        // Call the segmentation service asynchronously
        // In a real implementation, this would be a non-blocking call
        segmentationService.segmentCommand(command, segmentationRequest.options)
          .then(result => {
            logger.info(`Segmentation completed for ${segmentationId}: ${result.status}`);
          })
          .catch(error => {
            logger.error(`Segmentation failed for ${segmentationId}: ${error.message}`);
          });
        
        // Return immediate response with process ID
        const response = {
          id: segmentationId,
          status: 'pending', // Indicate the process has started
          altFile: `task_${segmentationId}.alt`, // Placeholder name
          metadata: {
            timestamp,
            mode,
            persona,
            userId: req.user?.id,
            ...metadata
          }
        };
        
        res.status(202).json(response); // 202 Accepted for async start
      } catch (error) {
        logger.error('Error in Segmentation service:', error);
        // Let the global error handler manage the response
        throw error; 
      }
}));

/**
 * @swagger
 * /api/v1/segmentation/{id}:
 *   get:
 *     summary: Get segmentation status
 *     description: Queries the status of a segmentation process (User role required)
 *     tags: [Segmentation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Segmentation process ID
 *     responses:
 *       200:
 *         description: Segmentation status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SegmentationResponse'
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

      logger.info(`Segmentation status query: ${id} by user ${userId}`);

      // TODO: Fetch status from the actual segmentation service
      // const statusResult = await segmentationService.getSegmentationStatus(id);

      // TODO: Implement proper authorization check based on fetched data
      // if (!isAdmin && statusResult.metadata.userId !== userId) {
      //   throw new ForbiddenError('You are not authorized to view this segmentation process');
      // }

      // Mock response - replace with actual service call result
      let status = 'pending';
      if (id.endsWith('c')) status = 'completed';
      if (id.endsWith('e')) status = 'error';

      res.json({
        id,
        status: status, // Use statusResult.status
        altFile: `task_${id}.alt`, // Use statusResult.altFile
        metadata: {
          timestamp: new Date(Date.now() - 60000).toISOString(), // Use statusResult.metadata.timestamp
          mode: 'Normal', // Use statusResult.metadata.mode
          persona: 'technical_expert', // Use statusResult.metadata.persona
          userId: userId // Use statusResult.metadata.userId
        }
      });
    })
);

export default router;

