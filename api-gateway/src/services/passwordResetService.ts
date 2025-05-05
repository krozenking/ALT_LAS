import { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import authService from '../services/authService';
import logger from '../utils/logger';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Şifre sıfırlama token'larını saklamak için geçici bellek deposu
// Gerçek uygulamada bu veritabanında saklanmalıdır
interface PasswordResetToken {
  userId: string | number;
  token: string;
  expiresAt: Date;
}

class PasswordResetService {
  private tokens: PasswordResetToken[] = [];
  private tokenExpiryMinutes: number = 30; // Token geçerlilik süresi (dakika)
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Email gönderimi için transporter oluştur
    // Not: Gerçek uygulamada bu bilgiler environment variables'dan alınmalıdır
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'user@example.com',
        pass: process.env.SMTP_PASS || 'password'
      }
    });

    // Belirli aralıklarla süresi dolmuş token'ları temizle
    setInterval(() => this.cleanExpiredTokens(), 15 * 60 * 1000); // 15 dakikada bir
  }

  /**
   * Şifre sıfırlama token'ı oluşturur
   * @param userId Kullanıcı ID
   * @returns Oluşturulan token
   */
  generateToken(userId: string | number): string {
    // Rastgele token oluştur
    const token = crypto.randomBytes(32).toString('hex');
    
    // Sona erme zamanını hesapla
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.tokenExpiryMinutes);
    
    // Aynı kullanıcı için var olan token'ı temizle
    this.tokens = this.tokens.filter(t => t.userId !== userId);
    
    // Yeni token'ı ekle
    this.tokens.push({
      userId,
      token,
      expiresAt
    });
    
    return token;
  }

  /**
   * Token'ın geçerli olup olmadığını kontrol eder
   * @param token Token
   * @returns Token geçerli ise kullanıcı ID, değilse null
   */
  validateToken(token: string): string | number | null {
    const now = new Date();
    const tokenInfo = this.tokens.find(t => t.token === token && t.expiresAt > now);
    
    return tokenInfo ? tokenInfo.userId : null;
  }

  /**
   * Token'ı kullandıktan sonra siler
   * @param token Token
   */
  invalidateToken(token: string): void {
    this.tokens = this.tokens.filter(t => t.token !== token);
  }

  /**
   * Süresi dolmuş token'ları temizler
   */
  cleanExpiredTokens(): void {
    const now = new Date();
    const initialCount = this.tokens.length;
    this.tokens = this.tokens.filter(t => t.expiresAt > now);
    
    const removedCount = initialCount - this.tokens.length;
    if (removedCount > 0) {
      logger.info(`${removedCount} süresi dolmuş şifre sıfırlama token'ı temizlendi`);
    }
  }

  /**
   * Şifre sıfırlama e-postası gönderir
   * @param email E-posta adresi
   * @param token Sıfırlama token'ı
   * @param username Kullanıcı adı
   */
  async sendPasswordResetEmail(email: string, token: string, username: string): Promise<void> {
    // Frontend URL'i (gerçek uygulamada environment variables'dan alınmalıdır)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@alt-las.com',
      to: email,
      subject: 'ALT_LAS - Şifre Sıfırlama',
      html: `
        <h1>Şifre Sıfırlama</h1>
        <p>Merhaba ${username},</p>
        <p>ALT_LAS hesabınız için şifre sıfırlama talebinde bulundunuz.</p>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href="${resetUrl}">Şifremi Sıfırla</a></p>
        <p>Bu bağlantı ${this.tokenExpiryMinutes} dakika boyunca geçerlidir.</p>
        <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        <p>Saygılarımızla,<br>ALT_LAS Ekibi</p>
      `
    };
    
    try {
      await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Şifre sıfırlama e-postası gönderildi: ${email}`);
    } catch (error) {
      logger.error(`Şifre sıfırlama e-postası gönderilirken hata oluştu: ${error}`);
      throw new Error('E-posta gönderimi başarısız oldu');
    }
  }
}

// Singleton instance
export const passwordResetService = new PasswordResetService();

/**
 * Şifre sıfırlama talebi işleme middleware'i
 */
export const handlePasswordResetRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new BadRequestError('E-posta adresi gereklidir');
    }
    
    // E-posta formatını doğrula
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestError('Geçersiz e-posta formatı');
    }
    
    // Kullanıcıyı e-posta adresine göre bul
    const user = await authService.getUserByEmail(email);
    
    // Kullanıcı bulunamazsa bile güvenlik için başarılı yanıt döndür
    if (!user) {
      logger.warn(`Şifre sıfırlama talebi: Kullanıcı bulunamadı - ${email}`);
      res.json({ 
        message: 'E-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama talimatları gönderilecektir.' 
      });
      return;
    }
    
    // Kullanıcı bulunamazsa veya ID yoksa hata yönetimi (veya loglama)
    if (!user || !user.id || !user.username) {
      logger.warn(`Şifre sıfırlama talebi: Kullanıcı bilgileri eksik - ${email}`);
      res.json({ 
        message: 'E-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama talimatları gönderilecektir.' 
      });
      return;
    }
    
    // Token oluştur (user.id string olmalı, authService'deki tiplere göre)
    const token = passwordResetService.generateToken(String(user.id));
    
    // E-posta gönder (user.username string olmalı)
    await passwordResetService.sendPasswordResetEmail(email, token, String(user.username));
    
    res.json({ 
      message: 'E-posta adresiniz sistemimizde kayıtlıysa, şifre sıfırlama talimatları gönderilecektir.' 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Şifre sıfırlama işlemi middleware'i
 */
export const handlePasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      throw new BadRequestError('Token ve yeni şifre gereklidir');
    }
    
    // Şifre gücünü kontrol et
    if (newPassword.length < 8) {
      throw new BadRequestError('Şifre en az 8 karakter uzunluğunda olmalıdır');
    }
    
    // Token'ı doğrula ve şifreyi güncelle (authService.resetPassword içinde yapılır)
    await authService.resetPassword(token, newPassword);
    
    // Token geçersiz kılma authService.resetPassword içinde yapılır
    
    logger.info(`Şifre token ile başarıyla sıfırlandı: ${token}`);
    res.json({ message: 'Şifreniz başarıyla sıfırlandı' });
  } catch (error) {
    next(error);
  }
};

export default passwordResetService;
