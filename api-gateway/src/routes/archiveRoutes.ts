import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware'; // Import authorization
import logger from '../utils/logger';

// Swagger JSDoc for route definitions
/**
 * @swagger
 * tags:
 *   name: Archive
 *   description: Archiving operations (*.last -> *.atlas)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArchiveRequest:
 *       type: object
 *       required:
 *         - lastFile
 *       properties:
 *         lastFile:
 *           type: string
 *           description: Name of the .last file to archive (usually related to runner ID)
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Archive metadata (e.g., success status, parameters used)
 *     ArchiveResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Archive process ID (or Atlas record ID)
 *         status:
 *           type: string
 *           enum: [success, error, pending]
 *           description: Process status
 *         atlasId:
 *           type: string
 *           description: ID of the created .atlas record
 *         successRate:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Estimated success rate (if available)
 *         archivedAt:
 *           type: string
 *           format: date-time
 *           description: Archiving timestamp
 */

const router = Router();

// Apply JWT authentication to all archive routes
router.use(authenticateJWT);

/**
 * @swagger
 * /api/v1/archive:
 *   post:
 *     summary: Archive result (Service/Admin only)
 *     description: Archives a *.last file and saves it to the *.atlas database
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArchiveRequest'
 *     responses:
 *       201:
 *         description: Successfully archived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArchiveResponse'
 *       400:
 *         description: Invalid request (e.g., missing lastFile)
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role - Service or Admin required)
 *       500:
 *         description: Server error (Archive service unreachable, etc.)
 */
router.post(
    '/', 
    authorizeRoles('service', 'admin'), // Only service or admin can trigger archiving
    asyncHandler(async (req, res) => {
      try {
        const { lastFile, metadata = {} } = req.body;
        if (!lastFile) {
            return res.status(400).json({ message: 'lastFile is required' });
        }
        
        logger.info(`Archive request by ${req.user?.roles?.includes('service') ? 'service' : 'admin'} ${req.user?.id}: ${lastFile}`);
        
        // In a real application, make a request to the Archive Service
        // TODO: Validate lastFile format/existence
        // TODO: Call the actual Archive Service asynchronously or synchronously

        // Mock response
        const archiveId = `arc_${Math.random().toString(36).substring(2, 9)}`;
        const atlasId = `atlas_${Date.now()}`;
        const successRate = metadata.successRate || Math.floor(Math.random() * 101); // Use metadata if provided
        const archivedAt = new Date().toISOString();
        
        const response = {
          id: archiveId,
          status: 'success', // Assuming sync success for mock
          atlasId,
          successRate,
          archivedAt,
          metadata: {
              userId: metadata.userId || req.user?.id, // Preserve original user if available
              runnerId: metadata.runnerId, // Preserve runner ID if available
              // ... other relevant metadata
          }
        };
        
        res.status(201).json(response);
      } catch (error) {
        logger.error('Error in Archive service:', error);
        throw error;
      }
}));

/**
 * @swagger
 * /api/v1/archive/{id}:
 *   get:
 *     summary: Query archive record (User/Admin only)
 *     description: Queries an archive record (Atlas)
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Archive (Atlas) record ID
 *     responses:
 *       200:
 *         description: Archive record
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArchiveResponse' # Might need a more detailed Atlas schema
 *       404:
 *         description: Not found
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role or record does not belong to user)
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
      
      logger.info(`Archive record query: ${id} by user ${userId}`);
      
      // In a real application, query record from the Archive Service
      // TODO: Implement logic to fetch record from the actual service
      // TODO: Check if the requesting user owns the record (based on userId in metadata) or is an admin

      // Mock response - assuming the record exists and belongs to the user or user is admin
      // Basic authorization check (example - needs proper implementation)
      // if (!isAdmin && fetchedRecord.metadata.userId !== userId) { 
      //   throw new ForbiddenError('You are not authorized to view this archive record');
      // }

      res.json({
        id,
        status: 'success', // Assuming it's an archived record
        atlasId: id, // Assuming id is the atlasId
        successRate: Math.floor(Math.random() * 101),
        archivedAt: new Date(Date.now() - 3600000).toISOString(), // Simulate past time
        metadata: {
            userId: userId, // Placeholder
            // ... other metadata from Atlas record
        }
      });
}));

/**
 * @swagger
 * /api/v1/archive/search:
 *   get:
 *     summary: Search archive records (User/Admin only)
 *     description: Searches archive (Atlas) records based on specified criteria
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *         description: Search query (e.g., command text, filename)
 *       - name: userId
 *         in: query
 *         schema:
 *           type: string
 *         description: Search records belonging to a specific user (Admin only)
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time # Use date-time for more precision
 *         description: Start time (ISO 8601)
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date-time # Use date-time for more precision
 *         description: End time (ISO 8601)
 *       - name: minSuccessRate
 *         in: query
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum success rate
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Result limit
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Result starting index
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of matching results
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArchiveResponse' # Might need a more detailed Atlas schema
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Authorization error (Token missing/invalid)
 *       403:
 *         description: Permission error (Insufficient role or querying another user's data)
 *       500:
 *         description: Server error
 */
router.get(
    '/search', 
    authorizeRoles('user', 'admin'), // Requires user or admin role
    asyncHandler(async (req, res) => {
      const { query, userId: queryUserId, startDate, endDate, minSuccessRate, limit = 10, offset = 0 } = req.query;
      const requestorUserId = req.user?.id;
      const isAdmin = req.user?.roles?.includes('admin');

      // Authorization: Non-admins can only search their own records
      let effectiveUserId = requestorUserId;
      if (isAdmin && queryUserId) {
          effectiveUserId = queryUserId as string;
      } else if (!isAdmin && queryUserId && queryUserId !== requestorUserId) {
          return res.status(403).json({ message: 'You are not authorized to search records for another user' });
      }
      
      logger.info(`Archive search by user ${requestorUserId}: ${JSON.stringify(req.query)}, effectiveUserId: ${effectiveUserId}`);
      
      // In a real application, search in the Archive Service
      // TODO: Pass validated and processed query parameters to the service
      // TODO: The service should handle filtering by effectiveUserId

      // Mock response
      const numLimit = parseInt(limit as string, 10);
      const numOffset = parseInt(offset as string, 10);
      const results = Array.from({ length: Math.min(numLimit, 20) }, (_, i) => ({
        id: `atlas-${numOffset + i}-${effectiveUserId}`,
        status: 'success',
        atlasId: `atlas-${numOffset + i}-${effectiveUserId}`,
        successRate: Math.floor(Math.random() * 101),
        archivedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
        metadata: {
            userId: effectiveUserId,
            // ... other metadata
        }
      }));
      
      res.json({
        total: 50, // Mock total for this user
        results
      });
}));

export default router;

