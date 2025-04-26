import { Router } from 'express';
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import logger from '../utils/logger';

// Swagger JSDoc için route tanımlamaları
/**
 * @swagger
 * tags:
 *   name: Archive
 *   description: Arşivleme işlemleri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ArchiveRequest:
 *       type: object
 *       required:
 *         - lastFile
 *       properties:
 *         lastFile:
 *           type: string
 *           description: Arşivlenecek .last dosyasının adı
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Arşiv metadata bilgileri
 *     ArchiveResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Arşiv işlemi ID'si
 *         status:
 *           type: string
 *           enum: [success, error]
 *           description: İşlem durumu
 *         atlasId:
 *           type: string
 *           description: Oluşturulan .atlas kaydının ID'si
 *         successRate:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Başarı oranı
 */

const router = Router();

/**
 * @swagger
 * /api/v1/archive:
 *   post:
 *     summary: Sonuç arşivleme
 *     description: *.last dosyasını arşivler ve *.atlas veritabanına kaydeder
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArchiveRequest'
 *     responses:
 *       200:
 *         description: Başarılı arşivleme
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArchiveResponse'
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', authenticateJWT, asyncHandler(async (req, res) => {
  try {
    const { lastFile, metadata = {} } = req.body;
    
    logger.info(`Arşiv isteği: ${lastFile}`);
    
    // Gerçek uygulamada Archive Service'e istek yapılır
    // Şimdilik mock yanıt döndürüyoruz
    const archiveId = Math.random().toString(36).substring(7);
    const atlasId = `atlas_${Date.now()}`;
    const successRate = Math.floor(Math.random() * 100);
    
    const response = {
      id: archiveId,
      status: 'success',
      atlasId,
      successRate
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Archive servisinde hata:', error);
    throw error;
  }
}));

/**
 * @swagger
 * /api/v1/archive/{id}:
 *   get:
 *     summary: Arşiv kaydı sorgulama
 *     description: Bir arşiv kaydını sorgular
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Arşiv işlemi ID'si
 *     responses:
 *       200:
 *         description: Arşiv kaydı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArchiveResponse'
 *       404:
 *         description: Bulunamadı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', authenticateJWT, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  logger.info(`Arşiv kaydı sorgulandı: ${id}`);
  
  // Gerçek uygulamada Archive Service'den kayıt sorgulanır
  // Şimdilik mock yanıt döndürüyoruz
  res.json({
    id,
    status: 'success',
    atlasId: `atlas_${id}`,
    successRate: Math.floor(Math.random() * 100)
  });
}));

/**
 * @swagger
 * /api/v1/archive/search:
 *   get:
 *     summary: Arşiv kayıtlarını arar
 *     description: Belirli kriterlere göre arşiv kayıtlarını arar
 *     tags: [Archive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *         description: Arama sorgusu
 *       - name: startDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Başlangıç tarihi
 *       - name: endDate
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *         description: Bitiş tarihi
 *       - name: minSuccessRate
 *         in: query
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         description: Minimum başarı oranı
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Sonuç limiti
 *       - name: offset
 *         in: query
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Sonuç başlangıç indeksi
 *     responses:
 *       200:
 *         description: Arama sonuçları
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Toplam sonuç sayısı
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ArchiveResponse'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/search', authenticateJWT, asyncHandler(async (req, res) => {
  const { query, startDate, endDate, minSuccessRate, limit = 10, offset = 0 } = req.query;
  
  logger.info(`Arşiv araması: ${JSON.stringify(req.query)}`);
  
  // Gerçek uygulamada Archive Service'de arama yapılır
  // Şimdilik mock yanıt döndürüyoruz
  const results = Array.from({ length: Math.min(Number(limit), 20) }, (_, i) => ({
    id: `archive-${i + Number(offset)}`,
    status: 'success',
    atlasId: `atlas_${i + Number(offset)}`,
    successRate: Math.floor(Math.random() * 100)
  }));
  
  res.json({
    total: 100,
    results
  });
}));

export default router;
