import winston from 'winston';
import 'winston-daily-rotate-file'; // Import the daily rotate file transport
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

// Log seviyeleri
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  DEBUG = 'debug',
  TRACE = 'trace'
}

// Log kategorileri
export enum LogCategory {
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  DATABASE = 'DATABASE',
  API = 'API',
  CACHE = 'CACHE',
  PROXY = 'PROXY',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SYSTEM = 'SYSTEM',
  BUSINESS = 'BUSINESS'
}

// Özel format oluşturucular
const customFormats = {
  // Timestamp formatı
  timestamp: winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),

  // Hata yığını formatı
  errors: winston.format.errors({ stack: true }),

  // Metadata formatı
  metadata: winston.format((info) => {
    // Standart metadata ekle
    info.hostname = os.hostname();
    info.pid = process.pid;
    info.node_version = process.version;
    info.platform = process.platform;

    // Eğer log ID yoksa ekle
    if (!info.log_id) {
      info.log_id = uuidv4();
    }

    // Eğer kategori yoksa varsayılan kategori ekle
    if (!info.category) {
      info.category = LogCategory.SYSTEM;
    }

    return info;
  })(),

  // Konsol formatı
  console: winston.format.printf(({ level, message, timestamp, category, log_id, ...metadata }) => {
    const metaStr = Object.keys(metadata).length
      ? `\n${JSON.stringify(metadata, null, 2)}`
      : '';

    return `${timestamp} [${log_id}] ${level.toUpperCase()} [${category}]: ${message}${metaStr}`;
  })
};

// Winston logger yapılandırması
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || LogLevel.INFO,
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
    trace: 5
  },
  format: winston.format.combine(
    customFormats.timestamp,
    customFormats.errors,
    customFormats.metadata,
    winston.format.json()
  ),
  defaultMeta: {
    service: 'api-gateway',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || 'unknown'
  },
  transports: [
    // Konsola log yazdırma
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormats.console
      )
    }),
    // Dosyaya log yazdırma (production ortamında) - Günlük rotasyon ile
    ...(process.env.NODE_ENV === 'production' ? [
      // Hata logları
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        level: LogLevel.ERROR,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      }),
      // Uyarı logları
      new winston.transports.DailyRotateFile({
        filename: 'logs/warn-%DATE%.log',
        level: LogLevel.WARN,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      }),
      // Tüm loglar
      new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d'
      })
    ] : [])
  ],
  // Hata durumunda çökmeyi engelle
  exitOnError: false
});

// Gelişmiş logger arayüzü
interface ILogger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  http(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  trace(message: string, meta?: any): void;

  // Kategori bazlı loglama
  security(level: LogLevel, message: string, meta?: any): void;
  performance(level: LogLevel, message: string, meta?: any): void;
  database(level: LogLevel, message: string, meta?: any): void;
  api(level: LogLevel, message: string, meta?: any): void;
  cache(level: LogLevel, message: string, meta?: any): void;
  proxy(level: LogLevel, message: string, meta?: any): void;
  circuitBreaker(level: LogLevel, message: string, meta?: any): void;
  authentication(level: LogLevel, message: string, meta?: any): void;
  authorization(level: LogLevel, message: string, meta?: any): void;
  validation(level: LogLevel, message: string, meta?: any): void;
  system(level: LogLevel, message: string, meta?: any): void;
  business(level: LogLevel, message: string, meta?: any): void;
}

// Gelişmiş logger implementasyonu
const advancedLogger: ILogger = {
  // Temel log seviyeleri
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  trace: (message: string, meta?: any) => logger.log('trace', message, meta),

  // Kategori bazlı loglama
  security: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.SECURITY }),

  performance: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.PERFORMANCE }),

  database: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.DATABASE }),

  api: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.API }),

  cache: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.CACHE }),

  proxy: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.PROXY }),

  circuitBreaker: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.CIRCUIT_BREAKER }),

  authentication: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.AUTHENTICATION }),

  authorization: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.AUTHORIZATION }),

  validation: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.VALIDATION }),

  system: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.SYSTEM }),

  business: (level: LogLevel, message: string, meta?: any) =>
    logger.log(level, message, { ...meta, category: LogCategory.BUSINESS })
};

// HTTP istekleri için özel logger
export const httpLogger = {
  log: (message: string, meta?: any) => advancedLogger.http(message, meta),
  error: (message: string, meta?: any) => advancedLogger.error(message, meta),
  warn: (message: string, meta?: any) => advancedLogger.warn(message, meta),
  info: (message: string, meta?: any) => advancedLogger.info(message, meta),
  debug: (message: string, meta?: any) => advancedLogger.debug(message, meta),
  trace: (message: string, meta?: any) => advancedLogger.trace(message, meta),

  request: (req: any, res: any) => {
    const { method, url, ip, id: requestId, route, user } = req;
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const contentLength = res.getHeader('content-length') || 0;
    const responseTime = res.responseTime || 0;
    const statusCode = res.statusCode;

    // Log seviyesini belirle
    let level = LogLevel.HTTP;
    if (statusCode >= 500) level = LogLevel.ERROR;
    else if (statusCode >= 400) level = LogLevel.WARN;

    // Rota bilgisini normalize et
    const routePath = route?.path || url;

    // Log mesajını oluştur
    const message = `HTTP ${method} ${routePath} ${statusCode} ${responseTime}ms`;

    // Metadata oluştur
    const meta = {
      request: {
        id: requestId,
        method,
        url,
        route: routePath,
        ip,
        userAgent,
        referer,
        user: user ? { id: user.id } : undefined
      },
      response: {
        statusCode,
        contentLength,
        responseTime: `${responseTime}ms`
      },
      timestamp: new Date().toISOString()
    };

    // API kategorisinde logla
    advancedLogger.api(level, message, meta);
  }
};

export default advancedLogger;

