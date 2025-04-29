import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT } from '../middleware/authMiddleware'; // Removed authorizeRoles, authorizePermissions
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
import authService from '../services/authService';
import jwtService from '../services/jwtService'; // Import jwtService
import sessionService from '../services/sessionService'; // Import sessionService
import authorizationService from '../services/authorizationService';
import { routeAuthManager, authorizeRoute } from '../middleware/routeAuthMiddleware'; // Import authorizeRoute

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Kullanıcı kimlik doğrulama ve profil işlemleri
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
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
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek veya kullanıcı zaten mevcut
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      throw new BadRequestError('Kullanıcı adı, email ve şifre gereklidir');
    }
    // Add password complexity check here if needed

    // Create user (authService should handle hashing)
    const user = await authService.createUser({
      username,
      email,
      passwordHash: password, // Pass plain password, service should hash
      firstName,
      lastName,
      roles: ['user'] // Default role
    });

    // Exclude sensitive data from response
    const { passwordHash: _, ...userData } = user;

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: userData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
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
 *         description: Geçersiz kullanıcı adı veya şifre
 *       500:
 *         description: Sunucu hatası
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new BadRequestError('Kullanıcı adı ve şifre gereklidir');
    }

    // Validate user
    const user = await authService.validateUser(username, password);

    // Generate tokens (using jwtService)
    const tokenPayload = { userId: user.id, username: user.username, roles: user.roles, permissions: user.permissions };
    const token = jwtService.generateToken(tokenPayload);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Create session (using sessionService)
    const deviceInfo = { ip: req.ip, userAgent: req.headers['user-agent'] || 'unknown' };
    const session = sessionService.createSession(user.id, refreshToken, deviceInfo);

    // Exclude sensitive data
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
 * /api/auth/refresh-token:
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

    // Refresh token using authService (which uses sessionService and jwtService)
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
 * /api/auth/logout:
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
    const token = req.headers.authorization?.split(' ')[1]; // Get access token from header

    if (!refreshToken) {
      throw new BadRequestError('Refresh token gereklidir');
    }
    if (!token) {
        throw new UnauthorizedError('Access token bulunamadı');
    }

    // Logout using authService (invalidates session and blacklists token)
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
 * /api/auth/profile:
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

    // Ensure userId is a string before passing to service
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
 * /api/auth/profile:
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
 *         description: Geçersiz istek
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
    // Ensure userId is a string before passing to service
    const updatedUser = await authService.updateUser(String(userId), { firstName, lastName, email });

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// ---- YÖNETİCİ ROTALARI ----

/**
 * @swagger
 * /api/auth/users:
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
 * /api/auth/users/{userId}:
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
 * /api/auth/users/{userId}:
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
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kullanıcı başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'write:users' izni gerekli)
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/users/:userId',
  authenticateJWT,
  authorizeRoute({ path: '/users/:userId', method: 'put', permissions: ['write:users'] }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { firstName, lastName, email, isActive } = req.body;

      // Prevent admin from deactivating themselves
      const currentUser = await authService.getUserById(userId);
      if (currentUser?.username === 'admin' && isActive === false) {
          throw new ForbiddenError('Admin kullanıcısı devre dışı bırakılamaz.');
      }

      const updatedUser = await authService.updateUser(userId, { firstName, lastName, email, isActive });

      res.status(200).json({
        success: true,
        message: 'Kullanıcı başarıyla güncellendi',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/users/{userId}:
 *   delete:
 *     summary: Belirli bir kullanıcıyı siler (Admin)
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
 *         description: Kullanıcı başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'delete:users' izni gerekli)
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/users/:userId',
  authenticateJWT,
  authorizeRoute({ path: '/users/:userId', method: 'delete', permissions: ['delete:users'] }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

      // Prevent admin deletion
      const userToDelete = await authService.getUserById(userId);
      if (userToDelete?.username === 'admin') {
          throw new ForbiddenError('Admin kullanıcısı silinemez.');
      }

      await authService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: 'Kullanıcı başarıyla silindi'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ---- ROL VE İZİN YÖNETİMİ (Admin) ----

/**
 * @swagger
 * tags:
 *   name: Admin - Roles & Permissions
 *   description: Rol ve izin yönetimi işlemleri (Admin)
 */

/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     summary: Tüm rolleri listeler (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rol listesi başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'read:roles' izni gerekli)
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/roles',
  authenticateJWT,
  authorizeRoute({ path: '/roles', method: 'get', permissions: ['read:roles'] }),
  (req: Request, res: Response) => {
    const roles = authorizationService.getRoles();
    res.status(200).json({
      success: true,
      data: roles
    });
  }
);

/**
 * @swagger
 * /api/auth/roles/{roleName}:
 *   get:
 *     summary: Belirli bir rol detayını getirir (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rol detayları başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'read:roles' izni gerekli)
 *       404:
 *         description: Rol bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/roles/:roleName',
  authenticateJWT,
  authorizeRoute({ path: '/roles/:roleName', method: 'get', permissions: ['read:roles'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleName } = req.params;
      const role = authorizationService.getRole(roleName);

      if (!role) {
        throw new NotFoundError('Rol bulunamadı');
      }

      res.status(200).json({
        success: true,
        data: role
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/roles:
 *   post:
 *     summary: Yeni bir rol oluşturur (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Rol başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek veya rol zaten mevcut
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'write:roles' izni gerekli)
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/roles',
  authenticateJWT,
  authorizeRoute({ path: '/roles', method: 'post', permissions: ['write:roles'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, permissions } = req.body;

      if (!name || !Array.isArray(permissions)) {
        throw new BadRequestError('Rol adı ve izinler (dizi olarak) gereklidir');
      }

      // Rol zaten var mı kontrol et
      if (authorizationService.getRole(name)) {
        throw new BadRequestError(`'${name}' rolü zaten mevcut`);
      }

      // İzinlerin geçerliliğini kontrol et
      const availablePermissions = Object.keys(authorizationService.getPermissions());
      const invalidPermissions = permissions.filter(permission => !availablePermissions.includes(permission));

      if (invalidPermissions.length > 0) {
        throw new BadRequestError(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
      }

      authorizationService.addRole({
        name,
        description,
        permissions
      });

      res.status(201).json({
        success: true,
        message: 'Rol başarıyla oluşturuldu',
        data: authorizationService.getRole(name)
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/roles/{roleName}:
 *   put:
 *     summary: Belirli bir rolü günceller (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleName
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
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Rol başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek veya admin rolü güncellenemez
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'write:roles' izni gerekli)
 *       404:
 *         description: Rol bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/roles/:roleName',
  authenticateJWT,
  authorizeRoute({ path: '/roles/:roleName', method: 'put', permissions: ['write:roles'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleName } = req.params;
      const { description, permissions } = req.body;

      // Rol var mı kontrol et
      const role = authorizationService.getRole(roleName);
      if (!role) {
        throw new NotFoundError('Rol bulunamadı');
      }

      // Admin rolünü güncellemeye izin verme
      if (roleName === 'admin') {
        throw new ForbiddenError('Admin rolü güncellenemez');
      }

      // İzinlerin geçerliliğini kontrol et
      if (permissions !== undefined) {
        if (!Array.isArray(permissions)) {
          throw new BadRequestError('İzinler bir dizi olmalıdır');
        }

        const availablePermissions = Object.keys(authorizationService.getPermissions());
        const invalidPermissions = permissions.filter(permission => !availablePermissions.includes(permission));

        if (invalidPermissions.length > 0) {
          throw new BadRequestError(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
        }

        // Rol izinlerini güncelle (authorizationService'de bu işlev olmalı)
        authorizationService.updateRolePermissions(roleName, permissions);
      }

      // Açıklamayı güncelle
      if (description !== undefined) {
        authorizationService.updateRoleDescription(roleName, description);
      }

      res.status(200).json({
        success: true,
        message: 'Rol başarıyla güncellendi',
        data: authorizationService.getRole(roleName)
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/roles/{roleName}:
 *   delete:
 *     summary: Belirli bir rolü siler (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: roleName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rol başarıyla silindi
 *       400:
 *         description: Temel roller silinemez
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'delete:roles' izni gerekli)
 *       404:
 *         description: Rol bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/roles/:roleName',
  authenticateJWT,
  authorizeRoute({ path: '/roles/:roleName', method: 'delete', permissions: ['delete:roles'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleName } = req.params;

      // Rol var mı kontrol et
      if (!authorizationService.getRole(roleName)) {
        throw new NotFoundError('Rol bulunamadı');
      }

      // Temel rolleri silmeye izin verme
      if (['admin', 'user', 'service', 'guest'].includes(roleName)) {
        throw new ForbiddenError('Temel roller silinemez');
      }

      // TODO: Rolü kullanan kullanıcıları kontrol et ve gerekirse uyar/engelle

      authorizationService.removeRole(roleName);

      res.status(200).json({
        success: true,
        message: 'Rol başarıyla silindi'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/permissions:
 *   get:
 *     summary: Tüm izinleri listeler (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: İzin listesi başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'read:permissions' izni gerekli)
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/permissions',
  authenticateJWT,
  authorizeRoute({ path: '/permissions', method: 'get', permissions: ['read:permissions'] }),
  (req: Request, res: Response) => {
    const permissions = authorizationService.getPermissions();
    res.status(200).json({
      success: true,
      data: permissions
    });
  }
);

/**
 * @swagger
 * /api/auth/permissions/{permissionName}:
 *   get:
 *     summary: Belirli bir izin detayını getirir (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: permissionName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: İzin detayları başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'read:permissions' izni gerekli)
 *       404:
 *         description: İzin bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/permissions/:permissionName',
  authenticateJWT,
  authorizeRoute({ path: '/permissions/:permissionName', method: 'get', permissions: ['read:permissions'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { permissionName } = req.params;
      // Decode permission name if needed (e.g., if it contains special chars like :)
      const decodedPermissionName = decodeURIComponent(permissionName);
      const permission = authorizationService.getPermission(decodedPermissionName);

      if (!permission) {
        throw new NotFoundError('İzin bulunamadı');
      }

      res.status(200).json({
        success: true,
        data: permission
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/permissions:
 *   post:
 *     summary: Yeni bir izin oluşturur (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       201:
 *         description: İzin başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek veya izin zaten mevcut
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'write:permissions' izni gerekli)
 *       500:
 *         description: Sunucu hatası
 */
router.post(
  '/permissions',
  authenticateJWT,
  authorizeRoute({ path: '/permissions', method: 'post', permissions: ['write:permissions'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, resource, action } = req.body;

      if (!name) {
        throw new BadRequestError('İzin adı gereklidir');
      }

      // İzin zaten var mı kontrol et
      if (authorizationService.getPermission(name)) {
        throw new BadRequestError(`'${name}' izni zaten mevcut`);
      }

      authorizationService.addPermission({
        name,
        description,
        resource,
        action
      });

      res.status(201).json({
        success: true,
        message: 'İzin başarıyla oluşturuldu',
        data: authorizationService.getPermission(name)
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/auth/permissions/{permissionName}:
 *   delete:
 *     summary: Belirli bir izni siler (Admin)
 *     tags: [Admin - Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: permissionName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: İzin başarıyla silindi
 *       400:
 *         description: Temel izinler silinemez
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin rolü veya 'delete:permissions' izni gerekli)
 *       404:
 *         description: İzin bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete(
  '/permissions/:permissionName',
  authenticateJWT,
  authorizeRoute({ path: '/permissions/:permissionName', method: 'delete', permissions: ['delete:permissions'] }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { permissionName } = req.params;
      const decodedPermissionName = decodeURIComponent(permissionName);

      // İzin var mı kontrol et
      if (!authorizationService.getPermission(decodedPermissionName)) {
        throw new NotFoundError('İzin bulunamadı');
      }

      // TODO: Temel izinleri silmeye izin verme (opsiyonel)
      // if (['read:users', 'write:users', ...].includes(decodedPermissionName)) {
      //   throw new ForbiddenError('Temel izinler silinemez');
      // }

      authorizationService.removePermission(decodedPermissionName);

      res.status(200).json({
        success: true,
        message: 'İzin başarıyla silindi'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Add route permissions to the manager
routeAuthManager.addRoutePermission({ path: '/profile', method: 'get', roles: ['user', 'admin', 'service'] });
routeAuthManager.addRoutePermission({ path: '/profile', method: 'put', roles: ['user', 'admin', 'service'] });

export default router;

