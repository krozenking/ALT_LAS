import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AppError, handleError } from "../utils/errors";
import { criticalErrorCounter, errorRateGauge } from "../utils/monitoring"; // Import the counter and gauge

// Hata türleri
export enum ErrorTypes {
  VALIDATION_ERROR = 'ValidationError',
  AUTHENTICATION_ERROR = 'AuthenticationError',
  AUTHORIZATION_ERROR = 'AuthorizationError',
  NOT_FOUND_ERROR = 'NotFoundError',
  RATE_LIMIT_ERROR = 'RateLimitError',
  SERVICE_UNAVAILABLE_ERROR = 'ServiceUnavailableError',
  TIMEOUT_ERROR = 'TimeoutError',
  INTERNAL_SERVER_ERROR = 'InternalServerError',
  BAD_REQUEST_ERROR = 'BadRequestError',
  CIRCUIT_BREAKER_ERROR = 'CircuitBreakerError',
  DATABASE_ERROR = 'DatabaseError',
  NETWORK_ERROR = 'NetworkError'
}

// Hata türünü belirle
const determineErrorType = (err: Error | AppError): string => {
  if ('name' in err) {
    switch (err.name) {
      case 'ValidationError':
        return ErrorTypes.VALIDATION_ERROR;
      case 'JsonWebTokenError':
      case 'TokenExpiredError':
        return ErrorTypes.AUTHENTICATION_ERROR;
      case 'ForbiddenError':
        return ErrorTypes.AUTHORIZATION_ERROR;
      case 'NotFoundError':
        return ErrorTypes.NOT_FOUND_ERROR;
      case 'RateLimitError':
        return ErrorTypes.RATE_LIMIT_ERROR;
      case 'ServiceUnavailableError':
        return ErrorTypes.SERVICE_UNAVAILABLE_ERROR;
      case 'TimeoutError':
        return ErrorTypes.TIMEOUT_ERROR;
      case 'CircuitBreakerError':
        return ErrorTypes.CIRCUIT_BREAKER_ERROR;
      case 'DatabaseError':
        return ErrorTypes.DATABASE_ERROR;
      case 'NetworkError':
        return ErrorTypes.NETWORK_ERROR;
      default:
        if (err.message.includes('validation')) return ErrorTypes.VALIDATION_ERROR;
        if (err.message.includes('auth')) return ErrorTypes.AUTHENTICATION_ERROR;
        if (err.message.includes('permission')) return ErrorTypes.AUTHORIZATION_ERROR;
        if (err.message.includes('not found')) return ErrorTypes.NOT_FOUND_ERROR;
        if (err.message.includes('rate limit')) return ErrorTypes.RATE_LIMIT_ERROR;
        if (err.message.includes('unavailable')) return ErrorTypes.SERVICE_UNAVAILABLE_ERROR;
        if (err.message.includes('timeout')) return ErrorTypes.TIMEOUT_ERROR;
        if (err.message.includes('circuit')) return ErrorTypes.CIRCUIT_BREAKER_ERROR;
        if (err.message.includes('database')) return ErrorTypes.DATABASE_ERROR;
        if (err.message.includes('network')) return ErrorTypes.NETWORK_ERROR;
        return ErrorTypes.INTERNAL_SERVER_ERROR;
    }
  }
  return ErrorTypes.INTERNAL_SERVER_ERROR;
};

// Global hata işleme middleware'i
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appError = handleError(err);
  const errorType = determineErrorType(appError);

  // Hata metriklerini güncelle
  const routePath = req.route?.path || req.path || 'unknown';
  const method = req.method || 'unknown';

  // Hata sayacını artır
  criticalErrorCounter.labels(errorType, routePath).inc();

  // Hata oranını güncelle
  errorRateGauge.labels(errorType, routePath, method).inc();

  // Hata logla
  const logData = {
    errorType,
    error: {
      name: appError.name,
      message: appError.message,
      statusCode: appError.statusCode
    },
    request: {
      id: req.id, // Eğer request ID middleware'i kullanılıyorsa
      path: routePath,
      method: method,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown'
    },
    user: req.user ? { id: req.user.id } : undefined,
    timestamp: new Date().toISOString()
  };

  if (appError.statusCode >= 500) {
    logger.error("Sunucu hatası", {
      ...logData,
      stack: appError.stack
    });

    // Kritik hatalar için ek işlemler
    if (process.env.NODE_ENV === 'production') {
      // Üretim ortamında kritik hataları bildirim sistemine gönder
      // notificationService.sendAlert(appError);
    }
  } else {
    logger.warn('İstek hatası', logData);
  }

  // Yanıt gönder
  const response = {
    success: false,
    error: {
      type: errorType,
      message: appError.message,
      code: appError.statusCode
    },
    requestId: req.id // Eğer request ID middleware'i kullanılıyorsa
  };

  // Geliştirme ortamında ek hata bilgileri ekle
  if (process.env.NODE_ENV === 'development') {
    response.error['stack'] = appError.stack;
    response.error['details'] = appError.details || undefined;
  }

  res.status(appError.statusCode).json(response);

  // Hata sonrası temizlik işlemleri
  if (appError.cleanup && typeof appError.cleanup === 'function') {
    appError.cleanup();
  }
};

// 404 hata yakalama middleware'i
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const message = `${req.method} ${req.path} bulunamadı`;

  // 404 hatalarını logla
  logger.warn('Endpoint bulunamadı', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString()
  });

  // 404 metriğini güncelle
  criticalErrorCounter.labels(ErrorTypes.NOT_FOUND_ERROR, req.path).inc();

  // Yanıt gönder
  res.status(404).json({
    success: false,
    error: {
      type: ErrorTypes.NOT_FOUND_ERROR,
      message: message,
      code: 404
    },
    requestId: req.id // Eğer request ID middleware'i kullanılıyorsa
  });
};

// Async hata yakalama yardımcısı
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next))
      .catch(error => {
        // Zaman aşımı hatalarını özel olarak işle
        if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
          const timeoutError = new Error(`İşlem zaman aşımına uğradı: ${req.method} ${req.path}`);
          timeoutError.name = ErrorTypes.TIMEOUT_ERROR;
          next(timeoutError);
        } else {
          next(error);
        }
      });
  };
};

// Zaman aşımı kontrolü ile async handler
export const timeoutHandler = (fn: Function, timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Zaman aşımı promise'ı
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const timeoutError = new Error(`İşlem ${timeoutMs}ms içinde tamamlanamadı: ${req.method} ${req.path}`);
        timeoutError.name = ErrorTypes.TIMEOUT_ERROR;
        reject(timeoutError);
      }, timeoutMs);
    });

    // Asıl işlem promise'ı
    const functionPromise = Promise.resolve(fn(req, res, next));

    // İlk tamamlanan promise'ı kullan (race)
    Promise.race([functionPromise, timeoutPromise])
      .catch(next);
  };
};

// Retry mekanizması ile async handler
export const retryHandler = (fn: Function, maxRetries: number = 3, delayMs: number = 1000) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await fn(req, res, next);
        return; // Başarılı olursa döngüden çık
      } catch (error) {
        lastError = error;

        // Son deneme değilse ve yeniden denenebilir bir hata ise
        if (attempt < maxRetries && isRetryableError(error)) {
          // Exponential backoff ile bekle
          const delay = delayMs * Math.pow(2, attempt - 1);
          logger.warn(`İşlem başarısız oldu, ${delay}ms sonra yeniden deneniyor (${attempt}/${maxRetries})`, {
            path: req.path,
            method: req.method,
            error: error.message
          });

          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break; // Yeniden denenmeyecek hata veya son deneme
        }
      }
    }

    // Tüm denemeler başarısız oldu
    next(lastError);
  };
};

// Yeniden denenebilir hataları belirle
const isRetryableError = (error: Error): boolean => {
  // Network hataları, geçici servis kesintileri vb. yeniden denenebilir
  const retryableErrors = [
    ErrorTypes.NETWORK_ERROR,
    ErrorTypes.SERVICE_UNAVAILABLE_ERROR,
    ErrorTypes.TIMEOUT_ERROR
  ];

  // Hata türüne göre kontrol
  if (error.name && retryableErrors.includes(error.name as ErrorTypes)) {
    return true;
  }

  // Hata mesajına göre kontrol
  const retryableMessages = [
    'network', 'connection', 'timeout', 'unavailable',
    'ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND',
    '429', '503', '504'
  ];

  return retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
};
