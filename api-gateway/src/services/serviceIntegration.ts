import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { ServiceError, NotFoundError } from '../utils/errors';
import { CircuitBreaker } from '../utils/circuitBreaker';

// Servis yapılandırması
interface ServiceConfig {
  baseUrl: string;
  timeout: number;
  retryCount: number;
  retryDelay: number;
  circuitBreakerOptions: {
    failureThreshold: number;
    resetTimeout: number;
  };
}

// Servis keşif mekanizması için arayüz
interface ServiceDiscovery {
  getServiceUrl(serviceName: string): Promise<string>;
  registerService(serviceName: string, url: string, metadata?: any): Promise<void>;
  deregisterService(serviceId: string): Promise<void>;
  getHealthStatus(serviceName: string): Promise<boolean>;
}

// Servis entegrasyonu için temel sınıf
class ServiceIntegration {
  protected config: ServiceConfig;
  protected circuitBreaker: CircuitBreaker;
  protected serviceDiscovery: ServiceDiscovery | null = null;

  constructor(config: ServiceConfig) {
    this.config = config;
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: config.circuitBreakerOptions.failureThreshold,
      resetTimeout: config.circuitBreakerOptions.resetTimeout,
      onOpen: () => {
        logger.warn(`Circuit breaker opened for service: ${this.constructor.name}`);
      },
      onClose: () => {
        logger.info(`Circuit breaker closed for service: ${this.constructor.name}`);
      },
      onHalfOpen: () => {
        logger.info(`Circuit breaker half-open for service: ${this.constructor.name}`);
      }
    });
  }

  // Servis keşif mekanizmasını ayarla
  setServiceDiscovery(serviceDiscovery: ServiceDiscovery): void {
    this.serviceDiscovery = serviceDiscovery;
  }

  // Servis URL'sini al (servis keşif mekanizması varsa kullan)
  protected async getServiceUrl(): Promise<string> {
    if (this.serviceDiscovery) {
      try {
        return await this.serviceDiscovery.getServiceUrl(this.constructor.name);
      } catch (error) {
        logger.warn(`Service discovery failed for ${this.constructor.name}, using default URL: ${error.message}`);
      }
    }
    return this.config.baseUrl;
  }

  // HTTP isteği gönder (yeniden deneme ve devre kesici ile)
  protected async sendRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      const baseUrl = await this.getServiceUrl();
      const url = `${baseUrl}${endpoint}`;
      
      let retries = 0;
      let lastError: Error | null = null;

      while (retries <= this.config.retryCount) {
        try {
          const response = await axios({
            method,
            url,
            data,
            headers: {
              'Content-Type': 'application/json',
              ...headers
            },
            timeout: this.config.timeout
          });

          return response.data;
        } catch (error) {
          lastError = error;
          
          // 4xx hataları için yeniden deneme yapma (istemci hatası)
          if (error.response && error.response.status >= 400 && error.response.status < 500) {
            throw error;
          }

          logger.warn(`Request to ${url} failed (attempt ${retries + 1}/${this.config.retryCount + 1}): ${error.message}`);
          
          if (retries < this.config.retryCount) {
            // Yeniden denemeden önce bekle
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
            retries++;
          } else {
            throw error;
          }
        }
      }

      // Bu noktaya ulaşılmamalı, ama TypeScript için gerekli
      throw lastError || new Error('Unknown error');
    });
  }

  // Servis sağlık kontrolü
  async healthCheck(): Promise<boolean> {
    try {
      if (this.serviceDiscovery) {
        return await this.serviceDiscovery.getHealthStatus(this.constructor.name);
      }

      const result = await this.sendRequest<{ status: string }>('GET', '/health');
      return result.status === 'ok';
    } catch (error) {
      logger.error(`Health check failed for ${this.constructor.name}: ${error.message}`);
      return false;
    }
  }
}

// Segmentation Service entegrasyonu
export class SegmentationService extends ServiceIntegration {
  constructor() {
    super({
      baseUrl: process.env.SEGMENTATION_SERVICE_URL || 'http://segmentation-service:3001',
      timeout: 10000,
      retryCount: 3,
      retryDelay: 1000,
      circuitBreakerOptions: {
        failureThreshold: 5,
        resetTimeout: 30000
      }
    });
  }

  // Komut segmentasyonu
  async segmentCommand(command: string, options: any = {}): Promise<any> {
    try {
      const result = await this.sendRequest<any>('POST', '/segment', {
        command,
        options
      });

      return result;
    } catch (error) {
      logger.error(`Segmentation failed: ${error.message}`);
      throw new ServiceError(`Segmentation service error: ${error.message}`);
    }
  }

  // Segmentasyon durumu sorgulama
  async getSegmentationStatus(segmentationId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('GET', `/segment/${segmentationId}`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`Segmentation process not found: ${segmentationId}`);
      }
      logger.error(`Failed to get segmentation status: ${error.message}`);
      throw new ServiceError(`Segmentation service error: ${error.message}`);
    }
  }

  // ALT dosyası alma
  async getAltFile(altFileId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('GET', `/files/alt/${altFileId}`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`ALT file not found: ${altFileId}`);
      }
      logger.error(`Failed to get ALT file: ${error.message}`);
      throw new ServiceError(`Segmentation service error: ${error.message}`);
    }
  }
}

// Runner Service entegrasyonu
export class RunnerService extends ServiceIntegration {
  constructor() {
    super({
      baseUrl: process.env.RUNNER_SERVICE_URL || 'http://runner-service:3002',
      timeout: 15000,
      retryCount: 2,
      retryDelay: 2000,
      circuitBreakerOptions: {
        failureThreshold: 3,
        resetTimeout: 60000
      }
    });
  }

  // Görev çalıştırma
  async runTask(altFileId: string, options: any = {}): Promise<any> {
    try {
      const result = await this.sendRequest<any>('POST', '/run', {
        altFileId,
        options
      });

      return result;
    } catch (error) {
      logger.error(`Task execution failed: ${error.message}`);
      throw new ServiceError(`Runner service error: ${error.message}`);
    }
  }

  // Görev durumu sorgulama
  async getTaskStatus(taskId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('GET', `/tasks/${taskId}`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`Task not found: ${taskId}`);
      }
      logger.error(`Failed to get task status: ${error.message}`);
      throw new ServiceError(`Runner service error: ${error.message}`);
    }
  }

  // Görev iptal etme
  async cancelTask(taskId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('POST', `/tasks/${taskId}/cancel`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`Task not found: ${taskId}`);
      }
      logger.error(`Failed to cancel task: ${error.message}`);
      throw new ServiceError(`Runner service error: ${error.message}`);
    }
  }

  // LAST dosyası alma
  async getLastFile(lastFileId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('GET', `/files/last/${lastFileId}`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`LAST file not found: ${lastFileId}`);
      }
      logger.error(`Failed to get LAST file: ${error.message}`);
      throw new ServiceError(`Runner service error: ${error.message}`);
    }
  }
}

// Archive Service entegrasyonu
export class ArchiveService extends ServiceIntegration {
  constructor() {
    super({
      baseUrl: process.env.ARCHIVE_SERVICE_URL || 'http://archive-service:3003',
      timeout: 8000,
      retryCount: 3,
      retryDelay: 1000,
      circuitBreakerOptions: {
        failureThreshold: 4,
        resetTimeout: 45000
      }
    });
  }

  // Arşivleme
  async archiveResult(lastFileId: string, metadata: any = {}): Promise<any> {
    try {
      const result = await this.sendRequest<any>('POST', '/archive', {
        lastFileId,
        metadata
      });

      return result;
    } catch (error) {
      logger.error(`Archiving failed: ${error.message}`);
      throw new ServiceError(`Archive service error: ${error.message}`);
    }
  }

  // Arşiv arama
  async searchArchive(query: any): Promise<any> {
    try {
      const result = await this.sendRequest<any>('POST', '/search', query);
      return result;
    } catch (error) {
      logger.error(`Archive search failed: ${error.message}`);
      throw new ServiceError(`Archive service error: ${error.message}`);
    }
  }

  // Arşiv öğesi alma
  async getArchiveItem(archiveId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('GET', `/items/${archiveId}`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`Archive item not found: ${archiveId}`);
      }
      logger.error(`Failed to get archive item: ${error.message}`);
      throw new ServiceError(`Archive service error: ${error.message}`);
    }
  }

  // ATLAS dosyası alma
  async getAtlasFile(atlasFileId: string): Promise<any> {
    try {
      const result = await this.sendRequest<any>('GET', `/files/atlas/${atlasFileId}`);
      return result;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundError(`ATLAS file not found: ${atlasFileId}`);
      }
      logger.error(`Failed to get ATLAS file: ${error.message}`);
      throw new ServiceError(`Archive service error: ${error.message}`);
    }
  }
}

// Servis keşif mekanizması implementasyonu
export class SimpleServiceDiscovery implements ServiceDiscovery {
  private services: Map<string, { url: string, metadata?: any, healthy: boolean }> = new Map();

  // Servis URL'sini al
  async getServiceUrl(serviceName: string): Promise<string> {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service not found: ${serviceName}`);
    }
    if (!service.healthy) {
      throw new Error(`Service is unhealthy: ${serviceName}`);
    }
    return service.url;
  }

  // Servis kaydet
  async registerService(serviceName: string, url: string, metadata?: any): Promise<void> {
    this.services.set(serviceName, { url, metadata, healthy: true });
    logger.info(`Service registered: ${serviceName} at ${url}`);
  }

  // Servis kaydını sil
  async deregisterService(serviceId: string): Promise<void> {
    this.services.delete(serviceId);
    logger.info(`Service deregistered: ${serviceId}`);
  }

  // Servis sağlık durumunu al
  async getHealthStatus(serviceName: string): Promise<boolean> {
    const service = this.services.get(serviceName);
    return service ? service.healthy : false;
  }

  // Servis sağlık durumunu güncelle
  updateHealthStatus(serviceName: string, healthy: boolean): void {
    const service = this.services.get(serviceName);
    if (service) {
      service.healthy = healthy;
      this.services.set(serviceName, service);
      logger.info(`Service health status updated: ${serviceName} is ${healthy ? 'healthy' : 'unhealthy'}`);
    }
  }
}

// Servis örnekleri
export const serviceDiscovery = new SimpleServiceDiscovery();
export const segmentationService = new SegmentationService();
export const runnerService = new RunnerService();
export const archiveService = new ArchiveService();

// Servis keşif mekanizmasını ayarla
segmentationService.setServiceDiscovery(serviceDiscovery);
runnerService.setServiceDiscovery(serviceDiscovery);
archiveService.setServiceDiscovery(serviceDiscovery);

// Varsayılan servis URL'lerini kaydet
serviceDiscovery.registerService('SegmentationService', process.env.SEGMENTATION_SERVICE_URL || 'http://segmentation-service:3001');
serviceDiscovery.registerService('RunnerService', process.env.RUNNER_SERVICE_URL || 'http://runner-service:3002');
serviceDiscovery.registerService('ArchiveService', process.env.ARCHIVE_SERVICE_URL || 'http://archive-service:3003');

export default {
  segmentationService,
  runnerService,
  archiveService,
  serviceDiscovery
};
