/**
 * Authentication Middleware
 * 
 * Bu middleware, JWT token doğrulama işlemlerini gerçekleştirir.
 */

const authService = require('../services/authService');

/**
 * JWT token doğrulama middleware'i
 * @returns {Function} Express middleware
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authorization format' });
  }
  
  const token = parts[1];
  
  try {
    // Token doğrulama
    const payload = authService.verifyToken(token);
    
    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = authenticateJWT;
