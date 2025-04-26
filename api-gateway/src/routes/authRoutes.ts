import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import logger from '../utils/logger';

// Swagger JSDoc için route tanımlamaları
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kimlik doğrulama ve yetkilendirme işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Kullanıcı adı
 *         password:
 *           type: string
 *           format: password
 *           description: Kullanıcı şifresi
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT token
 *         refreshToken:
 *           type: string
 *           description: Yenileme token'ı
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             username:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Kullanıcı adı
 *         password:
 *           type: string
 *           format: password
 *           description: Kullanıcı şifresi
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: Kullanıcı rolleri
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Yenileme token'ı
 */

const router = Router();

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
  
  // Gerçek uygulamada veritabanından kullanıcı doğrulaması yapılır
  // Şimdilik mock yanıt döndürüyoruz
  if (username === 'admin' && password === 'password') {
    logger.info(`Kullanıcı girişi başarılı: ${username}`);
    res.json({
      token: 'mock_jwt_token',
      refreshToken: 'mock_refresh_token',
      user: {
        id: '1',
        username: 'admin',
        roles: ['admin']
      }
    });
  } else {
    logger.warn(`Geçersiz giriş denemesi: ${username}`);
    res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
  }
}));

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
  const { username, password, roles = ['user'] } = req.body;
  
  // Gerçek uygulamada veritabanına kullanıcı kaydı yapılır
  // Şimdilik mock yanıt döndürüyoruz
  logger.info(`Yeni kullanıcı kaydı: ${username}`);
  res.status(201).json({
    token: 'mock_jwt_token',
    refreshToken: 'mock_refresh_token',
    user: {
      id: Math.random().toString(36).substring(7),
      username,
      roles
    }
  });
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
  
  // Gerçek uygulamada refresh token doğrulaması yapılır
  // Şimdilik mock yanıt döndürüyoruz
  if (refreshToken) {
    logger.info('Token yenileme başarılı');
    res.json({
      token: 'new_mock_jwt_token',
      refreshToken: 'new_mock_refresh_token',
      user: {
        id: '1',
        username: 'admin',
        roles: ['admin']
      }
    });
  } else {
    logger.warn('Geçersiz refresh token');
    res.status(401).json({ message: 'Geçersiz refresh token' });
  }
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
  // Gerçek uygulamada token blacklist'e eklenir
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
  // Kullanıcı bilgilerini döndür
  logger.info(`Kullanıcı bilgileri istendi: ${req.user?.username}`);
  res.json(req.user);
}));

export default router;
