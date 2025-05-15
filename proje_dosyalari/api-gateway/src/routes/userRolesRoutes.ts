import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
import authService from '../services/authService';
import authorizationService from '../services/authorizationService';
import { routeAuthManager, authorizeRoute } from '../middleware/routeAuthMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: UserRoles
 *   description: Kullanıcı rolleri ve izinleri yönetimi
 */

// Kimlik doğrulama gerekli
router.use(authenticateJWT);

/**
 * @swagger
 * /api/user-roles/my-roles:
 *   get:
 *     summary: Kullanıcının kendi rollerini listeler
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı rolleri başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/my-roles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }
    const userIdString = String(userId); // Convert to string

    const user = await authService.getUserById(userIdString);
    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    // Rol detaylarını al
    const roles = user.roles || [];
    const roleDetails = roles.map(roleName => {
      const role = authorizationService.getRole(roleName);
      return role || { name: roleName, permissions: [], description: 'Bilinmeyen rol' };
    });

    res.status(200).json({
      success: true,
      data: {
        roles: roleDetails
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/my-permissions:
 *   get:
 *     summary: Kullanıcının kendi izinlerini listeler
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı izinleri başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/my-permissions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }
    const userIdString = String(userId); // Convert to string

    // Kullanıcının tüm izinlerini al (doğrudan ve rollerden gelen)
    const permissions = await authService.getUserPermissions(userIdString);
    
    // İzin detaylarını al
    const permissionDetails = permissions.map(permName => {
      const permission = authorizationService.getPermission(permName);
      return permission || { name: permName, description: 'Bilinmeyen izin' };
    });

    res.status(200).json({
      success: true,
      data: {
        permissions: permissionDetails
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/check-permission:
 *   post:
 *     summary: Belirli bir izne sahip olup olmadığını kontrol eder
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission
 *             properties:
 *               permission:
 *                 type: string
 *     responses:
 *       200:
 *         description: İzin kontrolü başarılı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/check-permission', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { permission } = req.body;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }
    const userIdString = String(userId); // Convert to string

    if (!permission) {
      throw new BadRequestError('İzin adı gereklidir');
    }

    // Kullanıcının tüm izinlerini al
    const permissions = await authService.getUserPermissions(userIdString);
    
    // İzin kontrolü
    const hasPermission = permissions.includes(permission);

    res.status(200).json({
      success: true,
      data: {
        hasPermission
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user-roles/check-resource-permission:
 *   post:
 *     summary: Belirli bir kaynak üzerinde izne sahip olup olmadığını kontrol eder
 *     tags: [UserRoles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resource
 *               - action
 *             properties:
 *               resource:
 *                 type: string
 *               action:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kaynak izni kontrolü başarılı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/check-resource-permission', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { resource, action } = req.body;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }
    const userIdString = String(userId); // Convert to string

    if (!resource || !action) {
      throw new BadRequestError('Kaynak ve işlem adı gereklidir');
    }

    // Kullanıcı rollerini al
    const user = await authService.getUserById(userIdString);
    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    const userRoles = user.roles || [];
    
    // Kaynak izni kontrolü
    const hasPermission = authorizationService.hasResourcePermission(userRoles, resource, action);

    res.status(200).json({
      success: true,
      data: {
        hasPermission
      }
    });
  } catch (error) {
    next(error);
  }
});

// --- YÖNETİCİ ROTALARI ---

/**
 * @swagger
 * /api/user-roles/users/{userId}/roles:
 *   get:
 *     summary: Belirli bir kullanıcının rollerini listeler (Admin)
 *     tags: [UserRoles]
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
 *         description: Kullanıcı rolleri başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/users/:userId/roles',
  authorizeRoute({
    path: '/users/:userId/roles',
    method: 'get',
    roles: ['admin'],
    permissions: ['read:users']
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params; // userId from params is already string

      const user = await authService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
      }

      // Rol detaylarını al
      const roles = user.roles || [];
      const roleDetails = roles.map(roleName => {
        const role = authorizationService.getRole(roleName);
        return role || { name: roleName, permissions: [], description: 'Bilinmeyen rol' };
      });

      res.status(200).json({
        success: true,
        data: {
          userId,
          username: user.username,
          roles: roleDetails
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/user-roles/users/{userId}/roles:
 *   put:
 *     summary: Belirli bir kullanıcının rollerini günceller (Admin)
 *     tags: [UserRoles]
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
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Kullanıcı rolleri başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/users/:userId/roles',
  authorizeRoute({
    path: '/users/:userId/roles',
    method: 'put',
    roles: ['admin'],
    permissions: ['write:users']
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params; // userId from params is already string
      const { roles } = req.body;

      if (!Array.isArray(roles)) {
        throw new BadRequestError('Roller bir dizi olmalıdır');
      }

      // Admin kullanıcısının rollerini değiştirmeye izin verme
      const user = await authService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
      }

      if (user.username === 'admin' && !roles.includes('admin')) {
        throw new ForbiddenError('Admin kullanıcısının admin rolü kaldırılamaz');
      }

      // Rollerin geçerliliğini kontrol et
      const availableRoles = Object.keys(authorizationService.getRoles());
      const invalidRoles = roles.filter(role => !availableRoles.includes(role));

      if (invalidRoles.length > 0) {
        throw new BadRequestError(`Geçersiz roller: ${invalidRoles.join(', ')}`);
      }

      // Kullanıcı rollerini güncelle
      const updatedUser = await authService.updateUserRoles(userId, roles);

      res.status(200).json({
        success: true,
        message: 'Kullanıcı rolleri başarıyla güncellendi',
        data: {
          userId,
          username: updatedUser.username,
          roles: updatedUser.roles
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/user-roles/users/{userId}/permissions:
 *   get:
 *     summary: Belirli bir kullanıcının izinlerini listeler (Admin)
 *     tags: [UserRoles]
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
 *         description: Kullanıcı izinleri başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/users/:userId/permissions',
  authorizeRoute({
    path: '/users/:userId/permissions',
    method: 'get',
    roles: ['admin'],
    permissions: ['read:users']
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params; // userId from params is already string

      // Kullanıcının tüm izinlerini al (doğrudan ve rollerden gelen)
      const permissions = await authService.getUserPermissions(userId);
      
      // İzin detaylarını al
      const permissionDetails = permissions.map(permName => {
        const permission = authorizationService.getPermission(permName);
        return permission || { name: permName, description: 'Bilinmeyen izin' };
      });

      const user = await authService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('Kullanıcı bulunamadı');
      }

      res.status(200).json({
        success: true,
        data: {
          userId,
          username: user.username,
          permissions: permissionDetails
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/user-roles/users/{userId}/permissions:
 *   put:
 *     summary: Belirli bir kullanıcının doğrudan izinlerini günceller (Admin)
 *     tags: [UserRoles]
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
 *             required:
 *               - permissions
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Kullanıcı izinleri başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put(
  '/users/:userId/permissions',
  authorizeRoute({
    path: '/users/:userId/permissions',
    method: 'put',
    roles: ['admin'],
    permissions: ['write:users']
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params; // userId from params is already string
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        throw new BadRequestError('İzinler bir dizi olmalıdır');
      }

      // İzinlerin geçerliliğini kontrol et
      const availablePermissions = Object.keys(authorizationService.getPermissions());
      const invalidPermissions = permissions.filter(permission => !availablePermissions.includes(permission));

      if (invalidPermissions.length > 0) {
        throw new BadRequestError(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
      }

      // Kullanıcı izinlerini güncelle
      const updatedUser = await authService.updateUserPermissions(userId, permissions);

      res.status(200).json({
        success: true,
        message: 'Kullanıcı izinleri başarıyla güncellendi',
        data: {
          userId,
          username: updatedUser.username,
          permissions: updatedUser.permissions
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Route izinlerini ekle
routeAuthManager.addRoutePermission({
  path: '/my-roles',
  method: 'get',
  roles: ['user', 'admin', 'service']
});

routeAuthManager.addRoutePermission({
  path: '/my-permissions',
  method: 'get',
  roles: ['user', 'admin', 'service']
});

routeAuthManager.addRoutePermission({
  path: '/check-permission',
  method: 'post',
  roles: ['user', 'admin', 'service']
});

routeAuthManager.addRoutePermission({
  path: '/check-resource-permission',
  method: 'post',
  roles: ['user', 'admin', 'service']
});

export default router;

