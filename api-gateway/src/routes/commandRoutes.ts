import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireResourcePermission } from '../services/authorizationService';
import { withServiceIntegration } from '../services/serviceIntegration';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Commands
 *   description: Komut işleme API'leri
 */

// Kimlik doğrulama ve servis entegrasyonu middleware'leri
router.use(authenticateJWT);
router.use(withServiceIntegration);

/**
 * @swagger
 * /api/commands:
 *   post:
 *     summary: Yeni bir komut gönderir
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 *               options:
 *                 type: object
 *             required:
 *               - command
 *     responses:
 *       202:
 *         description: Komut başarıyla alındı
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
  requireResourcePermission('runner', 'write'),
  asyncHandler(async (req, res) => {
    const { command, options = {} } = req.body;
    
    if (!command) {
      throw new BadRequestError('Komut metni gereklidir');
    }
    
    // Kullanıcı bilgilerini options'a ekle
    const commandOptions = {
      ...options,
      userId: req.user?.id,
      username: req.user?.username
    };
    
    // 1. Segmentation Service ile komutu işle ve alt dosyası oluştur
    logger.info(`Komut segmentasyonu başlatılıyor: "${command.substring(0, 50)}..."`);
    const segmentationResult = await req.services?.segmentation.segmentCommand(command, commandOptions);
    
    // 2. Runner Service ile alt dosyasını çalıştır
    logger.info(`Komut çalıştırılıyor, Alt dosya ID: ${segmentationResult.altFileId}`);
    const runResult = await req.services?.runner.runCommand(segmentationResult.altFileId, commandOptions);
    
    res.status(202).json({
      message: 'Komut başarıyla alındı ve işleniyor',
      commandId: runResult.runId,
      status: 'processing',
      estimatedCompletionTime: runResult.estimatedCompletionTime
    });
  })
);

/**
 * @swagger
 * /api/commands/{commandId}:
 *   get:
 *     summary: Komut durumunu sorgular
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: commandId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Komut durumu başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Komut bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:commandId', 
  requireResourcePermission('runner', 'read'),
  asyncHandler(async (req, res) => {
    const commandId = req.params.commandId;
    
    logger.info(`Komut durumu sorgulanıyor: ${commandId}`);
    const statusResult = await req.services?.runner.getCommandStatus(commandId);
    
    if (!statusResult) {
      throw new NotFoundError('Komut bulunamadı');
    }
    
    res.json(statusResult);
  })
);

/**
 * @swagger
 * /api/commands/{commandId}/cancel:
 *   post:
 *     summary: Komutu iptal eder
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: commandId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Komut başarıyla iptal edildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Komut bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:commandId/cancel', 
  requireResourcePermission('runner', 'write'),
  asyncHandler(async (req, res) => {
    const commandId = req.params.commandId;
    
    logger.info(`Komut iptal ediliyor: ${commandId}`);
    const cancelResult = await req.services?.runner.cancelCommand(commandId);
    
    if (!cancelResult) {
      throw new NotFoundError('Komut bulunamadı veya iptal edilemedi');
    }
    
    res.json({
      message: 'Komut başarıyla iptal edildi',
      status: cancelResult.status
    });
  })
);

/**
 * @swagger
 * /api/commands/history:
 *   get:
 *     summary: Komut geçmişini listeler
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled]
 *     responses:
 *       200:
 *         description: Komut geçmişi başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/history', 
  requireResourcePermission('runner', 'read'),
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;
    
    // Kullanıcıya özel komut geçmişi
    const query = {
      userId: req.user?.id,
      limit,
      offset,
      ...(status ? { status } : {})
    };
    
    logger.info(`Komut geçmişi sorgulanıyor: ${JSON.stringify(query)}`);
    
    // Runner Service'den komut geçmişini al
    const historyResult = await req.services?.runner.get('/api/history', query);
    
    res.json(historyResult);
  })
);

/**
 * @swagger
 * /api/commands/archive/{commandId}:
 *   post:
 *     summary: Tamamlanan bir komutu arşivler
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: commandId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Komut başarıyla arşivlendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Komut bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/archive/:commandId', 
  requireResourcePermission('archive', 'write'),
  asyncHandler(async (req, res) => {
    const commandId = req.params.commandId;
    const { metadata = {} } = req.body;
    
    // Önce komut durumunu kontrol et
    logger.info(`Arşivlenecek komut durumu sorgulanıyor: ${commandId}`);
    const statusResult = await req.services?.runner.getCommandStatus(commandId);
    
    if (!statusResult) {
      throw new NotFoundError('Komut bulunamadı');
    }
    
    if (statusResult.status !== 'completed') {
      throw new BadRequestError('Sadece tamamlanan komutlar arşivlenebilir');
    }
    
    // Kullanıcı bilgilerini metadata'ya ekle
    const archiveMetadata = {
      ...metadata,
      userId: req.user?.id,
      username: req.user?.username,
      archivedAt: new Date().toISOString()
    };
    
    // Archive Service ile arşivle
    logger.info(`Komut arşivleniyor: ${commandId}`);
    const archiveResult = await req.services?.archive.archiveLastFile(
      statusResult.lastFileId,
      archiveMetadata
    );
    
    res.json({
      message: 'Komut başarıyla arşivlendi',
      atlasFileId: archiveResult.atlasFileId
    });
  })
);

export default router;
