import winston from 'winston';
import 'winston-daily-rotate-file'; // Import the daily rotate file transport

// Winston logger yapılandırması
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-gateway' },
  transports: [
    // Konsola log yazdırma
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''}`;
        })
      )
    }),
    // Dosyaya log yazdırma (production ortamında) - Günlük rotasyon ile
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
      })
    ] : [])
  ]
});

// HTTP istekleri için özel logger
export const httpLogger = {
  log: (message: string, meta?: any) => logger.info(message, meta),
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  request: (req: any, res: any) => {
    const { method, url, ip } = req;
    const userAgent = req.headers['user-agent'] || '';
    const contentLength = res.getHeader('content-length') || 0;
    const responseTime = res.responseTime || 0;
    
    logger.info(`HTTP ${method} ${url}`, {
      ip,
      userAgent,
      statusCode: res.statusCode,
      contentLength,
      responseTime: `${responseTime}ms`
    });
  }
};

export default logger;

