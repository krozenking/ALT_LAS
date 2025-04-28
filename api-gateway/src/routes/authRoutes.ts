import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT, authorizeRoles, authorizePermissions } from '../middleware/authMiddleware';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';
import authService from '../services/authService';
import authorizationService from '../services/authorizationService';
import { routeAuthManager } from '../middleware/routeAuthMiddleware';

const router = Router();

// Kullanıcı kaydı
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validasyon
    if (!username || !email || !password) {
      throw new BadRequestError('Kullanıcı adı, email ve şifre gereklidir');
    }

    // Kullanıcı oluştur
    const user = await authService.createUser({
      username,
      email,
      password,
      firstName,
      lastName,
      roles: ['user'] // Varsayılan rol
    });

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles
      }
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı girişi
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // Validasyon
    if (!username || !password) {
      throw new BadRequestError('Kullanıcı adı ve şifre gereklidir');
    }

    // Kullanıcıyı doğrula
    const user = await authService.validateUser(username, password);

    // Token oluştur
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles
    };

    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    const token = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    // Refresh token'ı kaydet
    await authService.saveRefreshToken(user.id, refreshToken);

    // Oturum oluştur
    const sessionId = uuidv4();
    await authService.createSession(user.id, sessionId, req.ip, req.headers['user-agent'] || 'unknown');

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        refreshToken,
        sessionId,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Token yenileme
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token gereklidir');
    }

    // Refresh token'ı doğrula
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    const decoded = jwt.verify(refreshToken, secret) as { userId: string | number };

    // Refresh token'ın geçerliliğini kontrol et
    const isValid = await authService.validateRefreshToken(decoded.userId, refreshToken);
    if (!isValid) {
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token');
    }

    // Kullanıcı bilgilerini al
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    // Yeni token oluştur
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      roles: user.roles
    };

    const newToken = jwt.sign(tokenPayload, secret, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

    // Eski refresh token'ı geçersiz kıl ve yenisini kaydet
    await authService.invalidateRefreshToken(user.id, refreshToken);
    await authService.saveRefreshToken(user.id, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token başarıyla yenilendi',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı çıkışı
router.post('/logout', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.body.sessionId;

    if (!userId) {
      throw new UnauthorizedError('Oturum bulunamadı');
    }

    // Refresh token'ı geçersiz kıl (varsa)
    if (req.body.refreshToken) {
      await authService.invalidateRefreshToken(userId, req.body.refreshToken);
    }

    // Oturumu sonlandır
    if (sessionId) {
      await authService.endSession(userId, sessionId);
    } else {
      // Tüm oturumları sonlandır
      await authService.endAllSessions(userId);
    }

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı profili
router.get('/profile', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    const user = await authService.getUserById(userId);
    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı profili güncelleme
router.put('/profile', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    const { firstName, lastName, email } = req.body;
    const updatedUser = await authService.updateUser(userId, { firstName, lastName, email });

    res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles
      }
    });
  } catch (error) {
    next(error);
  }
});

// Şifre değiştirme
router.post('/change-password', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Mevcut şifre ve yeni şifre gereklidir');
    }

    // Mevcut şifreyi doğrula
    const user = await authService.getUserById(userId);
    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Mevcut şifre yanlış');
    }

    // Şifreyi güncelle
    await authService.updatePassword(userId, newPassword);

    // Tüm oturumları sonlandır (isteğe bağlı)
    // await authService.endAllSessions(userId);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    next(error);
  }
});

// Şifre sıfırlama isteği
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError('Email adresi gereklidir');
    }

    // Kullanıcıyı kontrol et
    const user = await authService.getUserByEmail(email);
    if (!user) {
      // Güvenlik için kullanıcı bulunamasa bile başarılı yanıt dön
      res.status(200).json({
        success: true,
        message: 'Şifre sıfırlama talimatları email adresinize gönderildi (eğer hesap mevcutsa)'
      });
      return;
    }

    // Şifre sıfırlama token'ı oluştur
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 saat

    // Token'ı kaydet
    await authService.savePasswordResetToken(user.id, resetToken, resetTokenExpiry);

    // Email gönder (gerçek uygulamada)
    logger.info(`Şifre sıfırlama token'ı oluşturuldu: ${resetToken} (${user.email} için)`);

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama talimatları email adresinize gönderildi',
      // DEV ONLY: Token'ı yanıtta gönder (gerçek uygulamada kaldırılmalı)
      data: {
        resetToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Şifre sıfırlama
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      throw new BadRequestError('Sıfırlama token\'ı ve yeni şifre gereklidir');
    }

    // Token'ı doğrula
    const user = await authService.validatePasswordResetToken(resetToken);
    if (!user) {
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş token');
    }

    // Şifreyi güncelle
    await authService.updatePassword(user.id, newPassword);

    // Token'ı geçersiz kıl
    await authService.invalidatePasswordResetToken(resetToken);

    // Tüm oturumları sonlandır
    await authService.endAllSessions(user.id);

    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı'
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı oturumları
router.get('/sessions', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    const sessions = await authService.getUserSessions(userId);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

// Belirli bir oturumu sonlandır
router.delete('/sessions/:sessionId', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    await authService.endSession(userId, sessionId);

    res.status(200).json({
      success: true,
      message: 'Oturum başarıyla sonlandırıldı'
    });
  } catch (error) {
    next(error);
  }
});

// Tüm oturumları sonlandır (mevcut oturum hariç)
router.delete('/sessions', authenticateJWT, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const currentSessionId = req.body.currentSessionId;

    if (!userId) {
      throw new UnauthorizedError('Kimlik doğrulaması gerekli');
    }

    if (!currentSessionId) {
      throw new BadRequestError('Mevcut oturum ID\'si gereklidir');
    }

    await authService.endAllSessionsExcept(userId, currentSessionId);

    res.status(200).json({
      success: true,
      message: 'Diğer tüm oturumlar başarıyla sonlandırıldı'
    });
  } catch (error) {
    next(error);
  }
});

// ---- YÖNETİCİ ROTALARI ----

// Tüm kullanıcıları listele
router.get('/users', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await authService.getAllUsers();

    res.status(200).json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı detayı
router.get('/users/:userId', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const user = await authService.getUserById(userId);

    if (!user) {
      throw new NotFoundError('Kullanıcı bulunamadı');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı güncelleme (admin)
router.put('/users/:userId', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, isActive } = req.body;

    const updatedUser = await authService.updateUser(userId, { firstName, lastName, email, isActive });

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        roles: updatedUser.roles,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı silme
router.delete('/users/:userId', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    await authService.deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı rollerini güncelleme
router.put('/users/:userId/roles', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      throw new BadRequestError('Roller bir dizi olmalıdır');
    }

    // Rollerin geçerliliğini kontrol et
    const availableRoles = Object.keys(authorizationService.getRoles());
    const invalidRoles = roles.filter(role => !availableRoles.includes(role));

    if (invalidRoles.length > 0) {
      throw new BadRequestError(`Geçersiz roller: ${invalidRoles.join(', ')}`);
    }

    const updatedUser = await authService.updateUserRoles(userId, roles);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı rolleri başarıyla güncellendi',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        roles: updatedUser.roles
      }
    });
  } catch (error) {
    next(error);
  }
});

// Kullanıcı izinlerini güncelleme
router.put('/users/:userId/permissions', authenticateJWT, authorizeRoles('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
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

    const updatedUser = await authService.updateUserPermissions(userId, permissions);

    res.status(200).json({
      success: true,
      message: 'Kullanıcı izinleri başarıyla güncellendi',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        permissions: updatedUser.permissions
      }
    });
  } catch (error) {
    next(error);
  }
});

// ---- ROL VE İZİN YÖNETİMİ ----

// Tüm rolleri listele
router.get('/roles', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response) => {
  const roles = authorizationService.getRoles();
  res.status(200).json({
    success: true,
    data: roles
  });
});

// Rol detayı
router.get('/roles/:roleName', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
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
});

// Yeni rol oluştur
router.post('/roles', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !Array.isArray(permissions)) {
      throw new BadRequestError('Rol adı ve izinler gereklidir');
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
});

// Rol güncelle
router.put('/roles/:roleName', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
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
      throw new BadRequestError('Admin rolü güncellenemez');
    }

    // İzinlerin geçerliliğini kontrol et
    if (permissions) {
      if (!Array.isArray(permissions)) {
        throw new BadRequestError('İzinler bir dizi olmalıdır');
      }

      const availablePermissions = Object.keys(authorizationService.getPermissions());
      const invalidPermissions = permissions.filter(permission => !availablePermissions.includes(permission));

      if (invalidPermissions.length > 0) {
        throw new BadRequestError(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
      }

      // Önce tüm izinleri kaldır
      [...role.permissions].forEach(permission => {
        authorizationService.removePermissionFromRole(roleName, permission);
      });

      // Yeni izinleri ekle
      permissions.forEach(permission => {
        authorizationService.addPermissionToRole(roleName, permission);
      });
    }

    // Açıklamayı güncelle
    if (description) {
      // Rol nesnesini güncelle (authorizationService'de bu işlevi eklemek gerekebilir)
      role.description = description;
    }

    res.status(200).json({
      success: true,
      message: 'Rol başarıyla güncellendi',
      data: authorizationService.getRole(roleName)
    });
  } catch (error) {
    next(error);
  }
});

// Rol sil
router.delete('/roles/:roleName', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roleName } = req.params;

    // Rol var mı kontrol et
    if (!authorizationService.getRole(roleName)) {
      throw new NotFoundError('Rol bulunamadı');
    }

    // Temel rolleri silmeye izin verme
    if (['admin', 'user', 'service', 'guest'].includes(roleName)) {
      throw new BadRequestError('Temel roller silinemez');
    }

    authorizationService.removeRole(roleName);

    res.status(200).json({
      success: true,
      message: 'Rol başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
});

// Tüm izinleri listele
router.get('/permissions', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response) => {
  const permissions = authorizationService.getPermissions();
  res.status(200).json({
    success: true,
    data: permissions
  });
});

// İzin detayı
router.get('/permissions/:permissionName', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { permissionName } = req.params;
    const permission = authorizationService.getPermission(permissionName);

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
});

// Yeni izin oluştur
router.post('/permissions', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
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
});

// İzin sil
router.delete('/permissions/:permissionName', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { permissionName } = req.params;

    // İzin var mı kontrol et
    if (!authorizationService.getPermission(permissionName)) {
      throw new NotFoundError('İzin bulunamadı');
    }

    // Temel izinleri silmeye izin verme
    if (permissionName === 'admin' || permissionName.startsWith('read:') || permissionName.startsWith('write:')) {
      throw new BadRequestError('Temel izinler silinemez');
    }

    authorizationService.removePermission(permissionName);

    res.status(200).json({
      success: true,
      message: 'İzin başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
});

// ---- ROUTE İZİNLERİ YÖNETİMİ ----

// Tüm route izinlerini listele
router.get('/route-permissions', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response) => {
  const routePermissions = routeAuthManager.getRoutePermissions();
  res.status(200).json({
    success: true,
    data: routePermissions
  });
});

// Route izni ekle/güncelle
router.post('/route-permissions', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path, method, roles, permissions, resourceAction } = req.body;

    if (!path || !method) {
      throw new BadRequestError('Path ve method gereklidir');
    }

    // Method geçerliliğini kontrol et
    const validMethods = ['get', 'post', 'put', 'delete', 'patch'];
    if (!validMethods.includes(method.toLowerCase())) {
      throw new BadRequestError(`Geçersiz method: ${method}. Geçerli methodlar: ${validMethods.join(', ')}`);
    }

    // Rollerin geçerliliğini kontrol et
    if (roles) {
      if (!Array.isArray(roles)) {
        throw new BadRequestError('Roller bir dizi olmalıdır');
      }

      const availableRoles = Object.keys(authorizationService.getRoles());
      const invalidRoles = roles.filter(role => !availableRoles.includes(role));

      if (invalidRoles.length > 0) {
        throw new BadRequestError(`Geçersiz roller: ${invalidRoles.join(', ')}`);
      }
    }

    // İzinlerin geçerliliğini kontrol et
    if (permissions) {
      if (!Array.isArray(permissions)) {
        throw new BadRequestError('İzinler bir dizi olmalıdır');
      }

      const availablePermissions = Object.keys(authorizationService.getPermissions());
      const invalidPermissions = permissions.filter(permission => !availablePermissions.includes(permission));

      if (invalidPermissions.length > 0) {
        throw new BadRequestError(`Geçersiz izinler: ${invalidPermissions.join(', ')}`);
      }
    }

    // ResourceAction geçerliliğini kontrol et
    if (resourceAction) {
      if (!resourceAction.resource || !resourceAction.action) {
        throw new BadRequestError('ResourceAction için resource ve action gereklidir');
      }
    }

    routeAuthManager.addRoutePermission({
      path,
      method: method.toLowerCase(),
      roles,
      permissions,
      resourceAction
    });

    res.status(201).json({
      success: true,
      message: 'Route izni başarıyla eklendi/güncellendi'
    });
  } catch (error) {
    next(error);
  }
});

// Route izni sil
router.delete('/route-permissions', authenticateJWT, authorizeRoles('admin'), (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path, method } = req.body;

    if (!path || !method) {
      throw new BadRequestError('Path ve method gereklidir');
    }

    routeAuthManager.removeRoutePermission(path, method.toLowerCase());

    res.status(200).json({
      success: true,
      message: 'Route izni başarıyla silindi'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
