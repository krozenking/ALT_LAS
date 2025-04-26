import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import logger from '../utils/logger';

// Swagger JSDoc için route tanımlamaları
/**
 * @swagger
 * tags:
 *   name: Segmentation
 *   description: Komut segmentasyonu işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SegmentationRequest:
 *       type: object
 *       required:
 *         - command
 *       properties:
 *         command:
 *           type: string
 *           description: Komut metni
 *         mode:
 *           type: string
 *           enum: [Normal, Dream, Explore, Chaos]
 *           default: Normal
 *           description: Çalışma modu
 *         persona:
 *           type: string
 *           enum: [empathetic_assistant, technical_expert, creative_designer, security_focused, efficiency_optimizer, learning_tutor]
 *           default: technical_expert
 *           description: Persona tipi
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Ek metadata bilgileri
 *     SegmentationResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Segmentasyon işlemi ID'si
 *         status:
 *           type: string
 *           enum: [success, error, pending]
 *           description: İşlem durumu
 *         altFile:
 *           type: string
 *           description: Oluşturulan .alt dosyasının adı
 *         metadata:
 *           type: object
 *           properties:
 *             timestamp:
 *               type: string
 *               format: date-time
 *               description: İşlem zamanı
 *             mode:
 *               type: string
 *               description: Kullanılan çalışma modu
 *             persona:
 *               type: string
 *               description: Kullanılan persona tipi
 */

const router = Router();

/**
 * @swagger
 * /api/v1/segmentation:
 *   post:
 *     summary: Komut segmentasyonu
 *     description: Bir komutu alt görevlere böler ve *.alt dosyası oluşturur
 *     tags: [Segmentation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SegmentationRequest'
 *     responses:
 *       200:
 *         description: Başarılı segmentasyon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SegmentationResponse'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const { command, mode = 'Normal', persona = 'technical_expert', metadata = {} } = req.body;
    
    logger.info(`Segmentasyon isteği: "${command.substring(0, 50)}${command.length > 50 ? '...' : ''}" (${mode}, ${persona})`);
    
    // Gerçek uygulamada Segmentation Service'e istek yapılır
    // Şimdilik mock yanıt döndürüyoruz
    const segmentationId = Math.random().toString(36).substring(7);
    const timestamp = new Date().toISOString();
    
    const response = {
      id: segmentationId,
      status: 'success',
      altFile: `task_${segmentationId}.alt`,
      metadata: {
        timestamp,
        mode,
        persona,
        ...metadata
      }
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Segmentation servisinde hata:', error);
    throw error;
  }
}));

/**
 * @swagger
 * /api/v1/segmentation/{id}:
 *   get:
 *     summary: Segmentasyon durumu
 *     description: Bir segmentasyon işleminin durumunu sorgular
 *     tags: [Segmentation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Segmentasyon işlemi ID'si
 *     responses:
 *       200:
 *         description: Segmentasyon durumu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SegmentationResponse'
 *       404:
 *         description: Bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Segmentasyon durumu sorgulandı: ${id}`);
  
  // Gerçek uygulamada Segmentation Service'den durum sorgulanır
  // Şimdilik mock yanıt döndürüyoruz
  res.json({
    id,
    status: 'completed',
    altFile: `task_${id}.alt`,
    metadata: {
      timestamp: new Date().toISOString(),
      mode: 'Normal',
      persona: 'technical_expert'
    }
  });
}));

export default router;
