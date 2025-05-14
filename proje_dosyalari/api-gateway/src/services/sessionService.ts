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
  deviceType?: string; // e.g., 'desktop', 'mobile', 'tablet'
  browser?: string;    // e.g., 'Chrome', 'Firefox', 'Safari'
  os?: string;         // e.g., 'Windows', 'macOS', 'Linux', 'Android', 'iOS'
  ip?: string;
  userAgent?: string;
}

// Oturum analitikleri için arayüz
export interface SessionAnalyticsData {
  totalActiveSessions: number;
  totalSessionsCreated: number;
  totalSessionsInvalidated: number;
  sessionDurations: number[]; // Store durations in milliseconds for completed sessions
  averageSessionDurationMs: number;
  sessionsByDeviceType: Record<string, number>;
  sessionsByBrowser: Record<string, number>;
  sessionsByOs: Record<string, number>;
}

// Oturum saklama için Map (gerçek uygulamada veritabanı kullanılmalı)
const sessions = new Map<string, SessionInfo>();

// Kullanıcı ID'sine göre oturumları saklama (hızlı erişim için)
const userSessions = new Map<string, Set<string>>();

// Refresh token'a göre oturum ID'lerini saklama (hızlı erişim için)
const refreshTokenSessions = new Map<string, string>();

// Oturum analitik verileri
const analyticsData: SessionAnalyticsData = {
  totalActiveSessions: 0,
  totalSessionsCreated: 0,
  totalSessionsInvalidated: 0,
  sessionDurations: [],
  averageSessionDurationMs: 0,
  sessionsByDeviceType: {},
  sessionsByBrowser: {},
  sessionsByOs: {},
};

// Oturum yapılandırması
const sessionConfig = {
  defaultExpiryDays: 7,
  inactivityTimeoutMinutes: 30,
  maxActiveSessions: 5,
  cleanupInterval: 3600000
};

const updateAnalyticsOnCreate = (deviceInfo: DeviceInfo) => {
  analyticsData.totalActiveSessions++;
  analyticsData.totalSessionsCreated++;
  if (deviceInfo.deviceType) {
    analyticsData.sessionsByDeviceType[deviceInfo.deviceType] = (analyticsData.sessionsByDeviceType[deviceInfo.deviceType] || 0) + 1;
  }
  if (deviceInfo.browser) {
    analyticsData.sessionsByBrowser[deviceInfo.browser] = (analyticsData.sessionsByBrowser[deviceInfo.browser] || 0) + 1;
  }
  if (deviceInfo.os) {
    analyticsData.sessionsByOs[deviceInfo.os] = (analyticsData.sessionsByOs[deviceInfo.os] || 0) + 1;
  }
};

const updateAnalyticsOnInvalidate = (session: SessionInfo) => {
  if (session.isActive) { // Ensure we only count active sessions being invalidated
    analyticsData.totalActiveSessions = Math.max(0, analyticsData.totalActiveSessions - 1);
  }
  analyticsData.totalSessionsInvalidated++;
  const durationMs = new Date().getTime() - session.createdAt.getTime();
  analyticsData.sessionDurations.push(durationMs);
  const totalDuration = analyticsData.sessionDurations.reduce((sum, dur) => sum + dur, 0);
  analyticsData.averageSessionDurationMs = analyticsData.sessionDurations.length > 0 ? totalDuration / analyticsData.sessionDurations.length : 0;
};

export const getSessionAnalytics = (): SessionAnalyticsData => {
  // Return a copy to prevent direct modification
  return JSON.parse(JSON.stringify(analyticsData));
};

// Testler için analitik verilerini sıfırlama fonksiyonu
export const _resetSessionAnalyticsForTesting = (): void => {
    analyticsData.totalActiveSessions = 0;
    analyticsData.totalSessionsCreated = 0;
    analyticsData.totalSessionsInvalidated = 0;
    analyticsData.sessionDurations = [];
    analyticsData.averageSessionDurationMs = 0;
    analyticsData.sessionsByDeviceType = {};
    analyticsData.sessionsByBrowser = {};
    analyticsData.sessionsByOs = {};
    logger.info("Session analytics reset for testing.");
};

export const createSession = (
  userId: string,
  refreshToken: string,
  deviceInfo: DeviceInfo,
  expiresInDays: number = sessionConfig.defaultExpiryDays
): SessionInfo => {
  const sessionId = crypto.randomUUID();
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
  
  const userActiveSessionsList = getUserActiveSessions(userId);
  if (userActiveSessionsList.length >= sessionConfig.maxActiveSessions) {
    userActiveSessionsList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldestSession = userActiveSessionsList[0];
    invalidateSession(oldestSession.id);
    logger.info(`Kullanıcı maksimum oturum sayısına ulaştı, en eski oturum sonlandırıldı: ${oldestSession.id} (Kullanıcı: ${userId})`);
  }
  
  if (deviceInfo.deviceId) {
    const existingDeviceSession = getUserSessionByDevice(userId, deviceInfo.deviceId);
    if (existingDeviceSession) {
      invalidateSession(existingDeviceSession.id);
      logger.info(`Aynı cihaz için önceki oturum sonlandırıldı: ${existingDeviceSession.id} (Kullanıcı: ${userId}, Cihaz: ${deviceInfo.deviceId})`);
    }
  }
  
  sessions.set(sessionId, sessionInfo);
  if (!userSessions.has(userId)) {
    userSessions.set(userId, new Set<string>());
  }
  userSessions.get(userId)?.add(sessionId);
  refreshTokenSessions.set(refreshToken, sessionId);
  
  updateAnalyticsOnCreate(deviceInfo); // Analitikleri güncelle
  logger.info(`Yeni oturum oluşturuldu: ${sessionId} (Kullanıcı: ${userId}, Cihaz: ${deviceInfo.deviceName || 'Bilinmeyen'})`);
  return sessionInfo;
};

export const invalidateSession = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  if (!session) {
    logger.warn(`Sonlandırılacak oturum bulunamadı: ${sessionId}`);
    return;
  }
  
  if (session.isActive) { // Sadece aktifken analitikleri güncelle
      updateAnalyticsOnInvalidate(session);
  }
  session.isActive = false;
  refreshTokenSessions.delete(session.refreshToken);
  logger.info(`Oturum sonlandırıldı: ${sessionId} (Kullanıcı: ${session.userId})`);
};

// Mevcut diğer fonksiyonlar (getSessionByRefreshToken, updateSession, vb.) buraya gelecek.
// Bu fonksiyonların analitiklerle doğrudan bir ilişkisi olmayabilir, ancak dolaylı olarak etkileyebilirler.
// Örneğin, updateSession aktiviteyi güncellediğinde, bu oturum süresini etkileyebilir.

export const getSessionByRefreshToken = (refreshToken: string): SessionInfo => {
  const sessionId = refreshTokenSessions.get(refreshToken);
  if (!sessionId) {
    throw new UnauthorizedError('Geçersiz refresh token');
  }
  const session = sessions.get(sessionId);
  if (!session || !session.isActive) {
    refreshTokenSessions.delete(refreshToken);
    throw new UnauthorizedError('Geçersiz veya sonlandırılmış oturum');
  }
  if (session.expiresAt < new Date()) {
    invalidateSession(sessionId);
    refreshTokenSessions.delete(refreshToken);
    throw new UnauthorizedError('Oturum süresi doldu');
  }
  if (session.lastActivityAt) {
    const inactivityTimeout = new Date(session.lastActivityAt);
    inactivityTimeout.setMinutes(inactivityTimeout.getMinutes() + sessionConfig.inactivityTimeoutMinutes);
    if (inactivityTimeout < new Date()) {
      invalidateSession(sessionId);
      refreshTokenSessions.delete(refreshToken);
      throw new UnauthorizedError('Oturum zaman aşımına uğradı');
    }
  }
  return session;
};

export const updateSession = (
  sessionId: string,
  updates: Partial<Pick<SessionInfo, 'refreshToken' | 'lastUsedAt' | 'expiresAt' | 'isActive' | 'lastActivityAt'>>
): SessionInfo => {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new NotFoundError('Oturum bulunamadı');
  }
  if (updates.refreshToken && updates.refreshToken !== session.refreshToken) {
    refreshTokenSessions.delete(session.refreshToken);
    refreshTokenSessions.set(updates.refreshToken, sessionId);
  }
  Object.assign(session, updates);
  if (!updates.lastUsedAt) {
    session.lastUsedAt = new Date();
  }
  if (!updates.lastActivityAt) {
    session.lastActivityAt = new Date();
  }
  logger.debug(`Oturum güncellendi: ${sessionId}`);
  return session;
};

export const invalidateSessionByRefreshToken = (refreshToken: string): void => {
  const sessionId = refreshTokenSessions.get(refreshToken);
  if (!sessionId) {
    logger.warn(`Refresh token ile ilişkili oturum bulunamadı: ${refreshToken}`);
    return;
  }
  invalidateSession(sessionId);
  refreshTokenSessions.delete(refreshToken);
};

export const invalidateAllUserSessions = (userId: string): void => {
  const userSessionIds = userSessions.get(userId);
  if (!userSessionIds || userSessionIds.size === 0) {
    logger.warn(`Kullanıcının aktif oturumu bulunamadı: ${userId}`);
    return;
  }
  userSessionIds.forEach(sessionId => {
    const session = sessions.get(sessionId);
    if (session && session.isActive) {
      invalidateSession(sessionId);
    }
  });
  logger.info(`Kullanıcının tüm oturumları sonlandırıldı: ${userId} (${userSessionIds.size} oturum)`);
};

export const invalidateAllUserSessionsExcept = (userId: string, excludeSessionId: string): void => {
  const userSessionIds = userSessions.get(userId);
  if (!userSessionIds || userSessionIds.size === 0) {
    logger.warn(`Kullanıcının aktif oturumu bulunamadı: ${userId}`);
    return;
  }
  let invalidatedCount = 0;
  userSessionIds.forEach(sessionId => {
    if (sessionId !== excludeSessionId) {
      const session = sessions.get(sessionId);
      if (session && session.isActive) {
        invalidateSession(sessionId);
        invalidatedCount++;
      }
    }
  });
  logger.info(`Kullanıcının diğer oturumları sonlandırıldı: ${userId} (${invalidatedCount} oturum, ${excludeSessionId} hariç)`);
};

export const getUserActiveSessions = (userId: string): SessionInfo[] => {
  const userSessionIds = userSessions.get(userId);
  if (!userSessionIds) {
    return [];
  }
  const activeSessions = Array.from(userSessionIds)
    .map(sessionId => sessions.get(sessionId))
    .filter(session => session && session.isActive && session.expiresAt > new Date()) as SessionInfo[];
  return activeSessions;
};

export const getUserSessionByDevice = (userId: string, deviceId: string): SessionInfo | undefined => {
  const userSessionIds = userSessions.get(userId);
  if (!userSessionIds) {
    return undefined;
  }
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

export const updateSessionActivity = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  if (!session) {
    logger.warn(`Aktivite güncellenecek oturum bulunamadı: ${sessionId}`);
    return;
  }
  session.lastActivityAt = new Date();
  logger.debug(`Oturum aktivitesi güncellendi: ${sessionId}`);
};

export const extendSessionExpiry = (sessionId: string, additionalDays: number = 7): void => {
  const session = sessions.get(sessionId);
  if (!session) {
    logger.warn(`Süresi uzatılacak oturum bulunamadı: ${sessionId}`);
    return;
  }
  const newExpiresAt = new Date(session.expiresAt);
  newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);
  session.expiresAt = newExpiresAt;
  logger.info(`Oturum süresi uzatıldı: ${sessionId} (Yeni son kullanma tarihi: ${newExpiresAt.toISOString()})`);
};

export const checkSessionTimeout = (sessionId: string): boolean => {
  const session = sessions.get(sessionId);
  if (!session || !session.isActive) {
    return false;
  }
  if (session.expiresAt < new Date()) {
    invalidateSession(sessionId);
    logger.info(`Oturum süresi doldu ve sonlandırıldı: ${sessionId}`);
    return false;
  }
  if (session.lastActivityAt) {
    const inactivityTimeout = new Date(session.lastActivityAt);
    inactivityTimeout.setMinutes(inactivityTimeout.getMinutes() + sessionConfig.inactivityTimeoutMinutes);
    if (inactivityTimeout < new Date()) {
      invalidateSession(sessionId);
      logger.info(`Oturum zaman aşımına uğradı ve sonlandırıldı: ${sessionId}`);
      return false;
    }
  }
  return true;
};

export const cleanupExpiredSessions = (): void => {
  const now = new Date();
  let expiredCount = 0;
  let timeoutCount = 0;
  sessions.forEach((session, sessionId) => {
    if (!session.isActive) {
      cleanupSession(sessionId);
      expiredCount++; // Consider these as already invalidated, maybe a different counter?
    } else if (session.expiresAt <= now) {
      invalidateSession(sessionId); // This will call updateAnalyticsOnInvalidate
      cleanupSession(sessionId);
      expiredCount++;
    } else if (session.lastActivityAt) {
      const inactivityTimeout = new Date(session.lastActivityAt);
      inactivityTimeout.setMinutes(inactivityTimeout.getMinutes() + sessionConfig.inactivityTimeoutMinutes);
      if (inactivityTimeout <= now) {
        invalidateSession(sessionId); // This will call updateAnalyticsOnInvalidate
        cleanupSession(sessionId);
        timeoutCount++;
      }
    }
  });
  if (expiredCount > 0 || timeoutCount > 0) {
    logger.info(`Oturum temizleme: ${expiredCount} süresi dolmuş/pasif, ${timeoutCount} zaman aşımına uğramış oturum temizlendi`);
  }
};

const cleanupSession = (sessionId: string): void => {
  const session = sessions.get(sessionId);
  if (!session) {
    return;
  }
  const userSessionIds = userSessions.get(session.userId);
  if (userSessionIds) {
    userSessionIds.delete(sessionId);
    if (userSessionIds.size === 0) {
      userSessions.delete(session.userId);
    }
  }
  refreshTokenSessions.delete(session.refreshToken);
  sessions.delete(sessionId);
};

export const updateSessionConfig = (config: Partial<typeof sessionConfig>): void => {
  Object.assign(sessionConfig, config);
  logger.info('Oturum yapılandırması güncellendi', { sessionConfig });
};

export const getSessionConfig = (): typeof sessionConfig => {
  return { ...sessionConfig };
};

let cleanupInterval: NodeJS.Timeout | null = null;
if (process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(cleanupExpiredSessions, sessionConfig.cleanupInterval);
  logger.info(`Session cleanup interval started (every ${sessionConfig.cleanupInterval}ms).`);
}

export const cleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Session cleanup interval stopped.');
  }
  // Reset in-memory stores for a clean state if process restarts (though not fully effective for non-test env)
  sessions.clear();
  userSessions.clear();
  refreshTokenSessions.clear();
  _resetSessionAnalyticsForTesting(); // Also reset analytics
};

if (process.env.NODE_ENV !== 'test') {
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

export const stopSessionCleanup = cleanup;

// Testler için tüm oturumları ve analitikleri temizleme
export const _clearAllSessionsForTesting = (): void => {
    sessions.clear();
    userSessions.clear();
    refreshTokenSessions.clear();
    _resetSessionAnalyticsForTesting();
    logger.info("All sessions and analytics cleared for testing.");
};

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
  getSessionConfig,
  stopSessionCleanup,
  getSessionAnalytics, // Analitik fonksiyonunu export et
  _resetSessionAnalyticsForTesting, // Test için export et
  _clearAllSessionsForTesting, // Test için export et
};

