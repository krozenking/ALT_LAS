import { Router, Request, Response, NextFunction } from 'express'; // Added Request, Response, NextFunction
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles, authorizePermissions } from '../middleware/authMiddleware';
import {
  createSession, // Renamed from createUserSession
  invalidateSession, // Renamed from terminateSession
  invalidateAllUserSessions, // Renamed from terminateAllSessions
  getSessionByRefreshToken, // Needed for refresh
  updateSession, // Needed for refresh
  getUserActiveSessions, // Renamed from listUserSessions
  getUserSessionByDevice // Added for device-specific termination
} from "../services/sessionService";
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Oturum yönetimi işlemleri
 */

// Kimlik doğrulama gerekli
router.use(authenticateJWT);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Kullanıcının aktif oturumlarını listeler
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aktif oturumlar başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => { // Added types
  // Directly call the service function. Assuming it handles response or returns data.
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User ID not found in token' });
  }
  const userIdString = String(userId); // Convert to string
  const sessions = await getUserActiveSessions(userIdString);
  logger.info(`Kullanıcı ${userIdString} oturumları listelendi`);
  res.json(sessions);
}));

/**
 * @swagger
 * /api/sessions/{deviceId}:
 *   delete:
 *     summary: Belirli bir cihaz için oturumu sonlandırır
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: deviceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Oturum başarıyla sonlandırıldı
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:deviceId', asyncHandler(async (req: Request, res: Response) => { // Added types
  const userId = req.user?.id;
  const deviceId = req.params.deviceId;
  if (!userId) {
    return res.status(401).json({ message: 'User ID not found in token' });
  }
  const userIdString = String(userId); // Convert to string
  const session = await getUserSessionByDevice(userIdString, deviceId);
  if (session) {
    await invalidateSession(session.id);
    logger.info(`Kullanıcı ${userIdString} cihaz ${deviceId} oturumu sonlandırıldı`);
    res.json({ 
      message: 'Oturum başarıyla sonlandırıldı',
      success: true
    });
  } else {
    logger.warn(`Kullanıcı ${userIdString} için cihaz ${deviceId} ile ilişkili aktif oturum bulunamadı`);
    res.status(404).json({ 
      message: 'Belirtilen cihaz için aktif oturum bulunamadı',
      success: false
    });
  }
}));

/**
 * @swagger
 * /api/sessions:
 *   delete:
 *     summary: Kullanıcının tüm oturumlarını sonlandırır
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm oturumlar başarıyla sonlandırıldı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/', asyncHandler(async (req: Request, res: Response) => { // Added types
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: 'User ID not found in token' });
  }
  const userIdString = String(userId); // Convert to string
  await invalidateAllUserSessions(userIdString);
  logger.info(`Kullanıcı ${userIdString} tüm oturumları sonlandırıldı`);
  res.json({ 
    message: 'Tüm oturumlar başarıyla sonlandırıldı'
    // count information might need adjustment based on service return
  });
}));

/**
 * @swagger
 * /api/sessions/users/{userId}:
 *   get:
 *     summary: Belirli bir kullanıcının oturumlarını listeler (Admin)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı oturumları başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/users/:userId',
  authorizeRoles('admin'),
  authorizePermissions('read:users'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const targetUserId = req.params.userId;
    const sessions = await getUserActiveSessions(targetUserId); // Already string from params
    logger.info(`Admin ${req.user?.id} tarafından kullanıcı ${targetUserId} oturumları listelendi`);
    res.json(sessions);
  })
);

/**
 * @swagger
 * /api/sessions/users/{userId}:
 *   delete:
 *     summary: Belirli bir kullanıcının tüm oturumlarını sonlandırır (Admin)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Kullanıcı oturumları başarıyla sonlandırıldı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/users/:userId',
  authorizeRoles('admin'),
  authorizePermissions('manage:users'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const targetUserId = req.params.userId;
    await invalidateAllUserSessions(targetUserId); // Already string from params
    logger.info(`Admin ${req.user?.id} tarafından kullanıcı ${targetUserId} tüm oturumları sonlandırıldı`);
    res.json({ 
      message: 'Kullanıcı oturumları başarıyla sonlandırıldı'
      // count information might need adjustment based on service return
    });
  })
);

export default router;

