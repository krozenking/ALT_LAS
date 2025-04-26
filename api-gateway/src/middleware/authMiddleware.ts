import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

// JWT doğrulama middleware'i
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  // Authorization header'ını al
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new UnauthorizedError('Yetkilendirme token\'ı bulunamadı');
  }
  
  // Bearer token formatını kontrol et
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Geçersiz token formatı');
  }
  
  const token = parts[1];
  
  try {
    // Token'ı doğrula
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    const decoded = jwt.verify(token, secret);
    
    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token süresi doldu');
    } else if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Geçersiz token');
    } else {
      throw new UnauthorizedError('Token doğrulama hatası');
    }
  }
};

// Rol tabanlı yetkilendirme middleware'i
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Yetkilendirme gerekli');
    }
    
    const userRoles = req.user.roles || [];
    
    // Kullanıcının gerekli rollerden en az birine sahip olup olmadığını kontrol et
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      throw new UnauthorizedError('Bu işlem için yetkiniz yok');
    }
    
    next();
  };
};

// Request nesnesine user özelliği eklemek için type extension
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
