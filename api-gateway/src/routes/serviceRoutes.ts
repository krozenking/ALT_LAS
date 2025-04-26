import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import logger from '../utils/logger';

// Swagger JSDoc için route tanımlamaları
/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Servis keşif ve yönetim işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Servis benzersiz tanımlayıcısı
 *         name:
 *           type: string
 *           description: Servis adı
 *         host:
 *           type: string
 *           description: Servis host adresi
 *         port:
 *           type: integer
 *           description: Servis port numarası
 *         url:
 *           type: string
 *           description: Servis tam URL'i
 *         status:
 *           type: string
 *           enum: [UP, DOWN, UNKNOWN]
 *           description: Servis durumu
 *         lastHeartbeat:
 *           type: string
 *           format: date-time
 *           description: Son heartbeat zamanı
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Servis metadata bilgileri
 *     ServiceRegistrationRequest:
 *       type: object
 *       required:
 *         - name
 *         - host
 *         - port
 *       properties:
 *         name:
 *           type: string
 *           description: Servis adı
 *         host:
 *           type: string
 *           description: Servis host adresi
 *         port:
 *           type: integer
 *           description: Servis port numarası
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Servis metadata bilgileri
 */

const router = Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Tüm servisleri listeler
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servis listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', asyncHandler(async (req, res) => {
  // Gerçek uygulamada servis kayıtları veritabanından veya bellekten getirilir
  // Şimdilik mock yanıt döndürüyoruz
  logger.info('Servis listesi istendi');
  res.json([
    {
      id: 'segmentation-service-1',
      name: 'segmentation-service',
      host: 'localhost',
      port: 3001,
      url: 'http://localhost:3001',
      status: 'UP',
      lastHeartbeat: new Date().toISOString(),
      metadata: {
        version: '1.0.0'
      }
    },
    {
      id: 'runner-service-1',
      name: 'runner-service',
      host: 'localhost',
      port: 3002,
      url: 'http://localhost:3002',
      status: 'UP',
      lastHeartbeat: new Date().toISOString(),
      metadata: {
        version: '1.0.0'
      }
    },
    {
      id: 'archive-service-1',
      name: 'archive-service',
      host: 'localhost',
      port: 3003,
      url: 'http://localhost:3003',
      status: 'UP',
      lastHeartbeat: new Date().toISOString(),
      metadata: {
        version: '1.0.0'
      }
    }
  ]);
}));

/**
 * @swagger
 * /api/services/register:
 *   post:
 *     summary: Yeni servis kaydı
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceRegistrationRequest'
 *     responses:
 *       201:
 *         description: Servis başarıyla kaydedildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { name, host, port, metadata } = req.body;
  
  // Gerçek uygulamada servis kaydı veritabanına veya belleğe yapılır
  // Şimdilik mock yanıt döndürüyoruz
  const serviceId = `${name}-${Math.random().toString(36).substring(7)}`;
  logger.info(`Yeni servis kaydı: ${name} (${host}:${port})`);
  
  const service = {
    id: serviceId,
    name,
    host,
    port,
    url: `http://${host}:${port}`,
    status: 'UP',
    lastHeartbeat: new Date().toISOString(),
    metadata: metadata || {}
  };
  
  res.status(201).json(service);
}));

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: Belirli bir servisi getirir
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servis bilgileri
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Servis bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:serviceId', asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  
  // Gerçek uygulamada servis veritabanından veya bellekten getirilir
  // Şimdilik mock yanıt döndürüyoruz
  if (serviceId.startsWith('segmentation') || serviceId.startsWith('runner') || serviceId.startsWith('archive')) {
    logger.info(`Servis bilgisi istendi: ${serviceId}`);
    res.json({
      id: serviceId,
      name: serviceId.split('-')[0],
      host: 'localhost',
      port: serviceId.startsWith('segmentation') ? 3001 : (serviceId.startsWith('runner') ? 3002 : 3003),
      url: `http://localhost:${serviceId.startsWith('segmentation') ? 3001 : (serviceId.startsWith('runner') ? 3002 : 3003)}`,
      status: 'UP',
      lastHeartbeat: new Date().toISOString(),
      metadata: {
        version: '1.0.0'
      }
    });
  } else {
    logger.warn(`Servis bulunamadı: ${serviceId}`);
    res.status(404).json({ message: 'Servis bulunamadı' });
  }
}));

/**
 * @swagger
 * /api/services/{serviceId}/heartbeat:
 *   post:
 *     summary: Servis heartbeat sinyali gönderir
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Heartbeat başarılı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Servis bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:serviceId/heartbeat', asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  
  // Gerçek uygulamada servis heartbeat bilgisi güncellenir
  // Şimdilik mock yanıt döndürüyoruz
  if (serviceId.startsWith('segmentation') || serviceId.startsWith('runner') || serviceId.startsWith('archive')) {
    logger.info(`Servis heartbeat: ${serviceId}`);
    res.json({
      id: serviceId,
      name: serviceId.split('-')[0],
      host: 'localhost',
      port: serviceId.startsWith('segmentation') ? 3001 : (serviceId.startsWith('runner') ? 3002 : 3003),
      url: `http://localhost:${serviceId.startsWith('segmentation') ? 3001 : (serviceId.startsWith('runner') ? 3002 : 3003)}`,
      status: 'UP',
      lastHeartbeat: new Date().toISOString(),
      metadata: {
        version: '1.0.0'
      }
    });
  } else {
    logger.warn(`Servis bulunamadı: ${serviceId}`);
    res.status(404).json({ message: 'Servis bulunamadı' });
  }
}));

export default router;
