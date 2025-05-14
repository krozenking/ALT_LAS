/**
 * Rate Limiter Middleware
 * 
 * Bu middleware, API Gateway'e gelen istekleri sınırlandırmak için kullanılır.
 * Basit bir bellek tabanlı rate limiter implementasyonu sunar.
 * Üretim ortamında Redis gibi bir çözüm kullanılması önerilir.
 */

// Basit bellek tabanlı depolama
const requestCounts = {};

/**
 * Rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - Zaman penceresi (milisaniye)
 * @param {number} options.maxRequests - Zaman penceresi içinde izin verilen maksimum istek sayısı
 * @param {string} options.keyGenerator - İstek için benzersiz anahtar oluşturan fonksiyon
 * @param {boolean} options.headers - Rate limit başlıklarını ekleyip eklememe
 * @returns {Function} Express middleware
 */
const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // Varsayılan: 1 dakika
    maxRequests = 100, // Varsayılan: dakikada 100 istek
    keyGenerator = (req) => req.ip, // Varsayılan: IP adresine göre
    headers = true // Varsayılan: başlıkları ekle
  } = options;

  // Eski kayıtları temizle
  setInterval(() => {
    const now = Date.now();
    Object.keys(requestCounts).forEach(key => {
      if (now - requestCounts[key].timestamp > windowMs) {
        delete requestCounts[key];
      }
    });
  }, windowMs);

  // Middleware fonksiyonu
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // İlk istek için kaydı oluştur
    if (!requestCounts[key]) {
      requestCounts[key] = {
        count: 1,
        timestamp: now
      };
    } else {
      // Zaman penceresi dışındaysa sıfırla
      if (now - requestCounts[key].timestamp > windowMs) {
        requestCounts[key] = {
          count: 1,
          timestamp: now
        };
      } else {
        // İstek sayısını artır
        requestCounts[key].count++;
      }
    }
    
    // Kalan istek sayısını hesapla
    const requestsRemaining = Math.max(0, maxRequests - requestCounts[key].count);
    
    // Başlıkları ekle
    if (headers) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', requestsRemaining);
      res.setHeader('X-RateLimit-Reset', new Date(requestCounts[key].timestamp + windowMs).getTime());
    }
    
    // Limit aşıldıysa hata döndür
    if (requestCounts[key].count > maxRequests) {
      return res.status(429).json({
        message: 'Rate limit exceeded',
        error: 'Too many requests, please try again later'
      });
    }
    
    next();
  };
};

module.exports = rateLimiter;
