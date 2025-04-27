import crypto from 'crypto';
import logger from '../utils/logger';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

// Oturum bilgisi arayüzü
export interface SessionInfo {
  id: string;
  userId: string;
  refreshToken: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  expiresAt: Date;
  lastUsedAt: Date;
  isActive: boolean;
}

// Cihaz bilgisi arayüzü
export interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ip?: string;
  userAgent?: string;
}

// Oturum saklama için Map (gerçek uygulamada veritabanı kullanılmalı)
const sessions = new Map<string, SessionInfo>();

// Kullanıcı ID'sine göre oturumları saklama (hızlı erişim için)
const userSessions = new Map<string, Set<string>>();

/**
 * Yeni bir oturum oluşturur
 * @param userId Kullanıcı ID'si
 * @param refreshToken Refresh token
 * @param deviceInfo Cihaz bilgisi
 * @param expiresInDays Oturum süresi (gün)
 * @returns Oturum bilgisi
 */
export const createSession = (
  userId: string,
  refreshToken: string,
  deviceInfo: DeviceInfo,
  expiresInDays: number = 7
): SessionInfo => {
  // Oturum ID'si oluştur
  const sessionId = crypto.randomUUID();
  
  // Oturum bilgisini oluştur
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  const sessionInfo: SessionInfo = {
    id: sessionId,
    userId,
    refreshToken,
    deviceInfo,
    createdAt: now,
    expiresAt,
    lastUsedAt: now,
    isActive: true
  };
  
  // Oturumu sakla
  sessions.set(sessionId, sessionInfo);
  
  // Kullanıcı oturumlarını güncelle
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new Set<string>());
  }
  userSessions.get(userId)?.add(sessionId);
  
  logger.info(`Yeni oturum oluşturuldu: ${sessionId} (Kullanıcı: ${userId}, Cihaz: ${deviceInfo.deviceName || 'Bilinmeyen'})`);
  
  return sessionInfo;
};

/**
 * Refresh token ile oturum bilgisini alır
 * @param refreshToken Refresh token
 * @returns Oturum bilgisi
 */
export const getSessionByRefreshToken = (refreshToken: string): SessionInfo => {
  // Refresh token ile oturumu bul
  const session = Array.from(sessions.values()).find(s => 
    s.refreshToken === refreshToken && s.isActive && s.expiresAt > new Date()
  );
  
  if (!session) {
    throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token');
  }
  
  return session;
};

/**
 * Oturum bilgisini günceller
 * @param sessionId Oturum ID'si
 * @param updates Güncellenecek alanlar
 * @returns Güncellenmiş oturum bilgisi
 */
export const updateSession = (
  sessionId: string,
  updates: Partial<Pick<SessionInfo, 'refreshToken' | 'lastUsedAt' | 'expiresAt' | 'isActive'>>
): SessionInfo => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new NotFoundError('Oturum bulunamadı');
  }
  
  // Alanları güncelle
  Object.assign(session, updates);
  
  // Son kullanma tarihini güncelle (eğer belirtilmemişse)
  if (!updates.lastUsedAt) {
    session.lastUsedAt = new Date();
  }
  
  logger.debug(`Oturum güncellendi: ${sessionId}`);
  
  return session;
};

/**
 * Oturumu sonlandırır
 * @param sessionId Oturum ID'si
 */
export const invalidateSession = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    logger.warn(`Sonlandırılacak oturum bulunamadı: ${sessionId}`);
    return;
  }
  
  // Oturumu pasif yap
  session.isActive = false;
  
  logger.info(`Oturum sonlandırıldı: ${sessionId} (Kullanıcı: ${session.userId})`);
};

/**
 * Refresh token ile oturumu sonlandırır
 * @param refreshToken Refresh token
 */
export const invalidateSessionByRefreshToken = (refreshToken: string): void => {
  try {
    const session = getSessionByRefreshToken(refreshToken);
    invalidateSession(session.id);
  } catch (error) {
    logger.warn(`Refresh token ile oturum sonlandırma başarısız: ${error.message}`);
  }
};

/**
 * Kullanıcının tüm oturumlarını sonlandırır
 * @param userId Kullanıcı ID'si
 */
export const invalidateAllUserSessions = (userId: string): void => {
  const userSessionIds = userSessions.get(userId);
  
  if (!userSessionIds || userSessionIds.size === 0) {
    logger.warn(`Kullanıcının aktif oturumu bulunamadı: ${userId}`);
    return;
  }
  
  // Tüm oturumları sonlandır
  userSessionIds.forEach(sessionId => {
    const session = sessions.get(sessionId);
    if (session && session.isActive) {
      session.isActive = false;
      logger.debug(`Kullanıcı oturumu sonlandırıldı: ${sessionId}`);
    }
  });
  
  logger.info(`Kullanıcının tüm oturumları sonlandırıldı: ${userId} (${userSessionIds.size} oturum)`);
};

/**
 * Kullanıcının aktif oturumlarını alır
 * @param userId Kullanıcı ID'si
 * @returns Aktif oturumlar
 */
export const getUserActiveSessions = (userId: string): SessionInfo[] => {
  const userSessionIds = userSessions.get(userId);
  
  if (!userSessionIds) {
    return [];
  }
  
  // Aktif oturumları filtrele
  const activeSessions = Array.from(userSessionIds)
    .map(sessionId => sessions.get(sessionId))
    .filter(session => session && session.isActive && session.expiresAt > new Date()) as SessionInfo[];
  
  return activeSessions;
};

/**
 * Kullanıcının belirli bir cihaz için aktif oturumunu alır
 * @param userId Kullanıcı ID'si
 * @param deviceId Cihaz ID'si
 * @returns Oturum bilgisi veya undefined
 */
export const getUserSessionByDevice = (userId: string, deviceId: string): SessionInfo | undefined => {
  const userSessionIds = userSessions.get(userId);
  
  if (!userSessionIds) {
    return undefined;
  }
  
  // Cihaz ID'sine göre oturumu bul
  for (const sessionId of userSessionIds) {
    const session = sessions.get(sessionId);
    if (session && 
        session.isActive && 
        session.expiresAt > new Date() && 
        session.deviceInfo.deviceId === deviceId) {
      return session;
    }
  }
  
  return undefined;
};

/**
 * Süresi dolmuş oturumları temizler
 */
export const cleanupExpiredSessions = (): void => {
  const now = new Date();
  let expiredCount = 0;
  
  // Tüm oturumları kontrol et
  sessions.forEach((session, sessionId) => {
    if (session.expiresAt <= now || !session.isActive) {
      // Kullanıcı oturumlarından kaldır
      const userSessionIds = userSessions.get(session.userId);
      if (userSessionIds) {
        userSessionIds.delete(sessionId);
        // Eğer kullanıcının hiç oturumu kalmadıysa, kullanıcı kaydını da kaldır
        if (userSessionIds.size === 0) {
          userSessions.delete(session.userId);
        }
      }
      
      // Oturumu kaldır
      sessions.delete(sessionId);
      expiredCount++;
    }
  });
  
  if (expiredCount > 0) {
    logger.info(`${expiredCount} süresi dolmuş oturum temizlendi`);
  }
};

// Periyodik olarak süresi dolmuş oturumları temizle (her saat)
setInterval(cleanupExpiredSessions, 3600000);

export default {
  createSession,
  getSessionByRefreshToken,
  updateSession,
  invalidateSession,
  invalidateSessionByRefreshToken,
  invalidateAllUserSessions,
  getUserActiveSessions,
  getUserSessionByDevice,
  cleanupExpiredSessions
};
