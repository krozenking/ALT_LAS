import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import logger, { httpLogger } from '../utils/logger';

// HTTP istek loglama middleware'i
export const requestLogger = morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
});

// Özel response time middleware'i
export const responseTime = (req: Request, res: Response, next: NextFunction): void => {
  const startHrTime = process.hrtime();
  
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1000000;
    
    res.responseTime = elapsedTimeInMs;
    httpLogger.request(req, res);
  });
  
  next();
};

// Extend Express Response interface for custom property
declare global {
  namespace Express {
    interface Response {
      responseTime?: number;
    }
  }
}

// Güvenlik başlıkları middleware'i (helmet alternatifi)
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Temel güvenlik başlıkları
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Referrer-Policy', 'no-referrer');
  
  next();
};
