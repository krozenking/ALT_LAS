import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT } from '../middleware/authMiddleware';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
import authService from '../services/authService';
import jwtService from '../services/jwtService';
import sessionService from '../services/sessionService';
import authorizationService from '../services/authorizationService';
import userService from '../services/userService'; // Import userService for email verification
import { routeAuthManager, authorizeRoute } from '../middleware/routeAuthMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Kullanıcı kimlik doğrulama, e-posta doğrulama ve profil işlemleri
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur ve doğrulama e-postası gönderir
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu, doğrulama e-postası gönderildi
 *       400:
 *         description: Geçersiz istek veya kullanıcı zaten mevcut
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      throw new BadRequestError('Kullanıcı adı, email ve şifre gereklidir');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Geçerli bir email adresi giriniz');
    }

    const user = await authService.createUser({
      username,
      email,
      passwordHash: password, 
      firstName,
      lastName,
      roles: ['user'] 
    });
    
    // userService.createUser now handles initial token generation and "sends" email
    // No need to call generateEmailVerificationToken here explicitly for new registration

    const { passwordHash: _, ...userData } = user;

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu. Lütfen e-postanızı kontrol ederek hesabınızı doğrulayın.',
      data: userData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Kullanıcı girişi yapar ve token döndürür
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Giriş başarılı, token ve kullanıcı bilgileri döndürülür
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Geçersiz kullanıcı adı, şifre veya e-posta doğrulanmamış
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError('Kullanıcı adı ve şifre gereklidir');
    }

    const user = await authService.validateUser(username, password);

    // Check if email is verified before allowing login
    const fullUser = await userService.getUserById(user.id);
    if (!fullUser || !fullUser.isEmailVerified) {
        throw new UnauthorizedError('E-posta adresiniz doğrulanmamış. Lütfen e-postanızı kontrol edin veya yeni bir doğrulama e-postası isteyin.');
    }

    const tokenPayload = { userId: user.id, username: user.username, roles: user.roles, permissions: user.permissions };
    const token = jwtService.generateToken(tokenPayload);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    const deviceInfo = { ip: req.ip, userAgent: req.headers['user-agent'] || 'unknown' };
    const session = sessionService.createSession(user.id, refreshToken, deviceInfo);

    const { passwordHash: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        refreshToken,
        sessionId: session.id,
        user: userData
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/verify-email/{token}:
 *   get:
 *     summary: E-posta doğrulama token'ını kullanarak e-postayı doğrular
 *     tags: [Authentication]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: E-postaya gönderilen doğrulama token'ı
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: E-posta başarıyla doğrulandı
 *       400:
 *         description: Geçersiz veya süresi dolmuş token
 *       500:
 *         description: Sunucu hatası
 */
router.get('/verify-email/:token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        if (!token) {
            throw new BadRequestError('Doğrulama tokenı gereklidir.');
        }
        await userService.verifyEmail(token);
        res.status(200).json({ 
            success: true, 
            message: 'E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.' 
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/v1/auth/resend-verification-email:
 *   post:
 *     summary: Giriş yapmış kullanıcı için yeni bir e-posta doğrulama token'ı gönderir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doğrulama e-postası başarıyla gönderildi
 *       400:
 *         description: E-posta zaten doğrulanmış veya kullanıcı bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/resend-verification-email', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new UnauthorizedError('Kimlik doğrulaması gerekli.');
        }

        const user = await userService.getUserById(String(userId));
        if (!user) {
            throw new NotFoundError('Kullanıcı bulunamadı.');
        }
        if (user.isEmailVerified) {
            throw new BadRequestError('E-posta adresiniz zaten doğrulanmış.');
        }

        await userService.generateEmailVerificationToken(String(userId));
        // userService.generateEmailVerificationToken now handles "sending" email

        res.status(200).json({ 
            success: true, 
            message: 'Yeni bir doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.' 
        });
    } catch (error) {
        next(error);
    }
});


/**
 * @swagger
 * /api/v1/auth/refresh-token:
 *   post:
 *     summary: Refresh token kullanarak yeni bir access token alır
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token başarıyla yenilendi
 *       400:
 *         description: Refresh token gerekli
 *       401:
 *         description: Geçersiz veya süresi dolmuş refresh token
 *       500:
 *         description: Sunucu hatası
 */
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token gereklidir');
    }

    const newTokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token başarıyla yenilendi',
      data: newTokens
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Kullanıcı çıkışı yapar (mevcut oturumu sonlandırır)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Çıkış başarılı
 *       400:
 *         description: Refresh token gerekli
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/logout', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new BadRequestError('Refresh token gereklidir');
    }
    if (!token) {
        throw new UnauthorizedError('Access token bulunamadı');
    }

    await authService.logout(token, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Giriş yapmış kullanıcının profil bilgilerini getirir
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil bilgileri başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/profile', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("Kimlik doğrulaması gerekli");
    }

    const user = await authService.getUserById(String(userId));
    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Giriş yapmış kullanıcının profil bilgilerini günceller
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profil başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek (örn: e-posta zaten kullanımda)
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/profile', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("Kimlik doğrulaması gerekli");
    }

    const { firstName, lastName, email } = req.body;
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestError('Geçerli bir email adresi giriniz');
        }
        updateData.email = email; 
        // userService.updateUser will handle re-verification logic if email changes
    }

    const updatedUser = await authService.updateUser(String(userId), updateData);

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi. E-posta adresinizi değiştirdiyseniz, lütfen yeni adresinizi doğrulayın.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// ---- YÖNETİCİ ROTALARI ----

/**
 * @swagger
 * /api/v1/auth/users:
 *   get:
 *     summary: Tüm kullanıcıları listeler (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı listesi başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'read:users' izni gerekli)
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/users',
  authenticateJWT,
  authorizeRoute({ path: '/users', method: 'get', permissions: ['read:users'] }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await authService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/auth/users/{userId}:
 *   get:
 *     summary: Belirli bir kullanıcı detayını getirir (Admin)
 *     tags: [Admin - Users]
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
 *         description: Kullanıcı detayları başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'read:users' izni gerekli)
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/users/:userId',
  authenticateJWT,
  authorizeRoute({ path: '/users/:userId', method: 'get', permissions: ['read:users'] }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await authService.getUserById(userId);

      if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/v1/auth/users/{userId}:
 *   put:
 *     summary: Belirli bir kullanıcıyı günceller (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               l
(Content truncated due to size limit. Use line ranges to read in chunks)