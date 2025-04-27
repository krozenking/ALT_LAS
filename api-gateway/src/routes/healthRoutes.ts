import express from 'express';
import serviceDiscovery from '../services/serviceDiscovery';
import { segmentationService, runnerService, archiveService } from '../services/serviceIntegration';
import os from 'os';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API Gateway sağlık durumu
 *     description: API Gateway ve bağlı servislerin sağlık durumunu kontrol eder
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Sistem sağlıklı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                   description: Genel sistem durumu
 *                 version:
 *                   type: string
 *                   description: API Gateway versiyonu
 *                 uptime:
 *                   type: number
 *                   description: Çalışma süresi (saniye)
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Kontrol zamanı
 *                 hostname:
 *                   type: string
 *                   description: Sunucu adı
 *                 memory:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Toplam bellek (MB)
 *                     free:
 *                       type: number
 *                       description: Boş bellek (MB)
 *                     usage:
 *                       type: number
 *                       description: Bellek kullanımı (%)
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         description: Servis adı
 *                       status:
 *                         type: string
 *                         enum: [active, degraded, inactive]
 *                         description: Servis durumu
 *                       instances:
 *                         type: number
 *                         description: Aktif örnek sayısı
 *                       lastChecked:
 *                         type: string
 *                         format: date-time
 *                         description: Son kontrol zamanı
 */
router.get('/', async (req, res) => {
  const startTime = process.uptime();
  const version = process.env.API_GATEWAY_VERSION || '1.0.0';
  const timestamp = new Date().toISOString();
  const hostname = os.hostname();
  
  // Bellek kullanımı
  const totalMemory = Math.round(os.totalmem() / (1024 * 1024));
  const freeMemory = Math.round(os.freemem() / (1024 * 1024));
  const memoryUsage = Math.round(((totalMemory - freeMemory) / totalMemory) * 100);
  
  // Servis durumları
  const serviceStatuses = serviceDiscovery.getAllServicesStatus();
  const services = serviceStatuses.map(service => {
    const activeInstances = service.instances.filter(inst => inst.status === 'active').length;
    const degradedInstances = service.instances.filter(inst => inst.status === 'degraded').length;
    
    return {
      name: service.serviceName,
      status: activeInstances > 0 ? 'active' : (degradedInstances > 0 ? 'degraded' : 'inactive'),
      instances: service.instances.length,
      activeInstances,
      degradedInstances,
      lastChecked: service.instances.length > 0 
        ? new Date(Math.max(...service.instances.map(i => i.lastChecked.getTime()))).toISOString()
        : null
    };
  });
  
  // Genel durum belirleme
  let overallStatus = 'healthy';
  const inactiveServices = services.filter(s => s.status === 'inactive').length;
  const degradedServices = services.filter(s => s.status === 'degraded').length;
  
  if (inactiveServices > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedServices > 0) {
    overallStatus = 'degraded';
  }
  
  // Sağlık durumu yanıtı
  const healthStatus = {
    status: overallStatus,
    version,
    uptime: Math.round(startTime),
    timestamp,
    hostname,
    memory: {
      total: totalMemory,
      free: freeMemory,
      usage: memoryUsage
    },
    services
  };
  
  // Durum kodunu belirle
  const statusCode = overallStatus === 'healthy' ? 200 : (overallStatus === 'degraded' ? 200 : 503);
  
  // Yanıt gönder
  res.status(statusCode).json(healthStatus);
});

/**
 * @swagger
 * /health/check:
 *   post:
 *     summary: Bağlı servislerin sağlık kontrolünü tetikle
 *     description: Tüm bağlı servislerin sağlık kontrolünü manuel olarak tetikler
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sağlık kontrolü başlatıldı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: İşlem durumu
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin gerekli)
 */
router.post('/check', async (req, res) => {
  // Admin kontrolü (middleware ile yapılabilir)
  if (!req.user?.roles?.includes('admin')) {
    return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir' });
  }
  
  try {
    // Tüm servislerin sağlık kontrolünü başlat
    serviceDiscovery.checkAllServicesHealth().catch(error => {
      logger.error('Manuel sağlık kontrolü sırasında hata:', error);
    });
    
    // Yanıt gönder (asenkron olarak çalışacak)
    res.json({ 
      message: 'Sağlık kontrolü başlatıldı',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Sağlık kontrolü başlatma hatası:', error);
    res.status(500).json({ message: 'Sağlık kontrolü başlatılamadı' });
  }
});

/**
 * @swagger
 * /health/services:
 *   get:
 *     summary: Tüm servislerin detaylı durumunu getir
 *     description: Tüm bağlı servislerin ve örneklerinin detaylı durumunu getirir
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servis durumları
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası (Admin gerekli)
 */
router.get('/services', async (req, res) => {
  // Admin kontrolü (middleware ile yapılabilir)
  if (!req.user?.roles?.includes('admin')) {
    return res.status(403).json({ message: 'Bu işlem için admin yetkisi gereklidir' });
  }
  
  try {
    // Tüm servis kayıtlarını getir
    const services = serviceDiscovery.getAllServicesStatus();
    res.json(services);
  } catch (error) {
    logger.error('Servis durumları getirme hatası:', error);
    res.status(500).json({ message: 'Servis durumları getirilemedi' });
  }
});

export default router;
