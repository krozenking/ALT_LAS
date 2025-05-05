import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import sessionService from '../services/sessionService';
import logger from '../utils/logger';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { routeAuthManager } from '../middleware/routeAuthMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Kullanıcı oturum yönetimi
 */

/**
 * @swagger
 * /api/v1/sessions:
 *   get:
 *     summary: Aktif kullanıcı oturumlarını listeler
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aktif oturumların listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SessionInfo'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }
    const activeSessions = await sessionService.getUserActiveSessions(String(userId));
    res.status(200).json({ success: true, data: activeSessions });
  } catch (error) {
    next(error);
  }
});
router.delete(
  '/all',
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Kimlik doğrulaması gerekli');
      }
      await sessionService.invalidateAllUserSessions(String(userId));
      res
        .status(200)
        .json({ success: true, message: 'Tüm oturumlar başarıyla sonlandırıldı' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/sessions/{sessionId}:
 *   delete:
 *     summary: Belirli bir oturumu sonlandırır
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Oturum başarıyla sonlandırıldı
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Oturum bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/:sessionId',
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;
      if (!userId) {
        throw new UnauthorizedError('Kimlik doğrulaması gerekli');
      }

      // Oturumun kullanıcıya ait olup olmadığını kontrol et (opsiyonel ama önerilir)
      const session = sessionService
        .getUserActiveSessions(String(userId))
        .find((s) => s.id === sessionId);
      if (!session) {
        throw new NotFoundError('Oturum bulunamadı veya size ait değil');
      }

      await sessionService.invalidateSession(sessionId);
      res
        .status(200)
        .json({ success: true, message: 'Oturum başarıyla sonlandırıldı' });
    } catch (error) {
      next(error);
    }
  }
);

// Route izinlerini ekle (gerekirse)
routeAuthManager.addRoutePermission({ path: 
'/api/v1/sessions', method: 'get', roles: ['user', 'admin'] });
routeAuthManager.addRoutePermission({ path: 
'/api/v1/sessions/:sessionId', method: 'delete', roles: ['user', 'admin'] });
routeAuthManager.addRoutePermission({ path: 
'/api/v1/sessions/all', method: 'delete', roles: ['user', 'admin'] });

export default router;

