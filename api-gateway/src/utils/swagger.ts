import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

/**
 * Swagger/OpenAPI yapılandırma seçenekleri
 */
interface SwaggerOptions {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
      license?: {
        name: string;
        url: string;
      };
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    components?: any;
    security?: any;
  };
  apis: string[];
}

/**
 * Swagger/OpenAPI entegrasyonu için yardımcı fonksiyonlar
 */
export class SwaggerService {
  private app: Express;
  private options: SwaggerOptions;
  private swaggerSpec: any;
  private yamlPath: string;

  /**
   * Swagger servisini başlatır
   * @param app Express uygulaması
   * @param yamlPath Swagger YAML dosyasının yolu (opsiyonel)
   */
  constructor(app: Express, yamlPath?: string) {
    this.app = app;
    this.yamlPath = yamlPath || path.join(process.cwd(), 'swagger.yaml');

    // Varsayılan Swagger seçenekleri
    this.options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'ALT_LAS API Gateway',
          version: '1.0.0',
          description: 'API Gateway for ALT_LAS project - Bilgisayar sistemlerini yapay zeka ile yönetmek için tasarlanmış platform',
          license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
          }
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server'
          },
          {
            url: 'https://api.alt-las.com',
            description: 'Production server'
          }
        ]
      },
      apis: ['./src/routes/*.ts', './src/models/*.ts']
    };

    // YAML dosyası varsa, onu kullan
    if (fs.existsSync(this.yamlPath)) {
      try {
        const swaggerDocument = YAML.load(this.yamlPath);
        this.swaggerSpec = swaggerDocument;
        logger.info(`Swagger YAML dosyası yüklendi: ${this.yamlPath}`);
      } catch (error) {
        logger.error(`Swagger YAML dosyası yüklenemedi: ${error}`);
        // YAML dosyası yüklenemezse, JSDoc kullan
        this.swaggerSpec = swaggerJsdoc(this.options);
      }
    } else {
      // YAML dosyası yoksa, JSDoc kullan
      logger.info('Swagger YAML dosyası bulunamadı, JSDoc kullanılıyor');
      this.swaggerSpec = swaggerJsdoc(this.options);
    }
  }

  /**
   * Swagger UI'ı yapılandırır ve rotaları ekler
   * @param routePath Swagger UI için rota yolu
   */
  setup(routePath: string = '/api-docs'): void {
    // Swagger UI
    this.app.use(
      routePath,
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'ALT_LAS API Gateway Documentation',
        customfavIcon: '/favicon.ico'
      })
    );

    // Swagger JSON endpoint
    this.app.get(`${routePath}.json`, (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.swaggerSpec);
    });

    logger.info(`Swagger UI kuruldu: ${routePath}`);
    logger.info(`Swagger JSON endpoint: ${routePath}.json`);
  }

  /**
   * Swagger şemasını günceller
   * @param newSpec Yeni Swagger şeması
   */
  updateSpec(newSpec: any): void {
    this.swaggerSpec = { ...this.swaggerSpec, ...newSpec };
    logger.info('Swagger şeması güncellendi');
  }

  /**
   * Swagger şemasını YAML dosyasına kaydeder
   * @param outputPath Çıktı dosyasının yolu (opsiyonel)
   */
  saveSpecToFile(outputPath?: string): void {
    const filePath = outputPath || this.yamlPath;
    try {
      const yamlString = YAML.stringify(this.swaggerSpec, 10, 2);
      fs.writeFileSync(filePath, yamlString, 'utf8');
      logger.info(`Swagger şeması dosyaya kaydedildi: ${filePath}`);
    } catch (error) {
      logger.error(`Swagger şeması dosyaya kaydedilemedi: ${error}`);
    }
  }

  /**
   * Swagger şemasını döndürür
   */
  getSpec(): any {
    return this.swaggerSpec;
  }
}

/**
 * Express uygulaması için Swagger entegrasyonu
 * @param app Express uygulaması
 * @param yamlPath Swagger YAML dosyasının yolu (opsiyonel)
 * @param routePath Swagger UI için rota yolu (opsiyonel)
 */
export const setupSwagger = (app: Express, yamlPath?: string, routePath: string = '/api-docs'): SwaggerService => {
  const swaggerService = new SwaggerService(app, yamlPath);
  swaggerService.setup(routePath);
  return swaggerService;
};

export default setupSwagger;
