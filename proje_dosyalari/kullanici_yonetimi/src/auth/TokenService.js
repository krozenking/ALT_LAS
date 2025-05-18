// ALT_LAS Token Servisi

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT için gizli anahtar (gerçek uygulamada güvenli bir şekilde saklanmalı)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRES_IN = '24h'; // Token geçerlilik süresi

/**
 * Token oluşturma ve doğrulama fonksiyonları
 */

/**
 * JWT token oluşturur
 * @param {Object} payload - Token içeriği
 * @returns {string} - JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * JWT token doğrular
 * @param {string} token - Doğrulanacak token
 * @returns {Object|null} - Token geçerli ise payload, değilse null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token doğrulanırken hata oluştu:', error.message);
    return null;
  }
}

/**
 * Yetkilendirme middleware'i
 * @param {Array<string>} requiredRoles - Gerekli roller
 * @returns {Function} - Express middleware fonksiyonu
 */
function authorize(requiredRoles = []) {
  return (req, res, next) => {
    try {
      // Token'ı al
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Yetkilendirme başarısız: Token bulunamadı'
        });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Token'ı doğrula
      const payload = verifyToken(token);
      
      if (!payload) {
        return res.status(401).json({
          success: false,
          error: 'Yetkilendirme başarısız: Geçersiz token'
        });
      }
      
      // Kullanıcı bilgilerini request'e ekle
      req.user = payload;
      
      // Rol kontrolü
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => 
          payload.roles && payload.roles.includes(role)
        );
        
        if (!hasRequiredRole) {
          return res.status(403).json({
            success: false,
            error: 'Yetkilendirme başarısız: Yetersiz yetki'
          });
        }
      }
      
      // Sonraki middleware'e geç
      next();
    } catch (error) {
      console.error('Yetkilendirme sırasında hata oluştu:', error);
      return res.status(500).json({
        success: false,
        error: 'Yetkilendirme sırasında bir hata oluştu'
      });
    }
  };
}

module.exports = {
  generateToken,
  verifyToken,
  authorize
};
