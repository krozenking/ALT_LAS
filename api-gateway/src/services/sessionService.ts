import { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import authService from '../services/authService';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';

// Oturum yönetimi için arayüz
interface Session {
  userId: string | number;
  deviceId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

class SessionManager {
  private sessions: Session[] = [];
  private readonly accessTokenExpiryMinutes: number = 15; // Access token geçerlilik süresi (dakika)
  private readonly refreshTokenExpiryDays: number = 7; // Refresh token geçerlilik süresi (gün)
  private readonly sessionTimeoutHours: number = 24; // Oturum zaman aşımı süresi (saat)

  constructor() {
    // Belirli aralıklarla süresi dolmuş oturumları temizle
    setInterval(() => this.cleanExpiredSessions(), 60 * 60 * 1000); // Saatte bir
  }

  /**
   * Yeni bir oturum oluşturur
   * @param userId Kullanıcı ID
   * @param deviceId Cihaz ID
   * @param ipAddress IP adresi
   * @param userAgent Kullanıcı tarayıcı bilgisi
   * @returns Oluşturulan oturum bilgileri
   */
  createSession(
    userId: string | number,
    deviceId: string,
    ipAddress?: string,
    userAgent?: string
  ): { token: string; refreshToken: string } {
    // JWT secret key
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    
    // Access token oluştur
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes(tokenExpiry.getMinutes() + this.accessTokenExpiryMinutes);
    
    const token = jwt.sign(
      { userId, deviceId },
      secret,
      { expiresIn: `${this.accessTokenExpiryMinutes}m` }
    );
    
    // Refresh token oluştur
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + this.refreshTokenExpiryDays);
    
    const refreshToken = jwt.sign(
      { userId, deviceId, type: 'refresh' },
      secret,
      { expiresIn: `${this.refreshTokenExpiryDays}d` }
    );
    
    // Aynı kullanıcı ve cihaz için var olan oturumu temizle
    this.sessions = this.sessions.filter(
      s => !(s.userId === userId && s.deviceId === deviceId)
    );
    
    // Yeni oturumu ekle
    this.sessions.push({
      userId,
      deviceId,
      token,
      refreshToken,
      expiresAt: refreshTokenExpiry,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      ipAddress,
      userAgent
    });
    
    logger.info(`Yeni oturum oluşturuldu: Kullanıcı ${userId}, Cihaz ${deviceId}`);
    
    return { token, refreshToken };
  }

  /**
   * Refresh token ile yeni bir access token oluşturur
   * @param refreshToken Refresh token
   * @param ipAddress IP adresi
   * @param userAgent Kullanıcı tarayıcı bilgisi
   * @returns Yeni access token
   */
  refreshAccessToken(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): { token: string; refreshToken: string } {
    // JWT secret key
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    
    try {
      // Refresh token'ı doğrula
      const decoded = jwt.verify(refreshToken, secret) as { 
        userId: string | number; 
        deviceId: string;
        type?: string;
      };
      
      // Token tipini kontrol et
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Geçersiz refresh token');
      }
      
      // Oturumu bul
      const session = this.sessions.find(
        s => s.userId === decoded.userId && 
             s.deviceId === decoded.deviceId && 
             s.refreshToken === refreshToken
      );
      
      if (!session) {
        throw new UnauthorizedError('Oturum bulunamadı');
      }
      
      // Oturum süresini kontrol et
      if (session.expiresAt < new Date()) {
        this.removeSession(session.userId, session.deviceId);
        throw new UnauthorizedError('Oturum süresi doldu');
      }
      
      // Yeni token oluştur
      return this.createSession(
        decoded.userId,
        decoded.deviceId,
        ipAddress || session.ipAddress,
        userAgent || session.userAgent
      );
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      logger.error(`Token yenileme hatası: ${error}`);
      throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token');
    }
  }

  /**
   * Oturumu sonlandırır
   * @param userId Kullanıcı ID
   * @param deviceId Cihaz ID
   * @returns İşlem başarılı mı
   */
  removeSession(userId: string | number, deviceId: string): boolean {
    const initialCount = this.sessions.length;
    this.sessions = this.sessions.filter(
      s => !(s.userId === userId && s.deviceId === deviceId)
    );
    
    const removed = initialCount !== this.sessions.length;
    if (removed) {
      logger.info(`Oturum sonlandırıldı: Kullanıcı ${userId}, Cihaz ${deviceId}`);
    }
    
    return removed;
  }

  /**
   * Kullanıcının tüm oturumlarını sonlandırır
   * @param userId Kullanıcı ID
   * @returns Sonlandırılan oturum sayısı
   */
  removeAllUserSessions(userId: string | number): number {
    const initialCount = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.userId !== userId);
    
    const removedCount = initialCount - this.sessions.length;
    if (removedCount > 0) {
      logger.info(`Kullanıcı ${userId} için ${removedCount} oturum sonlandırıldı`);
    }
    
    return removedCount;
  }

  /**
   * Token'ı geçersiz kılar (blacklist'e ekler)
   * @param token Access token
   */
  invalidateToken(token: string): void {
    // Bu örnekte basit bir yaklaşım kullanıyoruz
    // Gerçek uygulamada Redis gibi bir cache kullanılabilir
    const session = this.sessions.find(s => s.token === token);
    if (session) {
      this.removeSession(session.userId, session.deviceId);
    }
  }

  /**
   * Kullanıcının aktif oturumlarını döndürür
   * @param userId Kullanıcı ID
   * @returns Aktif oturumlar
   */
  getUserSessions(userId: string | number): Omit<Session, 'token' | 'refreshToken'>[] {
    return this.sessions
      .filter(s => s.userId === userId)
      .map(({ token, refreshToken, ...rest }) => rest); // Token bilgilerini çıkar
  }

  /**
   * Oturum aktivitesini günceller
   * @param userId Kullanıcı ID
   * @param deviceId Cihaz ID
   */
  updateSessionActivity(userId: string | number, deviceId: string): void {
    const session = this.sessions.find(
      s => s.userId === userId && s.deviceId === deviceId
    );
    
    if (session) {
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Süresi dolmuş oturumları temizler
   */
  cleanExpiredSessions(): void {
    const now = new Date();
    const initialCount = this.sessions.length;
    
    // Süresi dolmuş oturumları filtrele
    this.sessions = this.sessions.filter(session => {
      // Refresh token süresi dolmuşsa
      if (session.expiresAt < now) {
        return false;
      }
      
      // Son aktivite üzerinden belirli bir süre geçmişse
      const lastActivityTimeout = new Date(session.lastActivityAt);
      lastActivityTimeout.setHours(lastActivityTimeout.getHours() + this.sessionTimeoutHours);
      
      return lastActivityTimeout >= now;
    });
    
    const removedCount = initialCount - this.sessions.length;
    if (removedCount > 0) {
      logger.info(`${removedCount} süresi dolmuş oturum temizlendi`);
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

/**
 * Oturum oluşturma middleware'i
 */
export const createUserSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Kullanıcı kimliği bulunamadı');
    }
    
    // Cihaz ID'si oluştur veya al
    // Gerçek uygulamada daha güvenli bir yöntem kullanılmalıdır
    const deviceId = req.body.deviceId || 
                     req.headers['x-device-id'] as string || 
                     `device_${Date.now()}`;
    
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    
    const { token, refreshToken } = sessionManager.createSession(
      userId,
      deviceId,
      ipAddress,
      userAgent
    );
    
    // Token bilgilerini response'a ekle
    res.locals.sessionTokens = { token, refreshToken };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Oturum sonlandırma middleware'i
 */
export const terminateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Kullanıcı kimliği bulunamadı');
    }
    
    const deviceId = req.body.deviceId || 
                     req.headers['x-device-id'] as string;
    
    if (!deviceId) {
      throw new BadRequestError('Cihaz kimliği gereklidir');
    }
    
    const success = sessionManager.removeSession(userId, deviceId);
    
    if (!success) {
      logger.warn(`Sonlandırılacak oturum bulunamadı: Kullanıcı ${userId}, Cihaz ${deviceId}`);
    }
    
    res.locals.sessionTerminated = success;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Tüm oturumları sonlandırma middleware'i
 */
export const terminateAllSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError('Kullanıcı kimliği bulunamadı');
    }
    
    const count = sessionManager.removeAllUserSessions(userId);
    
    res.locals.terminatedSessionCount = count;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Token yenileme middleware'i
 */
export const refreshSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new BadRequestError('Refresh token gereklidir');
    }
    
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    
    const tokens = sessionManager.refreshAccessToken(
      refreshToken,
      ipAddress,
      userAgent
    );
    
    res.locals.sessionTokens = tokens;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Kullanıcı oturumlarını listeleme middleware'i
 */
export const listUserSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      throw new UnauthorizedError('Kullanıcı kimliği bulunamadı');
    }
    
    // Yetki kontrolü - Kendi oturumlarını veya admin ise başkasının oturumlarını görebilir
    if (req.params.userId && req.params.userId !== req.user?.id.toString()) {
      const isAdmin = req.user?.roles?.includes('admin');
      if (!isAdmin) {
        throw new UnauthorizedError('Başka kullanıcıların oturumlarını görüntüleme yetkiniz yok');
      }
    }
    
    const sessions = sessionManager.getUserSessions(userId);
    
    res.locals.userSessions = sessions;
    
    next();
  } catch (error) {
    next(error);
  }
};

export default sessionManager;
