import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import logger from '../utils/logger';
import jwtService from '../services/jwtService';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

// Mock kullanıcı veritabanı (gerçek uygulamada veritabanı kullanılmalı)
const users = new Map<string, { id: string; username: string; password: string; roles: string[] }>();

// Örnek kullanıcılar ekle
users.set('admin', {
  id: '1',
  username: 'admin',
  password: 'password', // Gerçek uygulamada hash'lenmiş şifre kullanılmalı
  roles: ['admin']
});

users.set('user', {
  id: '2',
  username: 'user',
  password: 'password', // Gerçek uygulamada hash'lenmiş şifre kullanılmalı
  roles: ['user']
});

/**
 * Kullanıcı kaydı
 * @param username Kullanıcı adı
 * @param password Şifre
 * @param roles Roller
 * @returns Kayıt sonucu
 */
export const register = async (
  username: string,
  password: string,
  roles: string[] = ['user']
): Promise<{ user: any; token: string; refreshToken: string }> => {
  // Kullanıcı adının benzersiz olup olmadığını kontrol et
  if (users.has(username)) {
    throw new BadRequestError('Bu kullanıcı adı zaten kullanılıyor');
  }

  // Şifre doğrulama (gerçek uygulamada daha kapsamlı doğrulama yapılmalı)
  if (!password || password.length < 6) {
    throw new BadRequestError('Şifre en az 6 karakter olmalıdır');
  }

  // Yeni kullanıcı oluştur
  const id = `${users.size + 1}`;
  const user = {
    id,
    username,
    password, // Gerçek uygulamada hash'lenmiş şifre kullanılmalı
    roles
  };

  // Kullanıcıyı kaydet
  users.set(username, user);
  logger.info(`Yeni kullanıcı kaydedildi: ${username}`);

  // Token oluştur
  const token = jwtService.generateToken({
    userId: id,
    username,
    roles
  });

  // Refresh token oluştur
  const refreshToken = jwtService.generateRefreshToken(id);

  // Kullanıcı bilgilerini döndür (şifre hariç)
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
    refreshToken
  };
};

/**
 * Kullanıcı girişi
 * @param username Kullanıcı adı
 * @param password Şifre
 * @returns Giriş sonucu
 */
export const login = async (
  username: string,
  password: string
): Promise<{ user: any; token: string; refreshToken: string }> => {
  // Kullanıcıyı bul
  const user = users.get(username);

  // Kullanıcı yoksa veya şifre yanlışsa hata döndür
  if (!user || user.password !== password) {
    logger.warn(`Geçersiz giriş denemesi: ${username}`);
    throw new UnauthorizedError('Geçersiz kullanıcı adı veya şifre');
  }

  logger.info(`Kullanıcı girişi başarılı: ${username}`);

  // Token oluştur
  const token = jwtService.generateToken({
    userId: user.id,
    username: user.username,
    roles: user.roles
  });

  // Refresh token oluştur
  const refreshToken = jwtService.generateRefreshToken(user.id);

  // Kullanıcı bilgilerini döndür (şifre hariç)
  const { password: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
    refreshToken
  };
};

/**
 * Token yenileme
 * @param refreshToken Refresh token
 * @returns Yeni token ve refresh token
 */
export const refreshToken = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  try {
    // Token yenile
    const result = jwtService.refreshAccessToken(refreshToken);
    logger.info('Token yenileme başarılı');
    return result;
  } catch (error) {
    logger.warn('Token yenileme başarısız:', error);
    throw error;
  }
};

/**
 * Kullanıcı çıkışı
 * @param token JWT token
 */
export const logout = async (token: string): Promise<void> => {
  // Token'ı blacklist'e ekle
  jwtService.blacklistToken(token);
  logger.info('Kullanıcı çıkışı başarılı');
};

/**
 * Kullanıcı bilgilerini getir
 * @param userId Kullanıcı ID'si
 * @returns Kullanıcı bilgileri
 */
export const getUserById = async (userId: string): Promise<any> => {
  // Kullanıcıyı bul
  const user = Array.from(users.values()).find(u => u.id === userId);

  if (!user) {
    throw new BadRequestError('Kullanıcı bulunamadı');
  }

  // Kullanıcı bilgilerini döndür (şifre hariç)
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Tüm kullanıcıları getir
 * @returns Kullanıcı listesi
 */
export const getAllUsers = async (): Promise<any[]> => {
  // Tüm kullanıcıları döndür (şifre hariç)
  return Array.from(users.values()).map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getUserById,
  getAllUsers
};
