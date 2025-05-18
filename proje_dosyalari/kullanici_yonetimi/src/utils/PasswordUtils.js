// ALT_LAS Şifre Yardımcı Fonksiyonları

const crypto = require('crypto');
const util = require('util');

// Asenkron fonksiyonlar
const pbkdf2 = util.promisify(crypto.pbkdf2);
const randomBytes = util.promisify(crypto.randomBytes);

/**
 * Şifre hashleme ve doğrulama fonksiyonları
 */

/**
 * Şifreyi güvenli bir şekilde hashler
 * @param {string} password - Hashlenecek şifre
 * @returns {Promise<string>} - Hashlenmiş şifre
 */
async function hashPassword(password) {
  // Rastgele tuz oluştur
  const salt = await randomBytes(16);
  
  // Şifreyi hashle (PBKDF2 algoritması ile)
  const hash = await pbkdf2(password, salt, 10000, 64, 'sha512');
  
  // Tuz ve hash'i birleştir
  const combined = Buffer.concat([salt, hash]);
  
  // Base64 formatında döndür
  return combined.toString('base64');
}

/**
 * Şifreyi doğrular
 * @param {string} password - Doğrulanacak şifre
 * @param {string} hashedPassword - Hashlenmiş şifre
 * @returns {Promise<boolean>} - Şifre doğru ise true, değilse false
 */
async function verifyPassword(password, hashedPassword) {
  try {
    // Base64'ten buffer'a dönüştür
    const combined = Buffer.from(hashedPassword, 'base64');
    
    // Tuz ve hash'i ayır
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);
    
    // Şifreyi aynı tuz ile hashle
    const hash = await pbkdf2(password, salt, 10000, 64, 'sha512');
    
    // Hash'leri karşılaştır
    return crypto.timingSafeEqual(originalHash, hash);
  } catch (error) {
    console.error('Şifre doğrulanırken hata oluştu:', error);
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword
};
