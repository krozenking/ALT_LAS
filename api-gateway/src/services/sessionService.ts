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
  lastActivityAt?: Date; // Oturum zaman aşımı için son aktivite zamanı
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

// Refresh token'a göre oturum ID'lerini saklama (hızlı erişim için)
const refreshTokenSessions = new Map<string, string>();

// Oturum yapılandırması
const sessionConfig = {
  // Varsayılan oturum süresi (gün)
  defaultExpiryDays: 7,
  
  // Oturum zaman aşımı süresi (dakika) - 30 dakika
  inactivityTimeoutMinutes: 30,
  
  // Maksimum aktif oturum sayısı (kullanıcı başına)
  maxActiveSessions: 5,
  
  // Oturum temizleme aralığı (ms) - 1 saat
  cleanupInterval: 3600000
};

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
  expiresInDays: number = sessionConfig.defaultExpiryDays
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
    lastActivityAt: now,
    isActive: true
  };
  
  // Kullanıcının aktif oturum sayısını kontrol et
  const userActiveSessions = getUserActiveSessions(userId);
  
  // Eğer maksimum aktif oturum sayısına ulaşıldıysa, en eski oturumu sonlandır
  if (userActiveSessions.length >= sessionConfig.maxActiveSessions) {
    // Oturumları oluşturma zamanına göre sırala
    userActiveSessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // En eski oturumu sonlandır
    const oldestSession = userActiveSessions[0];
    invalidateSession(oldestSession.id);
    
    logger.info(`Kullanıcı maksimum oturum sayısına ulaştı, en eski oturum sonlandırıldı: ${oldestSession.id} (Kullanıcı: ${userId})`);
  }
  
  // Aynı cihaz için önceki oturumu kontrol et ve sonlandır
  if (deviceInfo.deviceId) {
    const existingDeviceSession = getUserSessionByDevice(userId, deviceInfo.deviceId);
    if (existingDeviceSession) {
      invalidateSession(existingDeviceSession.id);
      logger.info(`Aynı cihaz için önceki oturum sonlandırıldı: ${existingDeviceSession.id} (Kullanıcı: ${userId}, Cihaz: ${deviceInfo.deviceId})`);
    }
  }
  
  // Oturumu sakla
  sessions.set(sessionId, sessionInfo);
  
  // Kullanıcı oturumlarını güncelle
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new Set<string>());
  }
  userSessions.get(userId)?.add(sessionId);
  
  // Refresh token ile oturum ID'sini ilişkilendir
  refreshTokenSessions.set(refreshToken, sessionId);
  
  logger.info(`Yeni oturum oluşturuldu: ${sessionId} (Kullanıcı: ${userId}, Cihaz: ${deviceInfo.deviceName || 'Bilinmeyen'})`);
  
  return sessionInfo;
};

/**
 * Refresh token ile oturum bilgisini alır
 * @param refreshToken Refresh token
 * @returns Oturum bilgisi
 */
export const getSessionByRefreshToken = (refreshToken: string): SessionInfo => {
  // Refresh token ile oturum ID'sini bul
  const sessionId = refreshTokenSessions.get(refreshToken);
  
  if (!sessionId) {
    throw new UnauthorizedError('Geçersiz refresh token');
  }
  
  // Oturum bilgisini al
  const session = sessions.get(sessionId);
  
  if (!session || !session.isActive) {
    // Eğer oturum bulunamazsa veya aktif değilse, ilişkiyi temizle
    refreshTokenSessions.delete(refreshToken);
    throw new UnauthorizedError('Geçersiz veya sonlandırılmış oturum');
  }
  
  // Oturum süresini kontrol et
  if (session.expiresAt < new Date()) {
    // Oturumu sonlandır
    invalidateSession(sessionId);
    // İlişkiyi temizle
    refreshTokenSessions.delete(refreshToken);
    throw new UnauthorizedError('Oturum süresi doldu');
  }
  
  // Oturum zaman aşımını kontrol et
  if (session.lastActivityAt) {
    const inactivityTimeout = new Date(session.lastActivityAt);
    inactivityTimeout.setMinutes(inactivityTimeout.getMinutes() + sessionConfig.inactivityTimeoutMinutes);
    
    if (inactivityTimeout < new Date()) {
      // Oturumu sonlandır
      invalidateSession(sessionId);
      // İlişkiyi temizle
      refreshTokenSessions.delete(refreshToken);
      throw new UnauthorizedError('Oturum zaman aşımına uğradı');
    }
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
  updates: Partial<Pick<SessionInfo, 'refreshToken' | 'lastUsedAt' | 'expiresAt' | 'isActive' | 'lastActivityAt'>>
): SessionInfo => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    throw new NotFoundError('Oturum bulunamadı');
  }
  
  // Refresh token değişiyorsa, ilişkileri güncelle
  if (updates.refreshToken && updates.refreshToken !== session.refreshToken) {
    // Eski refresh token ilişkisini kaldır
    refreshTokenSessions.delete(session.refreshToken);
    // Yeni refresh token ilişkisini ekle
    refreshTokenSessions.set(updates.refreshToken, sessionId);
  }
  
  // Alanları güncelle
  Object.assign(session, updates);
  
  // Son kullanma tarihini güncelle (eğer belirtilmemişse)
  if (!updates.lastUsedAt) {
    session.lastUsedAt = new Date();
  }
  
  // Son aktivite zamanını güncelle (eğer belirtilmemişse)
  if (!updates.lastActivityAt) {
    session.lastActivityAt = new Date();
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
  
  // Refresh token ilişkisini kaldır
  refreshTokenSessions.delete(session.refreshToken);
  
  logger.info(`Oturum sonlandırıldı: ${sessionId} (Kullanıcı: ${session.userId})`);
};

/**
 * Refresh token ile oturumu sonlandırır
 * @param refreshToken Refresh token
 */
export const invalidateSessionByRefreshToken = (refreshToken: string): void => {
  // Refresh token ile oturum ID'sini bul
  const sessionId = refreshTokenSessions.get(refreshToken);
  
  if (!sessionId) {
    logger.warn(`Refresh token ile ilişkili oturum bulunamadı: ${refreshToken}`);
    return;
  }
  
  // Oturumu sonlandır
  invalidateSession(sessionId);
  
  // İlişkiyi temizle
  refreshTokenSessions.delete(refreshToken);
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
      // Oturumu sonlandır
      invalidateSession(sessionId);
    }
  });
  
  logger.info(`Kullanıcının tüm oturumları sonlandırıldı: ${userId} (${userSessionIds.size} oturum)`);
};

/**
 * Kullanıcının belirli bir oturum dışındaki tüm oturumlarını sonlandırır
 * @param userId Kullanıcı ID'si
 * @param excludeSessionId Hariç tutulacak oturum ID'si
 */
export const invalidateAllUserSessionsExcept = (userId: string, excludeSessionId: string): void => {
  const userSessionIds = userSessions.get(userId);
  
  if (!userSessionIds || userSessionIds.size === 0) {
    logger.warn(`Kullanıcının aktif oturumu bulunamadı: ${userId}`);
    return;
  }
  
  let invalidatedCount = 0;
  
  // Belirtilen oturum dışındaki tüm oturumları sonlandır
  userSessionIds.forEach(sessionId => {
    if (sessionId !== excludeSessionId) {
      const session = sessions.get(sessionId);
      if (session && session.isActive) {
        // Oturumu sonlandır
        invalidateSession(sessionId);
        invalidatedCount++;
      }
    }
  });
  
  logger.info(`Kullanıcının diğer oturumları sonlandırıldı: ${userId} (${invalidatedCount} oturum, ${excludeSessionId} hariç)`);
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
 * Oturum aktivitesini günceller
 * @param sessionId Oturum ID'si
 */
export const updateSessionActivity = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    logger.warn(`Aktivite güncellenecek oturum bulunamadı: ${sessionId}`);
    return;
  }
  
  // Son aktivite zamanını güncelle
  session.lastActivityAt = new Date();
  
  logger.debug(`Oturum aktivitesi güncellendi: ${sessionId}`);
};

/**
 * Oturum süresini uzatır
 * @param sessionId Oturum ID'si
 * @param additionalDays Eklenecek gün sayısı
 */
export const extendSessionExpiry = (sessionId: string, additionalDays: number = 7): void => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    logger.warn(`Süresi uzatılacak oturum bulunamadı: ${sessionId}`);
    return;
  }
  
  // Yeni son kullanma tarihini hesapla
  const newExpiresAt = new Date(session.expiresAt);
  newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);
  
  // Son kullanma tarihini güncelle
  session.expiresAt = newExpiresAt;
  
  logger.info(`Oturum süresi uzatıldı: ${sessionId} (Yeni son kullanma tarihi: ${newExpiresAt.toISOString()})`);
};

/**
 * Oturum zaman aşımı süresini kontrol eder ve gerekirse oturumu sonlandırır
 * @param sessionId Oturum ID'si
 * @returns Oturum aktif mi
 */
export const checkSessionTimeout = (sessionId: string): boolean => {
  const session = sessions.get(sessionId);
  
  if (!session || !session.isActive) {
    return false;
  }
  
  // Oturum süresini kontrol et
  if (session.expiresAt < new Date()) {
    // Oturumu sonlandır
    invalidateSession(sessionId);
    logger.info(`Oturum süresi doldu ve sonlandırıldı: ${sessionId}`);
    return false;
  }
  
  // Oturum zaman aşımını kontrol et
  if (session.lastActivityAt) {
    const inactivityTimeout = new Date(session.lastActivityAt);
    inactivityTimeout.setMinutes(inactivityTimeout.getMinutes() + sessionConfig.inactivityTimeoutMinutes);
    
    if (inactivityTimeout < new Date()) {
      // Oturumu sonlandır
      invalidateSession(sessionId);
      logger.info(`Oturum zaman aşımına uğradı ve sonlandırıldı: ${sessionId}`);
      return false;
    }
  }
  
  return true;
};

/**
 * Süresi dolmuş ve zaman aşımına uğramış oturumları temizler
 */
export const cleanupExpiredSessions = (): void => {
  const now = new Date();
  let expiredCount = 0;
  let timeoutCount = 0;
  
  // Tüm oturumları kontrol et
  sessions.forEach((session, sessionId) => {
    if (!session.isActive) {
      // Pasif oturumları temizle
      cleanupSession(sessionId);
      expiredCount++;
    } else if (session.expiresAt <= now) {
      // Süresi dolmuş oturumları sonlandır ve temizle
      invalidateSession(sessionId);
      cleanupSession(sessionId);
      expiredCount++;
    } else if (session.lastActivityAt) {
      // Zaman aşımına uğramış oturumları kontrol et
      const inactivityTimeout = new Date(session.lastActivityAt);
      inactivityTimeout.setMinutes(inactivityTimeout.getMinutes() + sessionConfig.inactivityTimeoutMinutes);
      
      if (inactivityTimeout <= now) {
        // Zaman aşımına uğramış oturumları sonlandır ve temizle
        invalidateSession(sessionId);
        cleanupSession(sessionId);
        timeoutCount++;
      }
    }
  });
  
  if (expiredCount > 0 || timeoutCount > 0) {
    logger.info(`Oturum temizleme: ${expiredCount} süresi dolmuş, ${timeoutCount} zaman aşımına uğramış oturum temizlendi`);
  }
};

/**
 * Oturum kaydını temizler
 * @param sessionId Oturum ID'si
 */
const cleanupSession = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return;
  }
  
  // Kullanıcı oturumlarından kaldır
  const userSessionIds = userSessions.get(session.userId);
  if (userSessionIds) {
    userSessionIds.delete(sessionId);
    // Eğer kullanıcının hiç oturumu kalmadıysa, kullanıcı kaydını da kaldır
    if (userSessionIds.size === 0) {
      userSessions.delete(session.userId);
    }
  }
  
  // Refresh token ilişkisini kaldır
  refreshTokenSessions.delete(session.refreshToken);
  
  // Oturumu kaldır
  sessions.delete(sessionId);
};

/**
 * Oturum yapılandırmasını günceller
 * @param config Yeni yapılandırma
 */
export const updateSessionConfig = (config: Partial<typeof sessionConfig>): void => {
  Object.assign(sessionConfig, config);
  logger.info('Oturum yapılandırması güncellendi', { sessionConfig });
};

/**
 * Oturum yapılandırmasını alır
 * @returns Oturum yapılandırması
 */
export const getSessionConfig = (): typeof sessionConfig => {
  return { ...sessionConfig };
};

// Periyodik olarak süresi dolmuş oturumları temizle
const cleanupInterval = setInterval(cleanupExpiredSessions, sessionConfig.cleanupInterval);

// Modül kaldırıldığında interval'i temizle
if (typeof module !== 'undefined' && module.exports) {
  module.exports.cleanup = () => {
    clearInterval(cleanupInterval);
  };
}

export default {
  createSession,
  getSessionByRefreshToken,
  updateSession,
  invalidateSession,
  invalidateSessionByRefreshToken,
  invalidateAllUserSessions,
  invalidateAllUserSessionsExcept,
  getUserActiveSessions,
  getUserSessionByDevice,
  updateSessionActivity,
  extendSessionExpiry,
  checkSessionTimeout,
  cleanupExpiredSessions,
  updateSessionConfig,
  getSessionConfig
};
