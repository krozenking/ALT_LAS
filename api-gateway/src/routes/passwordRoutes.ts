import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';
import authService from '../services/authService';
import { routeAuthManager } from '../middleware/routeAuthMiddleware';
import emailService from '../services/emailService';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Password
 *   description: Şifre yönetimi işlemleri
 */

/**
 * @swagger
 * /api/password/forgot:
 *   post:
 *     summary: Şifre sıfırlama isteği gönderir
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Şifre sıfırlama talimatları email adresine gönderildi
 *       400:
 *         description: Geçersiz istek
 *       500:
 *         description: Sunucu hatası
 */
router.post('/forgot', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Email adresi gereklidir');
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Geçerli bir email adresi giriniz');
    }

    // Kullanıcıyı kontrol et
    const users = await authService.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      // Güvenlik için kullanıcı bulunamasa bile başarılı yanıt dön
      res.status(200).json({
        success: true,
        message: 'Şifre sıfırlama talimatları email adresinize gönderildi (eğer hesap mevcutsa)'
      });
      return;
    }

    // Şifre sıfırlama token'ı oluştur
    await authService.requestPasswordReset(email);

    // Email gönderme işlemi (gerçek uygulamada)
    try {
      // Bu fonksiyon gerçek bir email servisi ile entegre edilmelidir
      // await sendPasswordResetEmail(email, resetToken);
      logger.info(`Şifre sıfırlama email'i gönderildi: ${email}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Email gönderme hatası: ${error.message}`);
      } else {
        logger.error("Bilinmeyen bir email gönderme hatası oluştu");
      }
      // Email gönderme hatası kullanıcıya bildirilmemeli
    }

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama talimatları email adresinize gönderildi'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/password/reset:
 *   post:
 *     summary: Şifre sıfırlama işlemini gerçekleştirir
 *     tags: [Password]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Şifre başarıyla sıfırlandı
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Geçersiz veya süresi dolmuş token
 *       500:
 *         description: Sunucu hatası
 */
router.post('/reset', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      throw new BadRequestError('Token, yeni şifre ve şifre onayı gereklidir');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Şifreler eşleşmiyor');
    }

    // Şifre karmaşıklığını kontrol et
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestError('Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir');
    }

    // Şifreyi sıfırla
    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/password/change:
 *   post:
 *     summary: Kullanıcı şifresini değiştirir
 *     tags: [Password]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Şifre başarıyla değiştirildi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/change', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new BadRequestError('Mevcut şifre, yeni şifre ve şifre onayı gereklidir');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Şifreler eşleşmiyor');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('Yeni şifre mevcut şifre ile aynı olamaz');
    }

    // Şifre karmaşıklığını kontrol et
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      throw new BadRequestError('Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir');
    }

    // Şifreyi değiştir
    await authService.changePassword(String(userId), currentPassword, newPassword);

    // Tüm oturumları sonlandır (isteğe bağlı)
    // await sessionService.terminateAllSessions(userId);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    next(error);
  }
});

// Route izinlerini ekle
routeAuthManager.addRoutePermission({
  path: '/password/change',
  method: 'post',
  roles: ['user', 'admin', 'service']
});

export default router;

