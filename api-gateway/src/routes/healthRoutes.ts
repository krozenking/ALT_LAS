import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireResourcePermission } from '../services/authorizationService';
import { withServiceIntegration } from '../services/serviceIntegration';
import logger from '../utils/logger';
import os from 'os';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Sağlık kontrolü ve izleme API'leri
 */

// Temel sağlık kontrolü - kimlik doğrulama gerektirmez
router.get('/', asyncHandler(async (req, res) => {
  const status = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'api-gateway',
    version: process.env.VERSION || '1.0.0'
  };
  
  res.json(status);
}));

// Detaylı sağlık kontrolü - kimlik doğrulama gerektirir
router.use(authenticateJWT);
router.use(withServiceIntegration);

/**
 * @swagger
 * /api/health/details:
 *   get:
 *     summary: Detaylı sağlık durumu bilgisi verir
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sağlık durumu başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/details', 
  requireResourcePermission('services', 'read'),
  asyncHandler(async (req, res) => {
    // Sistem bilgileri
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      osUptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length
    };
    
    // Servis durumları
    const serviceStatuses = {
      segmentation: req.services?.segmentation.getStatus(),
      runner: req.services?.runner.getStatus(),
      archive: req.services?.archive.getStatus()
    };
    
    // Sağlık kontrolü
    const healthChecks = {
      api_gateway: {
        status: 'UP',
        timestamp: new Date().toISOString()
      }
    };
    
    try {
      // Segmentation Service sağlık kontrolü
      const segmentationHealth = await req.services?.segmentation.checkHealth();
      healthChecks.segmentation_service = {
        status: segmentationHealth ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      healthChecks.segmentation_service = {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      };
    }
    
    try {
      // Runner Service sağlık kontrolü
      const runnerHealth = await req.services?.runner.checkHealth();
      healthChecks.runner_service = {
        status: runnerHealth ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      healthChecks.runner_service = {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      };
    }
    
    try {
      // Archive Service sağlık kontrolü
      const archiveHealth = await req.services?.archive.checkHealth();
      healthChecks.archive_service = {
        status: archiveHealth ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      healthChecks.archive_service = {
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      };
    }
    
    // Genel durum
    const overallStatus = Object.values(healthChecks).every(
      check => check.status === 'UP'
    ) ? 'UP' : 'DEGRADED';
    
    logger.info(`Sağlık kontrolü: ${overallStatus}`);
    
    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: healthChecks,
      system: systemInfo,
      circuitBreakers: serviceStatuses
    });
  })
);

/**
 * @swagger
 * /api/health/metrics:
 *   get:
 *     summary: Sistem metriklerini getirir
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrikler başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/metrics', 
  requireResourcePermission('services', 'read'),
  asyncHandler(async (req, res) => {
    // Basit metrikler
    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memory: {
          rss: process.memoryUsage().rss,
          heapTotal: process.memoryUsage().heapTotal,
          heapUsed: process.memoryUsage().heapUsed,
          external: process.memoryUsage().external,
          arrayBuffers: process.memoryUsage().arrayBuffers
        },
        cpu: process.cpuUsage()
      },
      system: {
        uptime: os.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          usage: (1 - os.freemem() / os.totalmem()) * 100
        },
        cpus: os.cpus().length,
        loadAvg: os.loadavg()
      }
    };
    
    res.json(metrics);
  })
);

/**
 * @swagger
 * /api/health/services:
 *   get:
 *     summary: Tüm servislerin sağlık durumunu getirir
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servis durumları başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/services', 
  requireResourcePermission('services', 'read'),
  asyncHandler(async (req, res) => {
    const serviceChecks = [];
    
    // API Gateway durumu
    serviceChecks.push({
      name: 'api-gateway',
      status: 'UP',
      timestamp: new Date().toISOString()
    });
    
    try {
      // Segmentation Service sağlık kontrolü
      const segmentationHealth = await req.services?.segmentation.checkHealth();
      serviceChecks.push({
        name: 'segmentation-service',
        status: segmentationHealth ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        details: req.services?.segmentation.getStatus()
      });
    } catch (error) {
      serviceChecks.push({
        name: 'segmentation-service',
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
    
    try {
      // Runner Service sağlık kontrolü
      const runnerHealth = await req.services?.runner.checkHealth();
      serviceChecks.push({
        name: 'runner-service',
        status: runnerHealth ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        details: req.services?.runner.getStatus()
      });
    } catch (error) {
      serviceChecks.push({
        name: 'runner-service',
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
    
    try {
      // Archive Service sağlık kontrolü
      const archiveHealth = await req.services?.archive.checkHealth();
      serviceChecks.push({
        name: 'archive-service',
        status: archiveHealth ? 'UP' : 'DOWN',
        timestamp: new Date().toISOString(),
        details: req.services?.archive.getStatus()
      });
    } catch (error) {
      serviceChecks.push({
        name: 'archive-service',
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
    
    // Genel durum
    const overallStatus = serviceChecks.every(
      service => service.status === 'UP'
    ) ? 'UP' : 'DEGRADED';
    
    logger.info(`Servis sağlık kontrolü: ${overallStatus}`);
    
    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: serviceChecks
    });
  })
);

export default router;
