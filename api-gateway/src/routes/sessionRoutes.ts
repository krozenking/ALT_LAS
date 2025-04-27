import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles, authorizePermissions } from '../middleware/authMiddleware';
import { 
  createUserSession, 
  terminateSession, 
  terminateAllSessions, 
  refreshSession,
  listUserSessions
} from '../services/sessionService';
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
router.get('/', asyncHandler(async (req, res) => {
  await listUserSessions(req, res, () => {});
  logger.info(`Kullanıcı ${req.user?.id} oturumları listelendi`);
  res.json(res.locals.userSessions);
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
router.delete('/:deviceId', asyncHandler(async (req, res) => {
  req.body.deviceId = req.params.deviceId;
  await terminateSession(req, res, () => {});
  logger.info(`Kullanıcı ${req.user?.id} cihaz ${req.params.deviceId} oturumu sonlandırıldı`);
  res.json({ 
    message: 'Oturum başarıyla sonlandırıldı',
    success: res.locals.sessionTerminated
  });
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
router.delete('/', asyncHandler(async (req, res) => {
  await terminateAllSessions(req, res, () => {});
  logger.info(`Kullanıcı ${req.user?.id} tüm oturumları sonlandırıldı`);
  res.json({ 
    message: 'Tüm oturumlar başarıyla sonlandırıldı',
    count: res.locals.terminatedSessionCount
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
  asyncHandler(async (req, res) => {
    await listUserSessions(req, res, () => {});
    logger.info(`Admin ${req.user?.id} tarafından kullanıcı ${req.params.userId} oturumları listelendi`);
    res.json(res.locals.userSessions);
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
  asyncHandler(async (req, res) => {
    // Kullanıcı ID'sini req.user'a geçici olarak ata
    const originalUser = req.user;
    req.user = { ...req.user, id: req.params.userId };
    
    await terminateAllSessions(req, res, () => {});
    
    // Orijinal kullanıcıyı geri yükle
    req.user = originalUser;
    
    logger.info(`Admin ${req.user?.id} tarafından kullanıcı ${req.params.userId} tüm oturumları sonlandırıldı`);
    res.json({ 
      message: 'Kullanıcı oturumları başarıyla sonlandırıldı',
      count: res.locals.terminatedSessionCount
    });
  })
);

export default router;
