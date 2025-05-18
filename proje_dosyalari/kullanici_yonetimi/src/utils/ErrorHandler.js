// ALT_LAS Hata Yönetimi ve Loglama

/**
 * Hata sınıfları ve loglama fonksiyonları
 */

// Loglama seviyeleri
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

// Loglama yapılandırması
const logConfig = {
  level: process.env.LOG_LEVEL || LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  filePath: './logs/alt_las.log'
};

/**
 * Temel hata sınıfı
 */
class AppError extends Error {
  /**
   * Hata nesnesini oluşturur
   * @param {string} message - Hata mesajı
   * @param {string} code - Hata kodu
   * @param {number} statusCode - HTTP durum kodu
   */
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    
    // Stack trace'i düzenle
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Hata nesnesini JSON formatına dönüştürür
   * @returns {Object} - JSON formatında hata
   */
  toJSON() {
    return {
      error: {
        name: this.name,
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Doğrulama hatası
 */
class ValidationError extends AppError {
  /**
   * Doğrulama hatası nesnesini oluşturur
   * @param {string} message - Hata mesajı
   * @param {Object} details - Doğrulama hatası detayları
   */
  constructor(message, details = {}) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
  
  /**
   * Hata nesnesini JSON formatına dönüştürür
   * @returns {Object} - JSON formatında hata
   */
  toJSON() {
    const json = super.toJSON();
    json.error.details = this.details;
    return json;
  }
}

/**
 * Yetkilendirme hatası
 */
class AuthorizationError extends AppError {
  /**
   * Yetkilendirme hatası nesnesini oluşturur
   * @param {string} message - Hata mesajı
   */
  constructor(message = 'Bu işlem için yetkiniz yok') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

/**
 * Kimlik doğrulama hatası
 */
class AuthenticationError extends AppError {
  /**
   * Kimlik doğrulama hatası nesnesini oluşturur
   * @param {string} message - Hata mesajı
   */
  constructor(message = 'Kimlik doğrulama başarısız') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Kaynak bulunamadı hatası
 */
class NotFoundError extends AppError {
  /**
   * Kaynak bulunamadı hatası nesnesini oluşturur
   * @param {string} resource - Kaynak adı
   * @param {string} id - Kaynak ID
   */
  constructor(resource, id) {
    super(`${resource} bulunamadı: ${id}`, 'NOT_FOUND', 404);
    this.resource = resource;
    this.resourceId = id;
  }
  
  /**
   * Hata nesnesini JSON formatına dönüştürür
   * @returns {Object} - JSON formatında hata
   */
  toJSON() {
    const json = super.toJSON();
    json.error.resource = this.resource;
    json.error.resourceId = this.resourceId;
    return json;
  }
}

/**
 * Çakışma hatası
 */
class ConflictError extends AppError {
  /**
   * Çakışma hatası nesnesini oluşturur
   * @param {string} message - Hata mesajı
   */
  constructor(message) {
    super(message, 'CONFLICT', 409);
  }
}

/**
 * Log mesajı oluşturur
 * @param {string} level - Log seviyesi
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 * @returns {Object} - Log nesnesi
 */
function createLogEntry(level, message, data = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };
}

/**
 * Log mesajını konsola yazar
 * @param {Object} logEntry - Log nesnesi
 */
function writeToConsole(logEntry) {
  const { timestamp, level, message } = logEntry;
  let consoleMethod;
  
  switch (level) {
    case LogLevel.DEBUG:
      consoleMethod = console.debug;
      break;
    case LogLevel.INFO:
      consoleMethod = console.info;
      break;
    case LogLevel.WARN:
      consoleMethod = console.warn;
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      consoleMethod = console.error;
      break;
    default:
      consoleMethod = console.log;
  }
  
  consoleMethod(`[${timestamp}] [${level}] ${message}`, logEntry.data);
}

/**
 * Log mesajını dosyaya yazar
 * @param {Object} logEntry - Log nesnesi
 */
function writeToFile(logEntry) {
  // Gerçek uygulamada dosyaya yazma işlemi burada yapılır
  // Bu örnek için sadece konsola bilgi yazılıyor
  console.info(`Log dosyaya yazılıyor: ${logConfig.filePath}`);
}

/**
 * Log mesajı oluşturur ve kaydeder
 * @param {string} level - Log seviyesi
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 */
function log(level, message, data = {}) {
  // Log seviyesi kontrolü
  const levels = Object.values(LogLevel);
  const configLevelIndex = levels.indexOf(logConfig.level);
  const messageLevelIndex = levels.indexOf(level);
  
  if (messageLevelIndex < configLevelIndex) {
    return;
  }
  
  const logEntry = createLogEntry(level, message, data);
  
  // Konsola yazma
  if (logConfig.enableConsole) {
    writeToConsole(logEntry);
  }
  
  // Dosyaya yazma
  if (logConfig.enableFile) {
    writeToFile(logEntry);
  }
}

/**
 * Debug seviyesinde log mesajı
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 */
function debug(message, data = {}) {
  log(LogLevel.DEBUG, message, data);
}

/**
 * Info seviyesinde log mesajı
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 */
function info(message, data = {}) {
  log(LogLevel.INFO, message, data);
}

/**
 * Warn seviyesinde log mesajı
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 */
function warn(message, data = {}) {
  log(LogLevel.WARN, message, data);
}

/**
 * Error seviyesinde log mesajı
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 */
function error(message, data = {}) {
  log(LogLevel.ERROR, message, data);
}

/**
 * Fatal seviyesinde log mesajı
 * @param {string} message - Log mesajı
 * @param {Object} data - Ek veri
 */
function fatal(message, data = {}) {
  log(LogLevel.FATAL, message, data);
}

/**
 * Hata yakalama middleware'i
 * @param {Function} fn - Asenkron route handler
 * @returns {Function} - Express middleware fonksiyonu
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Hata işleme middleware'i
 * @param {Error} err - Hata nesnesi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 */
function errorHandler(err, req, res, next) {
  // Hata logla
  error(`Hata oluştu: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  
  // AppError sınıfından türetilmiş hata mı?
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }
  
  // Diğer hatalar için genel yanıt
  return res.status(500).json({
    error: {
      name: 'InternalServerError',
      code: 'INTERNAL_ERROR',
      message: 'Sunucu hatası oluştu',
      statusCode: 500,
      timestamp: new Date()
    }
  });
}

// Loglama yapılandırmasını günceller
function updateLogConfig(config = {}) {
  Object.assign(logConfig, config);
}

module.exports = {
  // Hata sınıfları
  AppError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  
  // Loglama fonksiyonları
  LogLevel,
  debug,
  info,
  warn,
  error,
  fatal,
  updateLogConfig,
  
  // Middleware
  asyncHandler,
  errorHandler
};
