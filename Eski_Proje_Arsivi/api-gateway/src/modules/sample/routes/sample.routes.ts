import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sample Dynamic Route
 *   description: Example of a dynamically loaded route
 */

/**
 * @swagger
 * /api/v1/sample/ping:
 *   get:
 *     summary: Returns a pong message from the sample dynamic route (public)
 *     tags: [Sample Dynamic Route]
 *     responses:
 *       200:
 *         description: Successful pong response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong from sample dynamic route
 */
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'pong from sample dynamic route' });
});

/**
 * @swagger
 * /api/v1/sample/protected-ping:
 *   get:
 *     summary: Returns a protected pong message, requires 'user' role
 *     tags: [Sample Dynamic Route]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful protected pong response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: protected pong from sample dynamic route for users!
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/protected-ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'protected pong from sample dynamic route for users!' });
});

// Export the router and any associated metadata for route loader
export const routes = [
  {
    path: '/', // Base path for this router, will be prefixed by module name
    router: router,
    permissions: [
      {
        path: '/ping',
        method: 'get', // HTTP method
        // No roles/permissions needed for public ping
      },
      {
        path: '/protected-ping',
        method: 'get',
        roles: ['user'], // Requires 'user' role
      }
    ]
  }
];

export default router; // Keep default export for simpler cases if preferred by routeLoader logic

