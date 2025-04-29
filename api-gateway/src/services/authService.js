/**
 * Authentication Service
 * 
 * Bu servis, kullanıcı kimlik doğrulama ve yetkilendirme işlemlerini yönetir.
 * JWT tabanlı bir kimlik doğrulama sistemi sunar (erişim ve yenileme tokenları ile).
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Basit bir kullanıcı ve token veritabanı (gerçek uygulamada veritabanı kullanılmalıdır)
const users = {
  // username: { id, password (hashed), roles, ... }
};
const refreshTokens = {
  // token: { userId, expiresAt }
};

// JWT seçenekleri
const JWT_SECRET = process.env.JWT_SECRET || 'alt_las_development_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'alt_las_refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Erişim token süresi kısaltıldı
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Yenileme token süresi

const authService = {
  /**
   * Kullanıcı kaydı oluşturur
   */
  register(username, password, roles = ['user']) {
    if (users[username]) {
      throw new Error('User already exists');
    }
    
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
    
    const { password: _, ...userInfo } = user;
    return userInfo;
  },
  
  /**
   * Kullanıcı girişi yapar ve JWT erişim/yenileme tokenları üretir
   */
  login(username, password) {
    const user = users[username];
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    const hash = crypto.pbkdf2Sync(password, user.password.salt, 1000, 64, 'sha512').toString('hex');
    if (hash !== user.password.hash) {
      throw new Error('Invalid username or password');
    }
    
    // Erişim token oluştur
    const accessTokenPayload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
      type: 'access' // Token tipini belirt
    };
    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Yenileme token oluştur
    const refreshTokenPayload = {
      sub: user.id,
      type: 'refresh' // Token tipini belirt
    };
    const refreshToken = jwt.sign(refreshTokenPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

    // Yenileme token'ını sakla (basit in-memory)
    const expiresAt = new Date(Date.now() + parseInt(JWT_REFRESH_EXPIRES_IN) * 1000);
    refreshTokens[refreshToken] = { userId: user.id, expiresAt };

    // Eski refresh tokenları temizle (opsiyonel, periyodik olarak yapılabilir)
    this.cleanupRefreshTokens();
    
    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN,
      tokenType: 'Bearer'
    };
  },

  /**
   * Yeni bir erişim token'ı üretir (yenileme token kullanarak)
   */
  refreshAccessToken(refreshToken) {
    try {
      // Yenileme token'ını doğrula
      const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      
      // Saklanan token ile eşleşiyor mu ve geçerli mi kontrol et
      const storedToken = refreshTokens[refreshToken];
      if (!storedToken || storedToken.userId !== payload.sub || storedToken.expiresAt < new Date()) {
        if (storedToken) delete refreshTokens[refreshToken]; // Geçersizse sil
        throw new Error('Invalid or expired refresh token');
      }

      // Kullanıcıyı bul
      const user = this.getUserById(payload.sub);
      if (!user) {
        throw new Error('User not found');
      }

      // Yeni erişim token oluştur
      const accessTokenPayload = {
        sub: user.id,
        username: user.username,
        roles: user.roles,
        type: 'access'
      };
      const newAccessToken = jwt.sign(accessTokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      return {
        accessToken: newAccessToken,
        expiresIn: JWT_EXPIRES_IN,
        tokenType: 'Bearer'
      };

    } catch (error) {
      // Eğer token süresi dolmuşsa veya geçersizse, saklanan kaydı sil
      if (refreshTokens[refreshToken]) {
          delete refreshTokens[refreshToken];
      }
      throw new Error('Invalid or expired refresh token');
    }
  },
  
  /**
   * JWT erişim token doğrular
   */
  verifyToken(token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // Sadece 'access' tipli tokenları kabul et
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  },

  /**
   * Kullanıcı çıkışı yapar (yenileme token'ını geçersiz kılar)
   */
  logout(refreshToken) {
    if (refreshTokens[refreshToken]) {
      delete refreshTokens[refreshToken];
      return true;
    }
    return false;
  },

  /**
   * Süresi dolmuş yenileme tokenlarını temizler
   */
  cleanupRefreshTokens() {
    const now = new Date();
    Object.keys(refreshTokens).forEach(token => {
      if (refreshTokens[token].expiresAt < now) {
        delete refreshTokens[token];
      }
    });
  },
  
  /**
   * Kullanıcı bilgilerini getirir
   */
  getUserById(userId) {
    const user = Object.values(users).find(u => u.id === userId);
    if (!user) {
      return null;
    }
    const { password: _, ...userInfo } = user;
    return userInfo;
  },
  
  /**
   * Rol tabanlı yetkilendirme kontrolü yapar
   */
  authorize(requiredRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
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
  // Periyodik token temizleme (örnek)
  setInterval(() => authService.cleanupRefreshTokens(), 60 * 60 * 1000); // Saatte bir
}

module.exports = authService;

