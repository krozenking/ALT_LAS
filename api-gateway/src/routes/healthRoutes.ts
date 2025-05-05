import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { authorizeRoute } from '../middleware/routeAuthMiddleware';
import logger from '../utils/logger';
import { segmentationService, runnerService, archiveService, serviceDiscovery } from '../services/serviceIntegration';
import notificationService from '../services/notificationService';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Servis sağlık kontrolü ve izleme
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: API Gateway sağlık durumunu kontrol eder
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API Gateway sağlıklı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded]
 *                 version:
 *                   type: string
 *                 uptime:
 *                   type: number
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: API Gateway sağlıksız
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startTime = process.uptime();
    const version = process.env.API_VERSION || '1.0.0';
    
    res.status(200).json({
      status: 'ok',
      version,
      uptime: startTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/health/services:
 *   get:
 *     summary: Tüm servislerin sağlık durumunu kontrol eder
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servis sağlık durumları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ok, degraded, critical]
 *                 services:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [ok, degraded, critical]
 *                       lastCheck:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/services',
  authenticateJWT,
  authorizeRoute({ path: '/services', method: 'get', roles: ['admin', 'service'] }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const services = {
        segmentation: await checkServiceHealth(segmentationService, 'segmentation'), // Pass service name
        runner: await checkServiceHealth(runnerService, 'runner'), // Pass service name
        archive: await checkServiceHealth(archiveService, 'archive') // Pass service name
      };
      
      // Genel durum belirleme
      let overallStatus = 'ok';
      const criticalServices = Object.values(services).filter(s => s.status === 'critical');
      const degradedServices = Object.values(services).filter(s => s.status === 'degraded');
      
      if (criticalServices.length > 0) {
        overallStatus = 'critical';
      } else if (degradedServices.length > 0) {
        overallStatus = 'degraded';
      }
      
      res.status(200).json({
        status: overallStatus,
        services,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/health/services/{serviceName}:
 *   get:
 *     summary: Belirli bir servisin sağlık durumunu kontrol eder
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [segmentation, runner, archive]
 *     responses:
 *       200:
 *         description: Servis sağlık durumu
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Servis bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/services/:serviceName',
  authenticateJWT,
  authorizeRoute({ path: '/services/:serviceName', method: 'get', roles: ['admin', 'service'] }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { serviceName } = req.params;
      let service;
      
      switch (serviceName) {
        case 'segmentation':
          service = segmentationService;
          break;
        case 'runner':
          service = runnerService;
          break;
        case 'archive':
          service = archiveService;
          break;
        default:
          res.status(404).json({
            status: 'error',
            message: `Servis bulunamadı: ${serviceName}`
          });
      }
      
      const healthStatus = await checkServiceHealth(service, serviceName); // Pass service name
      
      res.status(200).json({
        service: serviceName,
        ...healthStatus,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: API Gateway metriklerini getirir
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: API Gateway metrikleri
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get(
  '/metrics',
  authenticateJWT,
  authorizeRoute({ path: '/metrics', method: 'get', roles: ['admin', 'service'] }),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Burada gerçek metrikler toplanmalı
      // Örnek metrikler:
      const metrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        requests: {
          total: 1000, // Örnek değer
          success: 950, // Örnek değer
          error: 50, // Örnek değer
          avgResponseTime: 120 // Örnek değer (ms)
        },
        services: {
          segmentation: {
            requests: 400, // Örnek değer
            avgResponseTime: 150 // Örnek değer (ms)
          },
          runner: {
            requests: 350, // Örnek değer
            avgResponseTime: 200 // Örnek değer (ms)
          },
          archive: {
            requests: 250, // Örnek değer
            avgResponseTime: 100 // Örnek değer (ms)
          }
        }
      };
      
      res.status(200).json({
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Servis sağlık durumunu kontrol eder
 * @param service Kontrol edilecek servis
 * @param serviceName Servisin adı (bildirimler için)
 * @returns Sağlık durumu
 */
async function checkServiceHealth(service: any, serviceName?: string): Promise<{ status: string, lastCheck: string, details?: any }> {
  const timestamp = new Date().toISOString();
  try {
    const isHealthy = await service.healthCheck();
    const status = isHealthy ? 'ok' : 'critical';
    
    // Send notification if service is not healthy
    if (!isHealthy) {
      notificationService.sendAlert('error', {
        serviceName,
        status,
        message: `Servis sağlık kontrolü başarısız`,
        timestamp
      });
    }
    
    return {
      status,
      lastCheck: timestamp
    };
  } catch (error) {
    let errorMessage = 'Bilinmeyen bir hata oluştu';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    logger.error(`Servis sağlık kontrolü başarısız: ${errorMessage}`);
    
    // Send notification for service check error
    notificationService.sendAlert('error', {
      serviceName,
      status: 'critical',
      message: `Servis sağlık kontrolü hatası: ${errorMessage}`,
      timestamp,
      details: { error: errorMessage }
    });
    
    return {
      status: 'critical',
      lastCheck: timestamp,
      details: {
        error: errorMessage
      }
    };
  }
}

export default router;

