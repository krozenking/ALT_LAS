import axios from 'axios';
import logger from '../utils/logger';

// Servis örneği bilgisi arayüzü
interface ServiceInstance {
  instanceId: string; // Benzersiz örnek ID (örn: baseUrl)
  serviceName: string; // Added serviceName
  baseUrl: string;
  version: string;
  status: "active" | "inactive" | "degraded";
  lastChecked: Date;
  healthEndpoint: string;
  metadata?: Record<string, any>;
}

// Servis kayıt bilgisi (artık örnek listesi içeriyor)
interface ServiceRegistration {
  serviceName: string;
  instances: ServiceInstance[];
  // Round-robin sayacı
  roundRobinCounter: number;
}

// Servis keşif yapılandırması
interface ServiceDiscoveryConfig {
  registryUrl?: string;           // Merkezi kayıt servisi URL'si (varsa)
  useRegistry: boolean;           // Merkezi kayıt servisi kullanılsın mı?
  healthCheckInterval: number;    // Sağlık kontrolü aralığı (ms)
  // Servis adı -> URL(ler) eşleştirmesi (virgülle ayrılmış olabilir)
  serviceUrls: Record<string, string>; 
}

/**
 * Servis keşif, sağlık kontrolü ve yük dengeleme yöneticisi
 */
class ServiceDiscoveryManager {
  private config: ServiceDiscoveryConfig;
  // Servis adı -> Servis Kaydı (örnek listesi ile)
  private services: Map<string, ServiceRegistration> = new Map();
  private healthCheckIntervalId?: NodeJS.Timeout;

  constructor(config: Partial<ServiceDiscoveryConfig> = {}) {
    // Varsayılan yapılandırma ile kullanıcı yapılandırmasını birleştir
    this.config = {
      registryUrl: process.env.SERVICE_REGISTRY_URL,
      useRegistry: process.env.USE_SERVICE_REGISTRY === 'true',
      healthCheckInterval: 60000, // 1 dakika
      serviceUrls: {
        'SegmentationService': process.env.SEGMENTATION_SERVICE_URL || 'http://segmentation-service:3001',
        'RunnerService': process.env.RUNNER_SERVICE_URL || 'http://runner-service:3002',
        'ArchiveService': process.env.ARCHIVE_SERVICE_URL || 'http://archive-service:3003'
      },
      ...config
    };

    // Servisleri başlangıç URL'leri ile kaydet
    this.initializeServices();

    // Sağlık kontrolü zamanlayıcısını başlat
    this.startHealthChecks();

    logger.info('Servis keşif yöneticisi başlatıldı');
  }

  /**
   * Servisleri başlangıç URL'leri ile başlatır
   */
  private initializeServices(): void {
    Object.entries(this.config.serviceUrls).forEach(([serviceName, urls]) => {
      const instanceUrls = urls.split(',').map(url => url.trim()).filter(url => url);
      
      const instances: ServiceInstance[] = instanceUrls.map(baseUrl => ({
        instanceId: baseUrl, // Use baseUrl as unique ID for now
        baseUrl,
        serviceName,
        version: 'unknown',
        status: 'inactive', // Başlangıçta inactive olarak işaretle
        lastChecked: new Date(),
        healthEndpoint: '/health'
      }));

      if (instances.length > 0) {
        this.services.set(serviceName, {
          serviceName,
          instances,
          roundRobinCounter: 0
        });
        logger.info(`${serviceName} için ${instances.length} örnek kaydedildi`);
      } else {
        logger.warn(`${serviceName} için geçerli URL bulunamadı: ${urls}`);
      }
    });

    logger.info(`${this.services.size} servis başlangıç URL'leri ile kaydedildi`);
  }

  /**
   * Periyodik sağlık kontrollerini başlatır
   */
  public startHealthChecks(): void {
    if (this.healthCheckIntervalId) {
      clearInterval(this.healthCheckIntervalId);
    }

    this.healthCheckIntervalId = setInterval(
      () => this.checkAllServicesHealth(),
      this.config.healthCheckInterval
    );

    logger.info(`Servis sağlık kontrolleri başlatıldı (${this.config.healthCheckInterval}ms aralıkla)`);
  }

  /**
   * Periyodik sağlık kontrollerini durdurur
   */
  public stopHealthChecks(): void {
    if (this.healthCheckIntervalId) {
      clearInterval(this.healthCheckIntervalId);
      this.healthCheckIntervalId = undefined;
      logger.info('Servis sağlık kontrolleri durduruldu');
    }
  }

  /**
   * Tüm servislerin sağlık durumunu kontrol eder
   */
  public async checkAllServicesHealth(): Promise<void> {
    logger.debug("Tüm servis örneklerinin sağlık kontrolü başlatılıyor");
    
    const checkPromises: Promise<boolean>[] = [];
    this.services.forEach(service => {
      service.instances.forEach(instance => {
        checkPromises.push(this.checkServiceInstanceHealth(instance));
      });
    });
    
    try {
      await Promise.all(checkPromises);
      logger.debug("Tüm servis örneklerinin sağlık kontrolü tamamlandı");
    } catch (error) {
      logger.error("Servis sağlık kontrolü sırasında hata:", error);
    }
  }

  /**
   * Belirli bir servis örneğinin sağlık durumunu kontrol eder
   * @param instance Servis örneği
   * @returns Sağlık durumu
   */
  public async checkServiceInstanceHealth(instance: ServiceInstance): Promise<boolean> {
    instance.lastChecked = new Date();
    
    try {
      const healthUrl = `${instance.baseUrl}${instance.healthEndpoint}`;
      logger.debug(`Servis örneği sağlık kontrolü: ${instance.serviceName} (${healthUrl})`);
      
      const response = await axios.get(healthUrl, {
        timeout: 5000,
        headers: { "X-Health-Check": "true" }
      });
      
      if (response.status === 200) {
        instance.status = "active";
        
        // Servis versiyonu ve diğer metadata bilgilerini güncelle (varsa)
        if (response.data && typeof response.data === "object") {
          if (response.data.version) {
            instance.version = response.data.version;
          }
          if (response.data.status === "degraded") {
            instance.status = "degraded";
          }
          if (response.data.metadata) {
            instance.metadata = response.data.metadata;
          }
        }
        
        logger.debug(`Servis örneği sağlıklı: ${instance.serviceName} (${instance.baseUrl} - ${instance.status})`);
        return true;
      } else {
        instance.status = "inactive";
        logger.warn(`Servis örneği sağlık kontrolü başarısız: ${instance.serviceName} (${instance.baseUrl}) - HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      instance.status = "inactive";
      logger.warn(`Servis örneği sağlık kontrolü hatası: ${instance.serviceName} (${instance.baseUrl}) - ${error.message}`);
      return false;
    }
  }

  /**
   * Servis URL'sini alır (Round-Robin yük dengeleme ile)
   * @param serviceName Servis adı
   * @returns Aktif bir servis örneğinin URL'si
   */
  public getServiceUrl(serviceName: string): string {
    const service = this.services.get(serviceName);
    
    if (!service || service.instances.length === 0) {
      // Servis veya örnek bulunamadı, yapılandırmadaki varsayılanı dene
      const defaultUrl = this.config.serviceUrls[serviceName]?.split(',')[0]?.trim();
      if (!defaultUrl) {
        logger.error(`Servis URL'si bulunamadı: ${serviceName}`);
        throw new Error(`Servis URL'si bulunamadı: ${serviceName}`);
      }
      logger.warn(`Servis kaydı bulunamadı, varsayılan URL kullanılıyor: ${serviceName} -> ${defaultUrl}`);
      return defaultUrl;
    }

    // Aktif veya en azından bozulmuş örnekleri filtrele (öncelik aktif)
    let healthyInstances = service.instances.filter(inst => inst.status === 'active');
    if (healthyInstances.length === 0) {
      healthyInstances = service.instances.filter(inst => inst.status === 'degraded');
    }

    if (healthyInstances.length === 0) {
      // Sağlıklı örnek yok, hata fırlat
      logger.error(`Aktif veya bozulmuş servis örneği bulunamadı: ${serviceName}`);
      throw new Error(`Aktif veya bozulmuş servis örneği bulunamadı: ${serviceName}`);
    }

    // Round-robin ile bir sonraki örneği seç
    const index = service.roundRobinCounter % healthyInstances.length;
    const selectedInstance = healthyInstances[index];
    
    // Sayacı artır
    service.roundRobinCounter = (service.roundRobinCounter + 1) % healthyInstances.length;

    logger.debug(`Round-robin seçimi: ${serviceName} -> ${selectedInstance.baseUrl}`);
    return selectedInstance.baseUrl;
  }

  /**
   * Servis durumunu alır
   * @param serviceName Servis adı
   * @returns Servis durumu
   */
  public getServiceStatus(serviceName: string): ServiceRegistration | undefined {
    return this.services.get(serviceName);
  }

  /**
   * Tüm servislerin durumunu alır
   * @returns Servis durumları
   */
  public getAllServicesStatus(): ServiceRegistration[] {
    return Array.from(this.services.values());
  }

  /**
   * Servis örneğini günceller veya ekler
   * @param serviceName Servis adı
   * @param instanceData Yeni örnek verisi (baseUrl zorunlu)
   */
  public updateServiceInstance(serviceName: string, instanceData: Partial<ServiceInstance> & { baseUrl: string }): void {
    let service = this.services.get(serviceName);
    const instanceId = instanceData.instanceId || instanceData.baseUrl; // Use baseUrl if no ID

    if (!service) {
      // Servis yoksa oluştur
      service = {
        serviceName,
        instances: [],
        roundRobinCounter: 0
      };
      this.services.set(serviceName, service);
      logger.info(`Yeni servis kaydı oluşturuldu: ${serviceName}`);
    }

    const existingInstanceIndex = service.instances.findIndex(inst => inst.instanceId === instanceId);

    if (existingInstanceIndex !== -1) {
      // Mevcut örneği güncelle
      const existingInstance = service.instances[existingInstanceIndex];
      const oldUrl = existingInstance.baseUrl;
      Object.assign(existingInstance, instanceData, { instanceId }); // Update existing
      existingInstance.lastChecked = new Date(); // Reset check time on update
      if (oldUrl !== existingInstance.baseUrl) {
          logger.info(`Servis örneği URL'si güncellendi: ${serviceName} (${instanceId}) - ${oldUrl} -> ${existingInstance.baseUrl}`);
      }
      logger.debug(`Servis örneği güncellendi: ${serviceName} (${instanceId})`);
      // Sağlık durumunu hemen kontrol et
      this.checkServiceInstanceHealth(existingInstance).catch(error => {
        logger.error(`Servis örneği güncellemesi sonrası sağlık kontrolü hatası: ${serviceName} (${instanceId})`, error);
      });
    } else {
      // Yeni örnek ekle
      const newInstance: ServiceInstance = {
        instanceId,
        baseUrl: instanceData.baseUrl,
        serviceName,
        version: instanceData.version || 'unknown',
        status: instanceData.status || 'inactive',
        lastChecked: new Date(),
        healthEndpoint: instanceData.healthEndpoint || '/health',
        metadata: instanceData.metadata
      };
      service.instances.push(newInstance);
      logger.info(`Yeni servis örneği eklendi: ${serviceName} (${instanceId}) - ${newInstance.baseUrl}`);
      // Sağlık durumunu hemen kontrol et
      this.checkServiceInstanceHealth(newInstance).catch(error => {
        logger.error(`Yeni servis örneği sonrası sağlık kontrolü hatası: ${serviceName} (${instanceId})`, error);
      });
    }
  }

  /**
   * Merkezi kayıt servisinden servisleri günceller
   * @returns Başarılı mı?
   */
  public async refreshFromRegistry(): Promise<boolean> {
    if (!this.config.useRegistry || !this.config.registryUrl) {
      logger.debug("Merkezi kayıt servisi kullanılmıyor");
      return false;
    }
    
    try {
      logger.info(`Merkezi kayıt servisinden servisler güncelleniyor: ${this.config.registryUrl}`);
      
      // Assuming registry returns a list of services, each with a list of instances
      // Example registry response: [{ serviceName: "ServiceA", instances: [{ instanceId: "a1", baseUrl: "..." }, ...] }, ...]
      const response = await axios.get<{ serviceName: string; instances: Partial<ServiceInstance>[] }[]>(`${this.config.registryUrl}/services`, {
        timeout: 5000
      });
      
      if (response.status === 200 && Array.isArray(response.data)) {
        // Keep track of services/instances received from registry
        const registryServices = new Map<string, Set<string>>();

        // Kayıt servisinden gelen verileri işle
        response.data.forEach((registryService) => {
          if (registryService.serviceName && Array.isArray(registryService.instances)) {
            const instanceIds = new Set<string>();
            registryServices.set(registryService.serviceName, instanceIds);

            registryService.instances.forEach((instanceData) => {
              if (instanceData.baseUrl) {
                const instanceId = instanceData.instanceId || instanceData.baseUrl;
                instanceIds.add(instanceId);
                // Update or add the instance
                this.updateServiceInstance(registryService.serviceName, { ...instanceData, baseUrl: instanceData.baseUrl, instanceId });
              }
            });
          }
        });

        // Remove instances that are no longer in the registry
        this.services.forEach((service, serviceName) => {
          const registryInstanceIds = registryServices.get(serviceName);
          if (registryInstanceIds) {
            service.instances = service.instances.filter(instance => {
              if (!registryInstanceIds.has(instance.instanceId)) {
                logger.info(`Kayıt defterinden kaldırılan servis örneği: ${serviceName} (${instance.instanceId})`);
                return false;
              }
              return true;
            });
            // Remove service if no instances left
            if (service.instances.length === 0) {
              this.services.delete(serviceName);
              logger.info(`Kayıt defterinden kaldırılan servis: ${serviceName} (örnek kalmadı)`);
            }
          } else {
            // Service itself is not in the registry anymore
            this.services.delete(serviceName);
            logger.info(`Kayıt defterinden kaldırılan servis: ${serviceName}`);
          }
        });
        
        logger.info("Servisler merkezi kayıt servisinden güncellendi");
        return true;
      } else {
        logger.warn(`Merkezi kayıt servisi yanıtı geçersiz: HTTP ${response.status}`);
        return false;
      }
    } catch (error) {
      logger.error("Merkezi kayıt servisinden güncelleme hatası:", error);
      return false;
    }
  }
}

// Singleton instance
const serviceDiscovery = new ServiceDiscoveryManager();

export default serviceDiscovery;
