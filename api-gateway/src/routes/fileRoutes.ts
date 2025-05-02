// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any; // Assuming user is attached by auth middleware
      services?: any; // Assuming services are attached by withServiceIntegration
    }
  }
}

import { Router, Request, Response, NextFunction } from 'express'; // Added Request, Response, NextFunction
import { asyncHandler } from '../middleware/errorMiddleware';
import { authenticateJWT } from '../middleware/authMiddleware';
import { requireResourcePermission } from '../services/authorizationService';
import withServiceIntegration from '../services/serviceIntegration';
import logger from '../utils/logger';
import { BadRequestError, NotFoundError } from '../utils/errors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Dosya yükleme için multer yapılandırması
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => { // Added types
    const uploadDir = path.join(__dirname, '../../uploads');
    
    // Dizin yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => { // Added types
    // Benzersiz dosya adı oluştur
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Dosya filtreleme
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => { // Added Request type
  // İzin verilen dosya uzantıları
  const allowedExtensions = ['.alt', '.last', '.atlas'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    // Pass an Error object to the callback
    cb(new Error('Sadece .alt, .last ve .atlas uzantılı dosyalar kabul edilir'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: Dosya yönetimi API'leri
 */

// Kimlik doğrulama ve servis entegrasyonu middleware'leri
router.use(authenticateJWT);
router.use(withServiceIntegration);

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Dosya yükler
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               metadata:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dosya başarıyla yüklendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/upload', 
  requireResourcePermission('files', 'write'),
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    if (!req.file) {
      throw new BadRequestError('Dosya yüklenemedi');
    }
    
    const file = req.file;
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};
    
    // Dosya uzantısına göre ilgili servise yönlendir
    const ext = path.extname(file.originalname).toLowerCase();
    let fileId;
    let serviceResponse;
    
    // Kullanıcı bilgilerini metadata'ya ekle
    const fileMetadata = {
      ...metadata,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: req.user?.id,
      uploadedAt: new Date().toISOString()
    };
    
    try {
      // Dosya içeriğini oku
      const fileContent = fs.readFileSync(file.path);
      
      if (ext === '.alt') {
        // Segmentation Service'e gönder
        serviceResponse = await req.services?.segmentation.post('/api/files/alt/upload', {
          content: fileContent.toString('utf-8'),
          metadata: fileMetadata
        });
        fileId = serviceResponse.altFileId;
      } else if (ext === '.last') {
        // Runner Service'e gönder
        serviceResponse = await req.services?.runner.post('/api/files/last/upload', {
          content: fileContent.toString('utf-8'),
          metadata: fileMetadata
        });
        fileId = serviceResponse.lastFileId;
      } else if (ext === '.atlas') {
        // Archive Service'e gönder
        serviceResponse = await req.services?.archive.post('/api/files/atlas/upload', {
          content: fileContent.toString('utf-8'),
          metadata: fileMetadata
        });
        fileId = serviceResponse.atlasFileId;
      }
      
      // Geçici dosyayı sil
      fs.unlinkSync(file.path);
      
      logger.info(`Dosya yüklendi: ${file.originalname}, ID: ${fileId}`);
      
      res.status(201).json({
        message: 'Dosya başarıyla yüklendi',
        fileId,
        fileName: file.originalname,
        fileType: ext.substring(1), // .alt -> alt
        size: file.size,
        metadata: fileMetadata
      });
    } catch (error) {
      // Hata durumunda geçici dosyayı sil
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/files/alt/{fileId}:
 *   get:
 *     summary: Alt dosyasını indirir
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dosya başarıyla indirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Dosya bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/alt/:fileId', 
  requireResourcePermission('files', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const fileId = req.params.fileId;
    
    logger.info(`Alt dosyası indiriliyor: ${fileId}`);
    const fileData = await req.services?.segmentation.getAltFile(fileId);
    
    if (!fileData || !fileData.content) {
      throw new NotFoundError('Dosya bulunamadı');
    }
    
    // Dosya adını belirle
    const fileName = fileData.metadata?.originalName || `${fileId}.alt`;
    
    // Dosya içeriğini gönder
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileData.content);
  })
);

/**
 * @swagger
 * /api/files/last/{fileId}:
 *   get:
 *     summary: Last dosyasını indirir
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dosya başarıyla indirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Dosya bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/last/:fileId', 
  requireResourcePermission('files', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const fileId = req.params.fileId;
    
    logger.info(`Last dosyası indiriliyor: ${fileId}`);
    const fileData = await req.services?.runner.getLastFile(fileId);
    
    if (!fileData || !fileData.content) {
      throw new NotFoundError('Dosya bulunamadı');
    }
    
    // Dosya adını belirle
    const fileName = fileData.metadata?.originalName || `${fileId}.last`;
    
    // Dosya içeriğini gönder
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileData.content);
  })
);

/**
 * @swagger
 * /api/files/atlas/{fileId}:
 *   get:
 *     summary: Atlas dosyasını indirir
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dosya başarıyla indirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Dosya bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/atlas/:fileId', 
  requireResourcePermission('files', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const fileId = req.params.fileId;
    
    logger.info(`Atlas dosyası indiriliyor: ${fileId}`);
    const fileData = await req.services?.archive.getAtlasFile(fileId);
    
    if (!fileData || !fileData.content) {
      throw new NotFoundError('Dosya bulunamadı');
    }
    
    // Dosya adını belirle
    const fileName = fileData.metadata?.originalName || `${fileId}.atlas`;
    
    // Dosya içeriğini gönder
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileData.content);
  })
);

/**
 * @swagger
 * /api/files/list:
 *   get:
 *     summary: Dosyaları listeler
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [alt, last, atlas]
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
 *     responses:
 *       200:
 *         description: Dosyalar başarıyla listelendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/list', 
  requireResourcePermission('files', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!type || !['alt', 'last', 'atlas'].includes(type)) {
      throw new BadRequestError('Geçerli bir dosya tipi belirtilmelidir (alt, last, atlas)');
    }
    
    // Kullanıcıya özel dosya listesi
    const query = {
      userId: req.user?.id,
      limit,
      offset
    };
    
    logger.info(`${type} dosyaları listeleniyor: ${JSON.stringify(query)}`);
    
    let files;
    if (type === 'alt') {
      files = await req.services?.segmentation.get('/api/files/alt/list', query);
    } else if (type === 'last') {
      files = await req.services?.runner.get('/api/files/last/list', query);
    } else if (type === 'atlas') {
      files = await req.services?.archive.get('/api/files/atlas/list', query);
    }
    
    res.json(files);
  })
);

/**
 * @swagger
 * /api/files/search:
 *   get:
 *     summary: Dosyaları arar
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *           enum: [alt, last, atlas]
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Arama sonuçları başarıyla getirildi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/search', 
  requireResourcePermission('files', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const type = req.query.type as string;
    const searchQuery = req.query.query as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!type || !['alt', 'last', 'atlas'].includes(type)) {
      throw new BadRequestError('Geçerli bir dosya tipi belirtilmelidir (alt, last, atlas)');
    }
    
    if (!searchQuery) {
      throw new BadRequestError('Arama sorgusu gereklidir');
    }
    
    // Kullanıcıya özel arama
    const query = {
      userId: req.user?.id,
      query: searchQuery,
      limit,
      offset
    };
    
    logger.info(`${type} dosyaları aranıyor: ${JSON.stringify(query)}`);
    
    let searchResults;
    if (type === 'alt') {
      searchResults = await req.services?.segmentation.get('/api/files/alt/search', query);
    } else if (type === 'last') {
      searchResults = await req.services?.runner.get('/api/files/last/search', query);
    } else if (type === 'atlas') {
      searchResults = await req.services?.archive.searchAtlasFiles(query);
    }
    
    res.json(searchResults);
  })
);

/**
 * @swagger
 * /api/files/metadata/{type}/{fileId}:
 *   get:
 *     summary: Dosya metadata'sını getirir
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [alt, last, atlas]
 *       - name: fileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Metadata başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Dosya bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/metadata/:type/:fileId', 
  requireResourcePermission('files', 'read'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const type = req.params.type;
    const fileId = req.params.fileId;
    
    if (!['alt', 'last', 'atlas'].includes(type)) {
      throw new BadRequestError('Geçerli bir dosya tipi belirtilmelidir (alt, last, atlas)');
    }
    
    logger.info(`${type} dosyası metadata'sı getiriliyor: ${fileId}`);
    
    let metadata;
    if (type === 'alt') {
      const fileData = await req.services?.segmentation.get(`/api/files/alt/${fileId}/metadata`);
      metadata = fileData?.metadata;
    } else if (type === 'last') {
      const fileData = await req.services?.runner.get(`/api/files/last/${fileId}/metadata`);
      metadata = fileData?.metadata;
    } else if (type === 'atlas') {
      const fileData = await req.services?.archive.get(`/api/files/atlas/${fileId}/metadata`);
      metadata = fileData?.metadata;
    }
    
    if (!metadata) {
      throw new NotFoundError('Dosya metadata\'sı bulunamadı');
    }
    
    res.json(metadata);
  })
);

/**
 * @swagger
 * /api/files/metadata/{type}/{fileId}:
 *   put:
 *     summary: Dosya metadata'sını günceller
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [alt, last, atlas]
 *       - name: fileId
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
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Metadata başarıyla güncellendi
 *       400:
 *         description: Geçersiz istek
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Dosya bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/metadata/:type/:fileId', 
  requireResourcePermission('files', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const type = req.params.type;
    const fileId = req.params.fileId;
    const { metadata } = req.body;
    
    if (!['alt', 'last', 'atlas'].includes(type)) {
      throw new BadRequestError('Geçerli bir dosya tipi belirtilmelidir (alt, last, atlas)');
    }
    
    if (!metadata || typeof metadata !== 'object') {
      throw new BadRequestError('Geçerli bir metadata nesnesi gereklidir');
    }
    
    logger.info(`${type} dosyası metadata'sı güncelleniyor: ${fileId}`);
    
    let updatedMetadata;
    if (type === 'alt') {
      updatedMetadata = await req.services?.segmentation.put(`/api/files/alt/${fileId}/metadata`, { metadata });
    } else if (type === 'last') {
      updatedMetadata = await req.services?.runner.put(`/api/files/last/${fileId}/metadata`, { metadata });
    } else if (type === 'atlas') {
      updatedMetadata = await req.services?.archive.put(`/api/files/atlas/${fileId}/metadata`, { metadata });
    }
    
    if (!updatedMetadata) {
      throw new NotFoundError('Dosya bulunamadı veya metadata güncellenemedi');
    }
    
    res.json(updatedMetadata);
  })
);

/**
 * @swagger
 * /api/files/{type}/{fileId}:
 *   delete:
 *     summary: Dosyayı siler
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [alt, last, atlas]
 *       - name: fileId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dosya başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetki hatası
 *       404:
 *         description: Dosya bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:type/:fileId', 
  requireResourcePermission('files', 'write'),
  asyncHandler(async (req: Request, res: Response) => { // Added types
    const type = req.params.type;
    const fileId = req.params.fileId;
    
    if (!['alt', 'last', 'atlas'].includes(type)) {
      throw new BadRequestError('Geçerli bir dosya tipi belirtilmelidir (alt, last, atlas)');
    }
    
    logger.info(`${type} dosyası siliniyor: ${fileId}`);
    
    let deleteResult;
    if (type === 'alt') {
      deleteResult = await req.services?.segmentation.delete(`/api/files/alt/${fileId}`);
    } else if (type === 'last') {
      deleteResult = await req.services?.runner.delete(`/api/files/last/${fileId}`);
    } else if (type === 'atlas') {
      deleteResult = await req.services?.archive.delete(`/api/files/atlas/${fileId}`);
    }
    
    if (!deleteResult || !deleteResult.deleted) {
      throw new NotFoundError('Dosya bulunamadı veya silinemedi');
    }
    
    res.json({ message: 'Dosya başarıyla silindi' });
  })
);

export default router;

