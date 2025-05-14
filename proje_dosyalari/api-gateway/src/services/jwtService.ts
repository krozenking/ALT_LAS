import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

// JWT yapılandırma seçenekleri
interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  algorithm: jwt.Algorithm;
  issuer: string;
  audience: string;
}

// Varsayılan JWT yapılandırması
const defaultConfig: JWTConfig = {
  secret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  algorithm: 'HS256',
  issuer: 'alt-las-api',
  audience: 'alt-las-client'
};

// Token blacklist'i (gerçek uygulamada Redis veya veritabanı kullanılmalı)
const tokenBlacklist = new Set<string>();

/**
 * JWT token oluşturur
 * @param payload Token içeriği
 * @param options Token seçenekleri
 * @returns JWT token
 */
export const generateToken = (
  payload: Record<string, any>,
  options: Partial<JWTConfig> = {}
): string => {
  const config = { ...defaultConfig, ...options };
  
  return jwt.sign(
    payload,
    config.secret,
    {
      expiresIn: config.expiresIn,
      algorithm: config.algorithm,
      issuer: config.issuer,
      audience: config.audience
    } as jwt.SignOptions // Add type assertion
  );
};

/**
 * Refresh token oluşturur
 * @param userId Kullanıcı ID'si
 * @param options Token seçenekleri
 * @returns Refresh token
 */
export const generateRefreshToken = (
  userId: string,
  options: Partial<JWTConfig> = {}
): string => {
  const config = { ...defaultConfig, ...options };
  
  return jwt.sign(
    { userId, type: "refresh" },
    config.secret,
    {
      expiresIn: config.refreshExpiresIn,
      algorithm: config.algorithm,
      issuer: config.issuer,
      audience: config.audience
    } as jwt.SignOptions // Add type assertion
  );
};

/**
 * JWT token doğrular
 * @param token JWT token
 * @param options Token seçenekleri
 * @returns Doğrulanmış token içeriği
 */
export const verifyToken = (
  token: string,
  options: Partial<JWTConfig> = {}
): jwt.JwtPayload => {
  const config = { ...defaultConfig, ...options };
  
  try {
    // Token blacklist kontrolü
    if (tokenBlacklist.has(token)) {
      throw new UnauthorizedError("Token geçersiz kılındı");
    }
    
    return jwt.verify(token, config.secret, {
      algorithms: [config.algorithm],
      issuer: config.issuer,
      audience: config.audience
    }) as jwt.JwtPayload;
  } catch (error: unknown) { // Catch unknown error type
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    // Check if error is an object and has a name property before accessing it
    const errorName = (typeof error === "object" && error !== null && "name" in error) ? (error as { name: string }).name : "UnknownError";

    if (errorName === "TokenExpiredError") {
      throw new UnauthorizedError("Token süresi doldu");
    } else if (errorName === "JsonWebTokenError") {
      throw new UnauthorizedError("Geçersiz token");
    } else {
      logger.error("Token doğrulama hatası:", error);
      throw new UnauthorizedError("Token doğrulama hatası");
    }
  }
};

/**
 * Token'ı blacklist'e ekler
 * @param token JWT token
 */
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
  
  // Gerçek uygulamada, token'ın süresi dolduğunda blacklist'ten kaldırılması için
  // bir mekanizma oluşturulmalıdır (örn. Redis TTL)
  try {
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    if (decoded && decoded.exp) {
      const expiryMs = decoded.exp * 1000 - Date.now();
      if (expiryMs > 0) {
        setTimeout(() => {
          tokenBlacklist.delete(token);
          logger.debug(`Token blacklist'ten kaldırıldı: ${token.substring(0, 10)}...`);
        }, expiryMs);
      }
    }
  } catch (error) {
    logger.error('Token decode hatası:', error);
  }
};

/**
 * JWT kimlik doğrulama middleware'i - REMOVED as it conflicts with authMiddleware.ts
 */
/*
export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  // ... (implementation removed)
};
*/

/**
 * Rol tabanlı yetkilendirme middleware'i
 * @param roles İzin verilen roller
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Yetkilendirme gerekli');
    }
    
    const userRoles = req.user.roles || [];
    
    // Kullanıcının gerekli rollerden en az birine sahip olup olmadığını kontrol et
    const hasRole = roles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenError('Bu işlem için yetkiniz yok');
    }
    
    next();
  };
};

/**
 * Refresh token ile yeni token oluşturur
 * @param refreshToken Refresh token
 * @returns Yeni token ve refresh token
 */
export const refreshAccessToken = (refreshToken: string): { token: string, refreshToken: string } => {
  try {
    // Refresh token'ı doğrula
    const decoded = verifyToken(refreshToken);
    
    // Refresh token tipini kontrol et
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Geçersiz refresh token');
    }
    
    // Kullanıcı ID'sini al
    const userId = decoded.userId;
    
    if (!userId) {
      throw new UnauthorizedError('Geçersiz refresh token içeriği');
    }
    
    // Yeni token'lar oluştur
    // Gerçek uygulamada, kullanıcı bilgileri veritabanından alınmalıdır
    const token = generateToken({ 
      userId,
      username: `user_${userId}`,
      roles: ['user']
    });
    
    const newRefreshToken = generateRefreshToken(userId);
    
    // Eski refresh token'ı blacklist'e ekle
    blacklistToken(refreshToken);
    
    return { token, refreshToken: newRefreshToken };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    logger.error('Refresh token hatası:', error);
    throw new UnauthorizedError('Refresh token işlemi başarısız');
  }
};

// Request nesnesine user özelliği eklemek için type extension - REMOVED as it conflicts with authMiddleware.ts
/*
declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
    }
  }
}
*/

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  blacklistToken,
  // authenticateJWT, // Removed as it conflicts with authMiddleware.ts
  authorize,
  refreshAccessToken
};
