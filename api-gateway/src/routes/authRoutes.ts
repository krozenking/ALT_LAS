import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorize } from '../services/jwtService';
import authService from '../services/authService';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Geçersiz istek
 *       409:
 *         description: Kullanıcı adı zaten kullanımda
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  
  const result = await authService.register(username, password, roles);
  logger.info(`Yeni kullanıcı kaydedildi: ${username}`);
  
  res.status(201).json(result);
}));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Geçersiz kimlik bilgileri
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authService.login(username, password);
  logger.info(`Kullanıcı girişi başarılı: ${username}`);
  
  res.json(result);
}));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Token yenileme
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token başarıyla yenilendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Geçersiz yenileme token'ı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.refreshToken(refreshToken);
  logger.info('Token yenileme başarılı');
  
  res.json(result);
}));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Başarılı çıkış
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/logout', authenticateJWT, asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || '';
  
  await authService.logout(token);
  logger.info(`Kullanıcı çıkışı: ${req.user?.username}`);
  
  res.json({ message: 'Başarıyla çıkış yapıldı' });
}));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Mevcut kullanıcı bilgilerini getirir
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/me', authenticateJWT, asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: 'Yetkilendirme gerekli' });
  }
  
  const user = await authService.getUserById(userId);
  logger.info(`Kullanıcı bilgileri istendi: ${user.username}`);
  
  res.json(user);
}));

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Tüm kullanıcıları listeler (sadece admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   roles:
 *                     type: array
 *                     items:
 *                       type: string
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.get('/users', authenticateJWT, authorize(['admin']), asyncHandler(async (req, res) => {
  const users = await authService.getAllUsers();
  logger.info('Tüm kullanıcılar listelendi');
  
  res.json(users);
}));

export default router;
