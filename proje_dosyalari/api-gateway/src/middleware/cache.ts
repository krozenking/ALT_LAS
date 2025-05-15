import { Request, Response, NextFunction } from "express";
import redisClient from "../utils/redisClient"; // Import the potentially null Redis client
import logger from "../utils/logger";

interface CacheOptions {
  duration: number;
  keyPrefix?: string;
  ignoreQueryParams?: boolean;
  varyByUser?: boolean;
  statusCodes?: number[];
}

const cacheMiddleware = (options: number | CacheOptions) => {
  // Eski API uyumluluğu için number tipini destekle
  const opts: CacheOptions = typeof options === 'number'
    ? { duration: options }
    : options;

  // Varsayılan değerleri ayarla
  const {
    duration,
    keyPrefix = "__express__",
    ignoreQueryParams = false,
    varyByUser = false,
    statusCodes = [200]
  } = opts;

  return async (req: Request, res: Response, next: NextFunction) => {
    // If Redis client is not available (e.g., in test env), skip caching
    if (!redisClient) {
      logger.debug("Redis client not available, skipping cache middleware.");
      return next();
    }

    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Cache key oluşturma
    let url = req.originalUrl || req.url;

    // Query parametrelerini yoksay
    if (ignoreQueryParams && url.includes('?')) {
      url = url.split('?')[0];
    }

    // Kullanıcıya göre değişken cache
    const userPart = varyByUser && req.user?.id ? `:user:${req.user.id}` : '';

    // Final cache key
    const key = `${keyPrefix}:${url}${userPart}`;

    let cachedBody: string | null = null; // Explicitly type as string | null

    try {
      // Check Redis status before attempting to get from cache
      // Ensure redisClient is not null before accessing status
      if (redisClient.status !== "ready") {
        logger.warn("Redis not ready, skipping cache GET.");
        return next();
      }

      // Ensure redisClient is not null before calling get
      cachedBody = await redisClient.get(key);

      // Cache hit istatistiği (opsiyonel)
      if (cachedBody) {
        await redisClient.hincrby('cache:stats', 'hits', 1).catch(() => {});
      } else {
        await redisClient.hincrby('cache:stats', 'misses', 1).catch(() => {});
      }
    } catch (err: any) { // Add type for err
      logger.error(`Redis GET error for key ${key}:`, err);
      // If Redis fails, proceed without caching
      return next();
    }

    if (cachedBody) {
      // Cache hit
      try {
        // Cache metadata
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Cache-Key", key);

        // Content-Type ve diğer metadata'yı ayrı bir key'de saklama (gelişmiş)
        let contentType = "application/json"; // Varsayılan
        let cacheMetadata = null;

        try {
          // Metadata'yı kontrol et (opsiyonel)
          cacheMetadata = await redisClient.get(`${key}:meta`).catch(() => null);
          if (cacheMetadata) {
            const meta = JSON.parse(cacheMetadata);
            if (meta.contentType) {
              contentType = meta.contentType;
            }
            // Diğer header'ları da ekleyebiliriz
            if (meta.headers) {
              Object.entries(meta.headers).forEach(([name, value]) => {
                if (typeof value === 'string') {
                  res.setHeader(name, value);
                }
              });
            }
          }
        } catch (metaError) {
          logger.warn(`Error parsing cache metadata for ${key}:`, metaError);
          // Metadata hatası kritik değil, devam et
        }

        // Content-Type'ı ayarla
        res.setHeader("Content-Type", contentType);

        // İçeriği gönder
        if (contentType.includes('application/json')) {
          try {
            res.send(JSON.parse(cachedBody));
          } catch (parseError) {
            // JSON parse hatası - düz metin olarak gönder
            res.setHeader("Content-Type", "text/plain");
            res.send(cachedBody);
          }
        } else {
          // JSON olmayan içerik
          res.send(cachedBody);
        }
      } catch (e: any) {
        logger.error("Error sending cached response:", e);
        if (!res.headersSent) {
          res.status(500).json({
            error: "Cache Error",
            message: "Error retrieving cached response"
          });
        }
      }
      return; // Cache hit durumunda işlemi sonlandır
    } else {
      // Cache miss
      res.setHeader("X-Cache", "MISS");
      res.setHeader("X-Cache-Key", key);

      // Orijinal send metodunu kaydet
      const originalSend = res.send.bind(res);

      // Send metodunu override et
      res.send = (body?: any): Response => {
        // Cache'leme koşullarını kontrol et
        if (
          redisClient &&
          body != null &&
          statusCodes.includes(res.statusCode)
        ) {
          try {
            // Cache için body hazırla
            const bodyToCache = (typeof body === "string") ? body : JSON.stringify(body);

            // Multi komut ile atomik işlem
            const pipeline = redisClient.pipeline();

            // Ana içeriği cache'le
            pipeline.set(key, bodyToCache, 'EX', duration);

            // Metadata'yı da cache'le (opsiyonel)
            const metadata = {
              contentType: res.getHeader('Content-Type') || 'application/json',
              timestamp: Date.now(),
              statusCode: res.statusCode,
              headers: {
                // Önemli header'ları sakla
                'ETag': res.getHeader('ETag'),
                'Last-Modified': res.getHeader('Last-Modified')
              }
            };

            pipeline.set(`${key}:meta`, JSON.stringify(metadata), 'EX', duration);

            // Pipeline'ı çalıştır
            pipeline.exec()
              .then(() => {
                // logger.debug(`Cached response for ${key} (${duration}s)`);
              })
              .catch(err => {
                logger.error(`Redis cache pipeline error for ${key}:`, err);
              });
          } catch (err: any) {
            logger.error(`Error preparing cache for ${key}:`, err);
          }
        }

        // Orijinal send metodunu çağır
        return originalSend.call(res, body);
      };

      next();
    }
  };
};

export default cacheMiddleware;

