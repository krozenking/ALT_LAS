import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';
import logger from '../utils/logger'; // Import logger

// Rate limiter interface
interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  statusCode?: number;
  keyGenerator?: (req: Request) => string;
}

// In-memory store for rate limiting
const ipRequestCounts: Record<string, { count: number, resetTime: number }> = {};

// Rate limiter middleware
export const rateLimiter = (options: RateLimiterOptions) => {
  const {
    windowMs = 60 * 1000, // Default: 1 minute
    maxRequests = 100,    // Default: 100 requests per window
    message = 'İstek limiti aşıldı, lütfen daha sonra tekrar deneyin',
    statusCode = 429,
    keyGenerator = (req: Request) => req.ip || 'unknown'
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // İlk istek veya süresi dolmuş pencere için yeni kayıt oluştur
    if (!ipRequestCounts[key] || ipRequestCounts[key].resetTime < now) {
      ipRequestCounts[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      
      // Reset zamanını header olarak ekle
      res.setHeader('X-RateLimit-Reset', Math.floor(ipRequestCounts[key].resetTime / 1000));
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      
      return next();
    }
    
    // Mevcut pencere için istek sayısını artır
    ipRequestCounts[key].count += 1;
    
    // Kalan istek sayısını header olarak ekle
    const remaining = Math.max(0, maxRequests - ipRequestCounts[key].count);
    res.setHeader('X-RateLimit-Reset', Math.floor(ipRequestCounts[key].resetTime / 1000));
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    
    // Limit aşıldıysa hata döndür
    if (ipRequestCounts[key].count > maxRequests) {
      res.status(statusCode).json({
        message,
        retryAfter: Math.ceil((ipRequestCounts[key].resetTime - now) / 1000)
      });
      return; // End execution after sending response
    }
    
    next();
  };
};

// Temizleme fonksiyonu (belirli aralıklarla çağrılmalı)
export const cleanupRateLimiter = (): void => {
  const now = Date.now();
  let deletedCount = 0;
  
  Object.keys(ipRequestCounts).forEach(key => {
    if (ipRequestCounts[key].resetTime < now) {
      delete ipRequestCounts[key];
      deletedCount++;
    }
  });
  if (deletedCount > 0) {
    // logger.debug(`Rate limiter cleanup: Removed ${deletedCount} expired entries.`);
  }
};

// Otomatik temizleme interval'i
let cleanupInterval: NodeJS.Timeout | null = null;

// Sadece test ortamı dışında interval'i başlat
if (process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(cleanupRateLimiter, 5 * 60 * 1000); // 5 dakikada bir
  logger.info(`Rate limiter cleanup interval started (every ${5 * 60 * 1000}ms).`);
}

// Interval'i temizlemek için fonksiyon
export const cleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Rate limiter cleanup interval stopped.');
  }
};

// Graceful shutdown (sadece test ortamı dışında)
if (process.env.NODE_ENV !== 'test') {
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
}

