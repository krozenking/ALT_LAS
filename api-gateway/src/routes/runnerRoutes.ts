import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import logger from '../utils/logger';

// Swagger JSDoc için route tanımlamaları
/**
 * @swagger
 * tags:
 *   name: Runner
 *   description: Alt görev çalıştırma işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RunnerRequest:
 *       type: object
 *       required:
 *         - altFile
 *       properties:
 *         altFile:
 *           type: string
 *           description: İşlenecek .alt dosyasının adı
 *         options:
 *           type: object
 *           additionalProperties: true
 *           description: Çalıştırma seçenekleri
 *     RunnerResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Çalıştırma işlemi ID'si
 *         status:
 *           type: string
 *           enum: [success, error, pending, running]
 *           description: İşlem durumu
 *         lastFile:
 *           type: string
 *           description: Oluşturulan .last dosyasının adı
 *         progress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: İşlem ilerleme yüzdesi
 */

const router = Router();

/**
 * @swagger
 * /api/v1/runner:
 *   post:
 *     summary: Alt görev çalıştırma
 *     description: *.alt dosyasını işler ve *.last dosyası oluşturur
 *     tags: [Runner]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RunnerRequest'
 *     responses:
 *       200:
 *         description: Başarılı çalıştırma
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RunnerResponse'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const { altFile, options = {} } = req.body;
    
    logger.info(`Runner isteği: ${altFile}`);
    
    // Gerçek uygulamada Runner Service'e istek yapılır
    // Şimdilik mock yanıt döndürüyoruz
    const runnerId = Math.random().toString(36).substring(7);
    
    const response = {
      id: runnerId,
      status: 'running',
      progress: 0,
      lastFile: null
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Runner servisinde hata:', error);
    throw error;
  }
}));

/**
 * @swagger
 * /api/v1/runner/{id}:
 *   get:
 *     summary: Çalıştırma durumu
 *     description: Bir çalıştırma işleminin durumunu sorgular
 *     tags: [Runner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Çalıştırma işlemi ID'si
 *     responses:
 *       200:
 *         description: Çalıştırma durumu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RunnerResponse'
 *       404:
 *         description: Bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Runner durumu sorgulandı: ${id}`);
  
  // Gerçek uygulamada Runner Service'den durum sorgulanır
  // Şimdilik mock yanıt döndürüyoruz
  const progress = Math.floor(Math.random() * 100);
  const lastFile = progress >= 100 ? `result_${id}.last` : null;
  const status = progress >= 100 ? 'success' : 'running';
  
  res.json({
    id,
    status,
    progress,
    lastFile
  });
}));

/**
 * @swagger
 * /api/v1/runner/{id}/cancel:
 *   post:
 *     summary: Çalıştırma işlemini iptal eder
 *     description: Devam eden bir çalıştırma işlemini iptal eder
 *     tags: [Runner]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Çalıştırma işlemi ID'si
 *     responses:
 *       200:
 *         description: İşlem başarıyla iptal edildi
 *       404:
 *         description: İşlem bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:id/cancel', authenticateJWT, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Runner işlemi iptal edildi: ${id}`);
  
  // Gerçek uygulamada Runner Service'e iptal isteği gönderilir
  // Şimdilik mock yanıt döndürüyoruz
  res.json({
    id,
    status: 'cancelled',
    progress: 0,
    lastFile: null
  });
}));

export default router;
