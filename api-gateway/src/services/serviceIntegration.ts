import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { ServiceUnavailableError, BadRequestError } from '../utils/errors';
import logger from "../utils/logger";
import serviceDiscovery from "./serviceDiscovery"; // Import service discovery

// Circuit breaker durumları
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// Circuit breaker yapılandırması
interface CircuitBreakerConfig {
  failureThreshold: number;      // Kaç hata sonrası devre açılacak
  resetTimeout: number;          // Devre açıkken ne kadar süre sonra yarı açık duruma geçilecek (ms)
  halfOpenSuccessThreshold: number; // Yarı açık durumda kaç başarılı istek sonrası devre kapanacak
  requestTimeout: number;        // İstek zaman aşımı süresi (ms)
  monitorInterval: number;       // Durum izleme aralığı (ms)
}

// Servis entegrasyonu için temel sınıf
export class ServiceIntegration {
  private baseUrl: string;
  private serviceName: string;
  private circuitState: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastStateChange: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(
    serviceName: string,
    // baseUrl: string, // Removed: Get dynamically from serviceDiscovery
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.serviceName = serviceName;
    // this.baseUrl = baseUrl; // Removed
    
    // Varsayılan yapılandırma ile kullanıcı yapılandırmasını birleştir
    this.config = {
      failureThreshold: 5,
      resetTimeout: 30000,        // 30 saniye
      halfOpenSuccessThreshold: 2,
      requestTimeout: 5000,       // 5 saniye
      monitorInterval: 60000,     // 1 dakika
      ...config
    };

    // Durum izleme başlat
    setInterval(() => this.monitorCircuitState(), this.config.monitorInterval);
    
    // Log the service name, URL will be fetched dynamically
    logger.info(`${this.serviceName} entegrasyonu başlatıldı (URL dinamik olarak alınacak)`);
  }

  /**
   * HTTP GET isteği gönderir
   * @param path Endpoint yolu
   * @param params Query parametreleri
   * @param headers HTTP başlıkları
   * @returns Yanıt verisi
   */
  async get<T = any>(
    path: string, 
    params: Record<string, any> = {}, 
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T>('GET', path, undefined, params, headers);
  }

  /**
   * HTTP POST isteği gönderir
   * @param path Endpoint yolu
   * @param data İstek gövdesi
   * @param params Query parametreleri
   * @param headers HTTP başlıkları
   * @returns Yanıt verisi
   */
  async post<T = any>(
    path: string, 
    data: any, 
    params: Record<string, any> = {}, 
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T>('POST', path, data, params, headers);
  }

  /**
   * HTTP PUT isteği gönderir
   * @param path Endpoint yolu
   * @param data İstek gövdesi
   * @param params Query parametreleri
   * @param headers HTTP başlıkları
   * @returns Yanıt verisi
   */
  async put<T = any>(
    path: string, 
    data: any, 
    params: Record<string, any> = {}, 
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T>('PUT', path, data, params, headers);
  }

  /**
   * HTTP DELETE isteği gönderir
   * @param path Endpoint yolu
   * @param params Query parametreleri
   * @param headers HTTP başlıkları
   * @returns Yanıt verisi
   */
  async delete<T = any>(
    path: string, 
    params: Record<string, any> = {}, 
    headers: Record<string, string> = {}
  ): Promise<T> {
    return this.request<T>('DELETE', path, undefined, params, headers);
  }

  /**
   * HTTP isteği gönderir (temel metod)
   * @param method HTTP metodu
   * @param path Endpoint yolu
   * @param data İstek gövdesi
   * @param params Query parametreleri
   * @param headers HTTP başlıkları
   * @returns Yanıt verisi
   */
  private async request<T = any>(
    method: string, 
    path: string, 
    data?: any, 
    params: Record<string, any> = {}, 
    headers: Record<string, string> = {}
  ): Promise<T> {
    // Circuit breaker durumunu kontrol et
    if (this.circuitState === 'OPEN') {
      const timeSinceLastStateChange = Date.now() - this.lastStateChange;
      
      if (timeSinceLastStateChange < this.config.resetTimeout) {
        logger.warn(`${this.serviceName} devresi açık, istek engellendi: ${method} ${path}`);
        throw new ServiceUnavailableError(`${this.serviceName} servisine şu anda erişilemiyor`);
      } else {
        // Yarı açık duruma geç
        this.transitionToState('HALF_OPEN');
      }
    }

    try {
      // Get the current base URL from service discovery
      const baseUrl = serviceDiscovery.getServiceUrl(this.serviceName);
      const url = `${baseUrl}${path}`;
      
      logger.debug(`${this.serviceName} isteği: ${method} ${url}`);
      
      const response = await axios.request<T>({
        method,
        url,
        data,
        params,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: this.config.requestTimeout
      });

      // Başarılı istek
      this.onSuccess();
      
      return response.data;
    } catch (error: any) {
      return this.handleRequestError<T>(error, method, path);
    }
  }

  /**
   * İstek hatasını işler
   * @param error Hata nesnesi
   * @param method HTTP metodu
   * @param path Endpoint yolu
   * @returns Hata fırlatır
   */
  private handleRequestError<T>(error: any, method: string, path: string): never {
    // Başarısız istek
    this.onFailure();

    if (error.response) {
      // Sunucu yanıtı ile hata (4xx, 5xx)
      const status = error.response.status;
      const data = error.response.data;
      
      logger.warn(`${this.serviceName} yanıt hatası: ${method} ${path} - ${status}`);
      
      if (status >= 400 && status < 500) {
        throw new BadRequestError(data.message || `${this.serviceName} isteği geçersiz`);
      } else {
        throw new ServiceUnavailableError(data.message || `${this.serviceName} servisinde hata oluştu`);
      }
    } else if (error.request) {
      // Yanıt alınamadı (timeout, network error)
      logger.error(`${this.serviceName} yanıt alınamadı: ${method} ${path}`);
      throw new ServiceUnavailableError(`${this.serviceName} servisine erişilemiyor`);
    } else {
      // İstek oluşturulurken hata
      logger.error(`${this.serviceName} istek hatası: ${method} ${path} - ${error.message}`);
      throw new ServiceUnavailableError(`${this.serviceName} servisine istek gönderilirken hata oluştu`);
    }
  }

  /**
   * Başarılı istek sonrası işlemler
   */
  private onSuccess(): void {
    if (this.circuitState === 'HALF_OPEN') {
      this.successCount++;
      
      if (this.successCount >= this.config.halfOpenSuccessThreshold) {
        this.transitionToState('CLOSED');
      }
    } else if (this.circuitState === 'CLOSED') {
      // Başarılı durumda hata sayacını sıfırla
      this.failureCount = 0;
    }
  }

  /**
   * Başarısız istek sonrası işlemler
   */
  private onFailure(): void {
    if (this.circuitState === 'CLOSED') {
      this.failureCount++;
      
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionToState('OPEN');
      }
    } else if (this.circuitState === 'HALF_OPEN') {
      this.transitionToState('OPEN');
    }
  }

  /**
   * Circuit breaker durumunu değiştirir
   * @param newState Yeni durum
   */
  private transitionToState(newState: CircuitState): void {
    if (this.circuitState !== newState) {
      logger.info(`${this.serviceName} devre durumu değişti: ${this.circuitState} -> ${newState}`);
      
      this.circuitState = newState;
      this.lastStateChange = Date.now();
      
      if (newState === 'CLOSED') {
        this.failureCount = 0;
        this.successCount = 0;
      } else if (newState === 'HALF_OPEN') {
        this.successCount = 0;
      }
    }
  }

  /**
   * Circuit breaker durumunu izler
   */
  private monitorCircuitState(): void {
    const currentState = this.circuitState;
    const timeSinceLastStateChange = Date.now() - this.lastStateChange;
    
    // OPEN durumunda belirli süre geçtiyse HALF_OPEN'a geç
    if (currentState === 'OPEN' && timeSinceLastStateChange >= this.config.resetTimeout) {
      this.transitionToState('HALF_OPEN');
      logger.info(`${this.serviceName} devresi yarı açık duruma geçti (timeout)`);
    }
    
    // Durum loglaması
    logger.debug(`${this.serviceName} devre durumu: ${this.circuitState}, Hata sayısı: ${this.failureCount}, Başarı sayısı: ${this.successCount}`);
  }

  /**
   * Servis sağlık kontrolü yapar
   * @returns Servis sağlıklı mı
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Servisin health endpoint'ine istek gönder
      await this.get('/health', {}, { 'X-Health-Check': 'true' });
      
      // Servis keşif yöneticisine sağlık durumunu bildir
      await serviceDiscovery.checkServiceHealth(this.serviceName);
      
      return true;
    } catch (error) {
      logger.warn(`${this.serviceName} sağlık kontrolü başarısız`);
      return false;
    }
  }

  /**
   * Servis durumunu döndürür
   * @returns Servis durumu
   */
  getStatus(): { 
    serviceName: string; 
    baseUrl: string; 
    circuitState: CircuitState; 
    failureCount: number;
    successCount: number;
    lastStateChange: number;
  } {
    return {
      serviceName: this.serviceName,
      baseUrl: this.baseUrl,
      circuitState: this.circuitState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: this.lastStateChange
    };
  }
}

// Segmentation Service entegrasyonu
export class SegmentationServiceIntegration extends ServiceIntegration {
  constructor() {
    super("SegmentationService");
  }

  /**
   * Komut segmentasyonu yapar
   * @param command Komut metni
   * @param options Segmentasyon seçenekleri
   * @returns Segmentasyon sonucu
   */
  async segmentCommand(command: string, options: Record<string, any> = {}): Promise<any> {
    return this.post('/api/segment', { command, options });
  }

  /**
   * Alt dosyası oluşturur
   * @param data Alt dosyası verisi
   * @returns Oluşturulan dosya bilgisi
   */
  async createAltFile(data: any): Promise<any> {
    return this.post('/api/files/alt', data);
  }

  /**
   * Alt dosyasını getirir
   * @param fileId Dosya ID
   * @returns Dosya içeriği
   */
  async getAltFile(fileId: string): Promise<any> {
    return this.get(`/api/files/alt/${fileId}`);
  }
}

// Runner Service entegrasyonu
export class RunnerServiceIntegration extends ServiceIntegration {
  constructor() {
    super("RunnerService");
  }

  /**
   * Komut çalıştırır
   * @param altFileId Alt dosyası ID
   * @param options Çalıştırma seçenekleri
   * @returns Çalıştırma sonucu
   */
  async runCommand(altFileId: string, options: Record<string, any> = {}): Promise<any> {
    return this.post('/api/run', { altFileId, options });
  }

  /**
   * Komut durumunu sorgular
   * @param runId Çalıştırma ID
   * @returns Komut durumu
   */
  async getCommandStatus(runId: string): Promise<any> {
    return this.get(`/api/status/${runId}`);
  }

  /**
   * Komutu iptal eder
   * @param runId Çalıştırma ID
   * @returns İptal sonucu
   */
  async cancelCommand(runId: string): Promise<any> {
    return this.post(`/api/cancel/${runId}`, {});
  }

  /**
   * Last dosyasını getirir
   * @param fileId Dosya ID
   * @returns Dosya içeriği
   */
  async getLastFile(fileId: string): Promise<any> {
    return this.get(`/api/files/last/${fileId}`);
  }
}

// Archive Service entegrasyonu
export class ArchiveServiceIntegration extends ServiceIntegration {
  constructor() {
    super("ArchiveService");
  }

  /**
   * Last dosyasını arşivler
   * @param lastFileId Last dosyası ID
   * @param metadata Metadata
   * @returns Arşivleme sonucu
   */
  async archiveLastFile(lastFileId: string, metadata: Record<string, any> = {}): Promise<any> {
    return this.post('/api/archive', { lastFileId, metadata });
  }

  /**
   * Atlas dosyasını getirir
   * @param fileId Dosya ID
   * @returns Dosya içeriği
   */
  async getAtlasFile(fileId: string): Promise<any> {
    return this.get(`/api/files/atlas/${fileId}`);
  }

  /**
   * Atlas dosyalarını arar
   * @param query Arama sorgusu
   * @returns Arama sonuçları
   */
  async searchAtlasFiles(query: Record<string, any>): Promise<any> {
    return this.get('/api/search', query);
  }
}

// Singleton instances
export const segmentationService = new SegmentationServiceIntegration();
export const runnerService = new RunnerServiceIntegration();
export const archiveService = new ArchiveServiceIntegration();

// Servis entegrasyonu middleware'i
export const withServiceIntegration = (req: Request, res: Response, next: NextFunction): void => {
  // Servisleri request nesnesine ekle
  req.services = {
    segmentation: segmentationService,
    runner: runnerService,
    archive: archiveService
  };
  
  next();
};

// Request nesnesine services özelliği eklemek için type extension
declare global {
  namespace Express {
    interface Request {
      services?: {
        segmentation: SegmentationServiceIntegration;
        runner: RunnerServiceIntegration;
        archive: ArchiveServiceIntegration;
      };
    }
  }
}

export default {
  segmentationService,
  runnerService,
  archiveService,
  withServiceIntegration
};
