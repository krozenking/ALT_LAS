import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { AppError, handleError } from "../utils/errors";
import { criticalErrorCounter } from "../utils/monitoring"; // Import the counter

// Global hata işleme middleware'i
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appError = handleError(err);
  
  // Hata logla
  if (appError.statusCode >= 500) {
    // Increment critical error counter for 5xx errors
    criticalErrorCounter.labels(appError.name || "UnknownError", req.route?.path || req.path).inc();

    logger.error("Sunucu hatası", {
      error: appError,
      stack: appError.stack,
      path: req.path,
      method: req.method
    });
  } else {
    logger.warn('İstek hatası', {
      error: appError,
      path: req.path,
      method: req.method
    });
  }
  
  // Yanıt gönder
  res.status(appError.statusCode).json({
    message: appError.message,
    error: process.env.NODE_ENV === 'development' ? appError.stack : undefined
  });
};

// 404 hata yakalama middleware'i
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const message = `${req.method} ${req.path} bulunamadı`;
  logger.warn(message);
  res.status(404).json({ message });
};

// Async hata yakalama yardımcısı
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
