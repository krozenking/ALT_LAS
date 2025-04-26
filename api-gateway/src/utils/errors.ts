// Error sınıfları
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Geçersiz istek') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Yetkilendirme hatası') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Erişim reddedildi') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Kaynak bulunamadı') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Kaynak çakışması') {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Sunucu hatası') {
    super(message, 500);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Servis kullanılamıyor') {
    super(message, 503);
  }
}

// Hata işleme yardımcı fonksiyonları
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

export const handleError = (error: Error): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  // Bilinmeyen hatalar için varsayılan olarak 500 döndür
  return new InternalServerError(error.message);
};
