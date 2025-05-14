import { Router, Request, Response, NextFunction } from 'express'; // Added Request, Response, NextFunction
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireResourcePermission } from '../services/authorizationService';
import logger from '../utils/logger';
import Redis from 'ioredis';

// Redis istemcisi
const redisClient = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined
    });

// Redis bağlantı durumunu kontrol et
redisClient.on('connect', () => {
  logger.info('Redis bağlantısı başarılı');
});

redisClient.on('error', (err) => {
  logger.error(`Redis bağlantı hatası: ${err}`);
});

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cache
 *   description: Önbellek yönetimi API'leri
 */

// Kimlik doğrulama gerekli
router.use(authenticateJWT);

/**
 * @swagger
 * /api/cache/{key}:
 *   get:
 *     summary: Önbellekten veri getirir
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Veri başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Veri bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:key', 
  requireResourcePermission('cache', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const key = req.params.key;
    
    logger.debug(`Önbellekten veri getiriliyor: ${key}`);
    const data = await redisClient.get(key);
    
    if (!data) {
      return res.status(404).json({ message: 'Veri bulunamadı' });
    }
    
    try {
      // JSON olarak parse etmeyi dene
      const parsedData = JSON.parse(data);
      res.json(parsedData);
    } catch (error) {
      // JSON değilse string olarak döndür
      res.json({ value: data });
    }
  })
);

/**
 * @swagger
 * /api/cache/{key}:
 *   put:
 *     summary: Önbelleğe veri kaydeder
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: object
 *               ttl:
 *                 type: integer
 *                 description: Saniye cinsinden yaşam süresi (opsiyonel)
 *             required:
 *               - value
 *     responses:
 *       200:
 *         description: Veri başarıyla kaydedildi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:key', 
  requireResourcePermission('cache', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const key = req.params.key;
    const { value, ttl } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'value alanı gereklidir' });
    }
    
    // Değeri string'e dönüştür
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    logger.debug(`Önbelleğe veri kaydediliyor: ${key}`);
    
    if (ttl) {
      await redisClient.set(key, stringValue, 'EX', ttl);
    } else {
      await redisClient.set(key, stringValue);
    }
    
    res.json({ 
      message: 'Veri başarıyla kaydedildi',
      key,
      ttl: ttl || null
    });
  })
);

/**
 * @swagger
 * /api/cache/{key}:
 *   delete:
 *     summary: Önbellekten veri siler
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Veri başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:key', 
  requireResourcePermission('cache', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const key = req.params.key;
    
    logger.debug(`Önbellekten veri siliniyor: ${key}`);
    const count = await redisClient.del(key);
    
    res.json({ 
      message: count > 0 ? 'Veri başarıyla silindi' : 'Silinecek veri bulunamadı',
      deleted: count > 0
    });
  })
);

/**
 * @swagger
 * /api/cache/{key}/ttl:
 *   get:
 *     summary: Önbellekteki verinin yaşam süresini getirir
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TTL başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Veri bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:key/ttl', 
  requireResourcePermission('cache', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const key = req.params.key;
    
    logger.debug(`Önbellekteki verinin TTL'i getiriliyor: ${key}`);
    const ttl = await redisClient.ttl(key);
    
    if (ttl === -2) {
      return res.status(404).json({ message: 'Veri bulunamadı' });
    }
    
    res.json({ 
      key,
      ttl: ttl === -1 ? null : ttl // -1: süresiz, -2: yok
    });
  })
);

/**
 * @swagger
 * /api/cache/{key}/ttl:
 *   put:
 *     summary: Önbellekteki verinin yaşam süresini günceller
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ttl:
 *                 type: integer
 *                 description: Saniye cinsinden yaşam süresi
 *             required:
 *               - ttl
 *     responses:
 *       200:
 *         description: TTL başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Veri bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:key/ttl', 
  requireResourcePermission('cache', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const key = req.params.key;
    const { ttl } = req.body;
    
    if (ttl === undefined || !Number.isInteger(ttl) || ttl < 0) {
      return res.status(400).json({ message: 'Geçerli bir ttl değeri gereklidir' });
    }
    
    logger.debug(`Önbellekteki verinin TTL'i güncelleniyor: ${key}`);
    
    // Önce anahtarın var olup olmadığını kontrol et
    const exists = await redisClient.exists(key);
    if (exists === 0) {
      return res.status(404).json({ message: 'Veri bulunamadı' });
    }
    
    // TTL'i güncelle
    const result = await redisClient.expire(key, ttl);
    
    res.json({ 
      message: 'TTL başarıyla güncellendi',
      key,
      ttl,
      updated: result === 1
    });
  })
);

/**
 * @swagger
 * /api/cache/keys/{pattern}:
 *   get:
 *     summary: Belirli bir desene uyan anahtarları listeler
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: pattern
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Anahtarlar başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/keys/:pattern', 
  requireResourcePermission('cache', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const pattern = req.params.pattern;
    
    logger.debug(`Önbellekteki anahtarlar listeleniyor: ${pattern}`);
    const keys = await redisClient.keys(pattern);
    
    res.json({ 
      pattern,
      count: keys.length,
      keys
    });
  })
);

/**
 * @swagger
 * /api/cache/flush:
 *   post:
 *     summary: Tüm önbelleği temizler (Admin)
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Önbellek başarıyla temizlendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/flush', 
  requireResourcePermission('cache', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    logger.warn(`Önbellek temizleniyor (${req.user?.username} tarafından)`);
    await redisClient.flushall();
    
    res.json({ 
      message: 'Önbellek başarıyla temizlendi'
    });
  })
);

export default router;

