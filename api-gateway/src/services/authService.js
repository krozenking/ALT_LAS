/**
 * Authentication Service
 * 
 * Bu servis, kullanıcı kimlik doğrulama ve yetkilendirme işlemlerini yönetir.
 * JWT tabanlı bir kimlik doğrulama sistemi sunar.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Basit bir kullanıcı veritabanı (gerçek uygulamada veritabanı kullanılmalıdır)
const users = {
  // username: { id, password (hashed), roles, ... }
};

// JWT seçenekleri
const JWT_SECRET = process.env.JWT_SECRET || 'alt_las_development_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const authService = {
  /**
   * Kullanıcı kaydı oluşturur
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   * @param {Array} roles - Kullanıcı rolleri
   * @returns {Object} Kullanıcı bilgileri (şifre hariç)
   */
  register(username, password, roles = ['user']) {
    if (users[username]) {
      throw new Error('User already exists');
    }
    
    // Şifreyi hashle
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    const user = {
      id: crypto.randomUUID(),
      username,
      password: { hash, salt },
      roles,
      createdAt: new Date().toISOString()
    };
    
    users[username] = user;
    
    // Şifre bilgisini çıkararak kullanıcı bilgilerini döndür
    const { password: _, ...userInfo } = user;
    return userInfo;
  },
  
  /**
   * Kullanıcı girişi yapar ve JWT token üretir
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   * @returns {Object} Token bilgileri
   */
  login(username, password) {
    const user = users[username];
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Şifre doğrulama
    const hash = crypto.pbkdf2Sync(password, user.password.salt, 1000, 64, 'sha512').toString('hex');
    if (hash !== user.password.hash) {
      throw new Error('Invalid username or password');
    }
    
    // JWT token oluştur
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    return {
      token,
      expiresIn: JWT_EXPIRES_IN,
      tokenType: 'Bearer'
    };
  },
  
  /**
   * JWT token doğrular
   * @param {string} token - JWT token
   * @returns {Object} Token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },
  
  /**
   * Kullanıcı bilgilerini getirir
   * @param {string} userId - Kullanıcı ID
   * @returns {Object} Kullanıcı bilgileri (şifre hariç)
   */
  getUserById(userId) {
    const user = Object.values(users).find(u => u.id === userId);
    if (!user) {
      return null;
    }
    
    // Şifre bilgisini çıkararak kullanıcı bilgilerini döndür
    const { password: _, ...userInfo } = user;
    return userInfo;
  },
  
  /**
   * Rol tabanlı yetkilendirme kontrolü yapar
   * @param {Array} requiredRoles - Gerekli roller
   * @returns {Function} Express middleware
   */
  authorize(requiredRoles = []) {
    return (req, res, next) => {
      // Kullanıcı kimlik doğrulaması yapılmış olmalı
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Rol kontrolü
      if (requiredRoles.length > 0) {
        const hasRequiredRole = req.user.roles.some(role => requiredRoles.includes(role));
        if (!hasRequiredRole) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }
      
      next();
    };
  }
};

// Test kullanıcısı oluştur (geliştirme ortamı için)
if (process.env.NODE_ENV === 'development') {
  try {
    authService.register('admin', 'admin123', ['admin', 'user']);
    console.log('Test user created: admin / admin123');
  } catch (error) {
    // Kullanıcı zaten var, yoksay
  }
}

module.exports = authService;
