import { Router, Request, Response, NextFunction } from 'express'; // Added Request, Response, NextFunction
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireResourcePermission } from '../services/authorizationService';
import logger from '../utils/logger';
import compression from 'compression';
import redisClient from '../utils/redisClient';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: API
 *   description: API versiyonlama ve yönetim işlemleri
 */

// Sıkıştırma middleware'i
router.use(compression());

// Kimlik doğrulama gerekli
router.use(authenticateJWT);

/**
 * @swagger
 * /api/versions:
 *   get:
 *     summary: Desteklenen API versiyonlarını listeler
 *     tags: [API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API versiyonları başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/versions', 
  asyncHandler(async (req: Request, res: Response) => { // Added types
    // Önbellekten kontrol et
    const cacheKey = 'api:versions';
    const cachedVersions = await redisClient.get(cacheKey);
    
    if (cachedVersions) {
      return res.json(JSON.parse(cachedVersions));
    }
    
    // API versiyonları
    const versions = [
      {
        version: 'v1',
        status: 'stable',
        releaseDate: '2025-01-01',
        endOfLife: null,
        description: 'İlk kararlı API sürümü'
      },
      {
        version: 'v2',
        status: 'beta',
        releaseDate: '2025-04-15',
        endOfLife: null,
        description: 'Gelişmiş özellikler ve performans iyileştirmeleri'
      }
    ];
    
    // Önbelleğe kaydet (1 saat)
    await redisClient.set(cacheKey, JSON.stringify(versions), 'EX', 3600);
    
    res.json(versions);
  })
);

/**
 * @swagger
 * /api/versions/current:
 *   get:
 *     summary: Mevcut API versiyonu bilgisini getirir
 *     tags: [API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API versiyon bilgisi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/versions/current', 
  asyncHandler(async (req: Request, res: Response) => { // Added types
    // Önbellekten kontrol et
    const cacheKey = 'api:versions:current';
    const cachedVersion = await redisClient.get(cacheKey);
    
    if (cachedVersion) {
      return res.json(JSON.parse(cachedVersion));
    }
    
    // Mevcut API versiyonu
    const currentVersion = {
      version: 'v1',
      status: 'stable',
      releaseDate: '2025-01-01',
      endOfLife: null,
      description: 'İlk kararlı API sürümü',
      features: [
        'Kimlik doğrulama ve yetkilendirme',
        'Komut işleme',
        'Dosya yönetimi',
        'Servis entegrasyonu'
      ]
    };
    
    // Önbelleğe kaydet (1 saat)
    await redisClient.set(cacheKey, JSON.stringify(currentVersion), 'EX', 3600);
    
    res.json(currentVersion);
  })
);

/**
 * @swagger
 * /api/versions/{version}/endpoints:
 *   get:
 *     summary: Belirli bir API versiyonunun endpoint'lerini listeler
 *     tags: [API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: version
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API endpoint'leri başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: API versiyonu bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/versions/:version/endpoints', 
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const version = req.params.version;
    
    // Geçerli versiyonları kontrol et
    if (!['v1', 'v2'].includes(version)) {
      return res.status(404).json({ message: 'API versiyonu bulunamadı' });
    }
    
    // Önbellekten kontrol et
    const cacheKey = `api:versions:${version}:endpoints`;
    const cachedEndpoints = await redisClient.get(cacheKey);
    
    if (cachedEndpoints) {
      return res.json(JSON.parse(cachedEndpoints));
    }
    
    // Endpoint'leri getir
    let endpoints;
    
    if (version === 'v1') {
      endpoints = [
        {
          path: '/api/auth',
          methods: ['GET', 'POST'],
          description: 'Kimlik doğrulama işlemleri'
        },
        {
          path: '/api/commands',
          methods: ['GET', 'POST', 'DELETE'],
          description: 'Komut işleme'
        },
        {
          path: '/api/files',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'Dosya yönetimi'
        },
        {
          path: '/api/services',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'Servis keşif ve yönetimi'
        },
        {
          path: '/api/health',
          methods: ['GET'],
          description: 'Sağlık kontrolü'
        },
        {
          path: '/api/cache',
          methods: ['GET', 'PUT', 'DELETE'],
          description: 'Önbellek yönetimi'
        }
      ];
    } else if (version === 'v2') {
      endpoints = [
        {
          path: '/api/v2/auth',
          methods: ['GET', 'POST'],
          description: 'Gelişmiş kimlik doğrulama işlemleri'
        },
        {
          path: '/api/v2/commands',
          methods: ['GET', 'POST', 'DELETE', 'PATCH'],
          description: 'Gelişmiş komut işleme'
        },
        {
          path: '/api/v2/files',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          description: 'Gelişmiş dosya yönetimi'
        },
        {
          path: '/api/v2/services',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          description: 'Gelişmiş servis keşif ve yönetimi'
        },
        {
          path: '/api/v2/health',
          methods: ['GET'],
          description: 'Gelişmiş sağlık kontrolü'
        },
        {
          path: '/api/v2/cache',
          methods: ['GET', 'PUT', 'DELETE'],
          description: 'Gelişmiş önbellek yönetimi'
        },
        {
          path: '/api/v2/analytics',
          methods: ['GET'],
          description: 'API kullanım analitikleri'
        },
        {
          path: '/api/v2/websocket',
          methods: ['GET'],
          description: 'WebSocket desteği'
        }
      ];
    }
    
    // Önbelleğe kaydet (1 saat)
    await redisClient.set(cacheKey, JSON.stringify(endpoints), 'EX', 3600);
    
    res.json(endpoints);
  })
);

/**
 * @swagger
 * /api/versions/{version}/status:
 *   get:
 *     summary: Belirli bir API versiyonunun durumunu getirir
 *     tags: [API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: version
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API durum bilgisi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: API versiyonu bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/versions/:version/status', 
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const version = req.params.version;
    
    // Geçerli versiyonları kontrol et
    if (!['v1', 'v2'].includes(version)) {
      return res.status(404).json({ message: 'API versiyonu bulunamadı' });
    }
    
    // Önbellekten kontrol et
    const cacheKey = `api:versions:${version}:status`;
    const cachedStatus = await redisClient.get(cacheKey);
    
    if (cachedStatus) {
      return res.json(JSON.parse(cachedStatus));
    }
    
    // Durum bilgisini getir
    let status;
    
    if (version === 'v1') {
      status = {
        version: 'v1',
        status: 'stable',
        uptime: '99.9%',
        lastUpdated: '2025-03-15',
        deprecationDate: null,
        endOfLifeDate: null
      };
    } else if (version === 'v2') {
      status = {
        version: 'v2',
        status: 'beta',
        uptime: '98.5%',
        lastUpdated: '2025-04-15',
        deprecationDate: null,
        endOfLifeDate: null
      };
    }
    
    // Önbelleğe kaydet (1 saat)
    await redisClient.set(cacheKey, JSON.stringify(status), 'EX', 3600);
    
    res.json(status);
  })
);

/**
 * @swagger
 * /api/versions/compatibility:
 *   get:
 *     summary: API versiyonları arası uyumluluk bilgisini getirir
 *     tags: [API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Uyumluluk bilgisi başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/versions/compatibility', 
  asyncHandler(async (req: Request, res: Response) => { // Added types
    // Önbellekten kontrol et
    const cacheKey = 'api:versions:compatibility';
    const cachedCompatibility = await redisClient.get(cacheKey);
    
    if (cachedCompatibility) {
      return res.json(JSON.parse(cachedCompatibility));
    }
    
    // Uyumluluk bilgisi
    const compatibility = {
      v1: {
        v2: {
          compatible: true,
          notes: 'v1\'den v2\'ye geçiş sorunsuz desteklenmektedir. v2\'de yeni özellikler bulunmaktadır.'
        }
      },
      v2: {
        v1: {
          compatible: false,
          notes: 'v2\'den v1\'e geçiş desteklenmemektedir. v2\'de bulunan bazı özellikler v1\'de mevcut değildir.'
        }
      }
    };
    
    // Önbelleğe kaydet (1 gün)
    await redisClient.set(cacheKey, JSON.stringify(compatibility), 'EX', 86400);
    
    res.json(compatibility);
  })
);

/**
 * @swagger
 * /api/versions/migration:
 *   get:
 *     summary: API versiyonları arası geçiş kılavuzunu getirir
 *     tags: [API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Geçiş kılavuzu başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/versions/migration', 
  asyncHandler(async (req: Request, res: Response) => { // Added types
    // Önbellekten kontrol et
    const cacheKey = 'api:versions:migration';
    const cachedMigration = await redisClient.get(cacheKey);
    
    if (cachedMigration) {
      return res.json(JSON.parse(cachedMigration));
    }
    
    // Geçiş kılavuzu
    const migration = {
      'v1-to-v2': {
        title: 'v1\'den v2\'ye Geçiş Kılavuzu',
        steps: [
          'API endpoint\'lerinde /api/v2/ önekini kullanın',
          'Yeni kimlik doğrulama başlıklarını ekleyin',
          'Yeni hata yanıt formatını işleyin',
          'WebSocket desteği için yeni bağlantı yöntemlerini kullanın'
        ],
        breakingChanges: [
          'Hata yanıt formatı değişti',
          'Bazı endpoint\'ler yeniden adlandırıldı',
          'Kimlik doğrulama token formatı değişti'
        ],
        newFeatures: [
          'WebSocket desteği',
          'Gerçek zamanlı bildirimler',
          'Gelişmiş analitikler',
          'Daha iyi performans ve ölçeklenebilirlik'
        ]
      }
    };
    
    // Önbelleğe kaydet (1 gün)
    await redisClient.set(cacheKey, JSON.stringify(migration), 'EX', 86400);
    
    res.json(migration);
  })
);

export default router;

