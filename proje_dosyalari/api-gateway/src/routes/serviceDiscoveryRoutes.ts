import { Router, Request, Response, NextFunction } from 'express'; // Added Request, Response, NextFunction
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT, authorizeRoles, authorizePermissions } from '../middleware/authMiddleware';
import { requireResourcePermission } from '../services/authorizationService';
import logger from '../utils/logger';

// Service discovery için basit bir in-memory implementasyon
// Gerçek uygulamada bu Redis, etcd veya Consul gibi bir servis ile yapılmalıdır
interface ServiceInfo {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  lastHeartbeat: Date;
  metadata: Record<string, any>;
}

class ServiceRegistry {
  private services: Record<string, ServiceInfo> = {};
  private heartbeatTimeoutMs: number = 30000; // 30 saniye

  constructor() {
    // Belirli aralıklarla sağlık kontrolü yap
    setInterval(() => this.checkServicesHealth(), 15000); // 15 saniyede bir
  }

  /**
   * Servis kaydı oluşturur veya günceller
   * @param serviceInfo Servis bilgileri
   * @returns Kaydedilen servis bilgileri
   */
  registerService(serviceInfo: Omit<ServiceInfo, 'lastHeartbeat'>): ServiceInfo {
    const service: ServiceInfo = {
      ...serviceInfo,
      lastHeartbeat: new Date()
    };

    this.services[service.id] = service;
    logger.info(`Servis kaydedildi: ${service.name} (${service.id})`);
    return service;
  }

  /**
   * Servis kaydını siler
   * @param serviceId Servis ID
   * @returns İşlem başarılı mı
   */
  deregisterService(serviceId: string): boolean {
    if (!this.services[serviceId]) {
      return false;
    }

    const serviceName = this.services[serviceId].name;
    delete this.services[serviceId];
    logger.info(`Servis kaydı silindi: ${serviceName} (${serviceId})`);
    return true;
  }

  /**
   * Servis heartbeat'ini günceller
   * @param serviceId Servis ID
   * @returns İşlem başarılı mı
   */
  updateHeartbeat(serviceId: string): boolean {
    if (!this.services[serviceId]) {
      return false;
    }

    this.services[serviceId].lastHeartbeat = new Date();
    return true;
  }

  /**
   * Servis durumunu günceller
   * @param serviceId Servis ID
   * @param status Yeni durum
   * @returns İşlem başarılı mı
   */
  updateStatus(serviceId: string, status: 'up' | 'down' | 'degraded'): boolean {
    if (!this.services[serviceId]) {
      return false;
    }

    this.services[serviceId].status = status;
    logger.info(`Servis durumu güncellendi: ${this.services[serviceId].name} (${serviceId}) -> ${status}`);
    return true;
  }

  /**
   * Tüm servisleri döndürür
   * @returns Servis listesi
   */
  getAllServices(): ServiceInfo[] {
    return Object.values(this.services);
  }

  /**
   * Belirli bir servisi döndürür
   * @param serviceId Servis ID
   * @returns Servis bilgileri
   */
  getService(serviceId: string): ServiceInfo | null {
    return this.services[serviceId] || null;
  }

  /**
   * İsme göre servis arar
   * @param name Servis adı
   * @returns Eşleşen servisler
   */
  findServicesByName(name: string): ServiceInfo[] {
    return Object.values(this.services).filter(
      service => service.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Servislerin sağlık durumunu kontrol eder
   */
  private checkServicesHealth(): void {
    const now = new Date();
    let unhealthyCount = 0;

    for (const serviceId in this.services) {
      const service = this.services[serviceId];
      const timeSinceLastHeartbeat = now.getTime() - service.lastHeartbeat.getTime();

      if (timeSinceLastHeartbeat > this.heartbeatTimeoutMs && service.status !== 'down') {
        service.status = 'down';
        unhealthyCount++;
        logger.warn(`Servis yanıt vermiyor: ${service.name} (${serviceId})`);
      }
    }

    if (unhealthyCount > 0) {
      logger.warn(`${unhealthyCount} servis sağlıksız durumda`);
    }
  }
}

// Singleton instance
const serviceRegistry = new ServiceRegistry();

const router = Router();

/**
 * @swagger
 * tags:
 *   name: ServiceDiscovery
 *   description: Servis keşif ve yönetim işlemleri
 */

// Kimlik doğrulama gerekli
router.use(authenticateJWT);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Tüm servisleri listeler
 *     tags: [ServiceDiscovery]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servisler başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', 
  requireResourcePermission('services', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const services = serviceRegistry.getAllServices();
    logger.info(`Servisler listelendi: ${services.length} servis`);
    res.json(services);
  })
);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: Belirli bir servisi getirir
 *     tags: [ServiceDiscovery]
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
 *         description: Servis başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Servis bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:serviceId', 
  requireResourcePermission('services', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const service = serviceRegistry.getService(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Servis bulunamadı' });
    }
    
    logger.info(`Servis bilgisi alındı: ${service.name} (${service.id})`);
    res.json(service);
  })
);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Yeni bir servis kaydeder
 *     tags: [ServiceDiscovery]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [up, down, degraded]
 *               metadata:
 *                 type: object
 *             required:
 *               - id
 *               - name
 *               - url
 *     responses:
 *       201:
 *         description: Servis başarıyla kaydedildi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', 
  requireResourcePermission('services', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const { id, name, url, status = 'up', metadata = {} } = req.body;
    
    if (!id || !name || !url) {
      return res.status(400).json({ message: 'id, name ve url alanları zorunludur' });
    }
    
    const service = serviceRegistry.registerService({
      id,
      name,
      url,
      status: status as 'up' | 'down' | 'degraded',
      metadata
    });
    
    logger.info(`Yeni servis kaydedildi: ${name} (${id})`);
    res.status(201).json(service);
  })
);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   put:
 *     summary: Servis bilgilerini günceller
 *     tags: [ServiceDiscovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceId
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
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [up, down, degraded]
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Servis başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Servis bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:serviceId', 
  requireResourcePermission('services', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const serviceId = req.params.serviceId;
    const service = serviceRegistry.getService(serviceId);
    
    if (!service) {
      return res.status(404).json({ message: 'Servis bulunamadı' });
    }
    
    const { name, url, status, metadata } = req.body;
    
    const updatedService = serviceRegistry.registerService({
      id: serviceId,
      name: name || service.name,
      url: url || service.url,
      status: (status as 'up' | 'down' | 'degraded') || service.status,
      metadata: metadata || service.metadata
    });
    
    logger.info(`Servis güncellendi: ${updatedService.name} (${serviceId})`);
    res.json(updatedService);
  })
);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   delete:
 *     summary: Servis kaydını siler
 *     tags: [ServiceDiscovery]
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
 *         description: Servis başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Servis bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:serviceId', 
  requireResourcePermission('services', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const serviceId = req.params.serviceId;
    const success = serviceRegistry.deregisterService(serviceId);
    
    if (!success) {
      return res.status(404).json({ message: 'Servis bulunamadı' });
    }
    
    logger.info(`Servis silindi: ${serviceId}`);
    res.json({ message: 'Servis başarıyla silindi' });
  })
);

/**
 * @swagger
 * /api/services/{serviceId}/heartbeat:
 *   post:
 *     summary: Servis heartbeat'ini günceller
 *     tags: [ServiceDiscovery]
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
 *         description: Heartbeat başarıyla güncellendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Servis bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:serviceId/heartbeat', 
  requireResourcePermission('services', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const serviceId = req.params.serviceId;
    const success = serviceRegistry.updateHeartbeat(serviceId);
    
    if (!success) {
      return res.status(404).json({ message: 'Servis bulunamadı' });
    }
    
    res.json({ message: 'Heartbeat başarıyla güncellendi' });
  })
);

/**
 * @swagger
 * /api/services/{serviceId}/status:
 *   put:
 *     summary: Servis durumunu günceller
 *     tags: [ServiceDiscovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceId
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
 *               status:
 *                 type: string
 *                 enum: [up, down, degraded]
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Durum başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Servis bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:serviceId/status', 
  requireResourcePermission('services', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const serviceId = req.params.serviceId;
    const { status } = req.body;
    
    if (!status || !['up', 'down', 'degraded'].includes(status)) {
      return res.status(400).json({ message: 'Geçerli bir durum belirtilmelidir (up, down, degraded)' });
    }
    
    const success = serviceRegistry.updateStatus(serviceId, status as 'up' | 'down' | 'degraded');
    
    if (!success) {
      return res.status(404).json({ message: 'Servis bulunamadı' });
    }
    
    logger.info(`Servis durumu güncellendi: ${serviceId} -> ${status}`);
    res.json({ message: 'Durum başarıyla güncellendi' });
  })
);

/**
 * @swagger
 * /api/services/search:
 *   get:
 *     summary: İsme göre servis arar
 *     tags: [ServiceDiscovery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arama sonuçları başarıyla getirildi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/search', 
  requireResourcePermission('services', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Arama için name parametresi gereklidir' });
    }
    
    const services = serviceRegistry.findServicesByName(name);
    logger.info(`Servis araması: "${name}" için ${services.length} sonuç bulundu`);
    res.json(services);
  })
);

export default router;

