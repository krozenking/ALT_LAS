import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors'; // Assuming ForbiddenError exists
import authService from '../services/authService'; // Import authService to fetch user details

// JWT doğrulama middleware'i
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('Yetkilendirme token\'ı bulunamadı'));
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(new UnauthorizedError('Geçersiz token formatı'));
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    const decoded = jwt.verify(token, secret) as { userId: string | number }; // Assume token contains userId

    // Fetch detailed user info including roles and permissions from DB/service
    // This makes roles/permissions always up-to-date, not just snapshot from token creation time
    const userDetails = await authService.getUserDetailsForAuth(decoded.userId); 
    // getUserDetailsForAuth should return an object like { id, username, roles, permissions }
    // or throw an error if user not found/inactive

    if (!userDetails) {
        return next(new UnauthorizedError('Kullanıcı bulunamadı veya aktif değil'));
    }

    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = userDetails as Express.User; // Cast to the extended type

    next();
  } catch (error: any) { // Explicitly type error as any or unknown
    if (error instanceof UnauthorizedError) { // Handle errors from authService
        return next(error);
    }
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token süresi doldu'));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Geçersiz token'));
    } else {
      // Log the actual error for debugging
      console.error('Token verification or user fetch failed:', error);
      return next(new UnauthorizedError('Token doğrulama veya kullanıcı bilgisi alma hatası'));
    }
  }
};

// Rol tabanlı yetkilendirme middleware'i (Basit)
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      // This should ideally not happen if authenticateJWT runs first and succeeds
      return next(new UnauthorizedError('Kimlik doğrulaması gerekli'));
    }

    const userRoles = req.user.roles || [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError(`Bu işlem için gerekli rollerden biri (${allowedRoles.join('/')}) bulunamadı`));
    }

    next();
  };
};

// İzin tabanlı yetkilendirme middleware'i (Daha Granüler)
export const authorizePermissions = (...requiredPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
       // This should ideally not happen if authenticateJWT runs first and succeeds
      return next(new UnauthorizedError('Kimlik doğrulaması gerekli'));
    }

    // Kullanıcının izinlerini al (authenticateJWT tarafından doldurulmuş olmalı)
    const userPermissions = req.user.permissions || [];

    // Gerekli tüm izinlere sahip olup olmadığını kontrol et
    const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(p => !userPermissions.includes(p));
        console.warn(`Authorization failed for user ${req.user.id}. Required: ${requiredPermissions.join(', ')}, User has: ${userPermissions.join(', ')}, Missing: ${missingPermissions.join(', ')}`);
        return next(new ForbiddenError(`Bu işlem için gerekli izin(ler) bulunamadı: ${missingPermissions.join(', ')}`));
    }

    next();
  };
};


// Request nesnesine user özelliği eklemek için type extension
// User tipini daha belirgin hale getirelim
declare global {
  namespace Express {
    interface User {
      id: string | number; // Veya kullanıcı ID'nizin tipi
      username?: string;
      roles?: string[];
      permissions?: string[];
      // authService.getUserDetailsForAuth tarafından döndürülen diğer alanlar...
    }
    interface Request {
      user?: User;
    }
  }
}

