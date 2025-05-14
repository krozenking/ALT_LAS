/**
 * Enhanced Service Discovery Module
 * 
 * Bu modül, mikroservisler arasında gelişmiş servis keşfi için kullanılır.
 * Bellek tabanlı servis kayıt ve keşif mekanizmasını genişletir ve HTTP sağlık kontrolü ekler.
 * Üretim ortamında Consul, etcd veya Kubernetes gibi bir çözüm ile entegre edilebilir.
 */

const axios = require('axios');
const serviceRegistry = require('./serviceDiscovery'); // Mevcut servis kayıt modülünü kullan

// Sağlık kontrolü için varsayılan ayarlar
const DEFAULT_HEALTH_CHECK_INTERVAL = 30000; // 30 saniye
const DEFAULT_HEALTH_CHECK_TIMEOUT = 5000; // 5 saniye
const DEFAULT_HEALTH_CHECK_PATH = '/health';
const DEFAULT_HEALTH_CHECK_RETRIES = 3;

// Sağlık kontrolü durumları
const HEALTH_STATUS = {
  UP: 'UP',
  DOWN: 'DOWN',
  UNKNOWN: 'UNKNOWN'
};

// Sağlık kontrolü zamanlamaları
const healthCheckTimers = {};

/**
 * Gelişmiş servis keşif modülü
 */
const enhancedServiceDiscovery = {
  /**
   * Servis kaydı ekler veya günceller ve sağlık kontrolünü başlatır
   * @param {string} name - Servis adı
   * @param {string} host - Servis host adresi
   * @param {number} port - Servis port numarası
   * @param {Object} metadata - Servis ile ilgili ek bilgiler
   * @param {Object} healthCheckOptions - Sağlık kontrolü seçenekleri
   * @returns {Object} Kayıt bilgileri
   */
  register(name, host, port, metadata = {}, healthCheckOptions = {}) {
    // Temel servis kaydını yap
    const service = serviceRegistry.register(name, host, port, {
      ...metadata,
      healthCheck: {
        status: HEALTH_STATUS.UNKNOWN,
        lastChecked: null,
        failureCount: 0
      }
    });

    // Sağlık kontrolü seçeneklerini ayarla
    const healthCheck = {
      interval: healthCheckOptions.interval || DEFAULT_HEALTH_CHECK_INTERVAL,
      timeout: healthCheckOptions.timeout || DEFAULT_HEALTH_CHECK_TIMEOUT,
      path: healthCheckOptions.path || DEFAULT_HEALTH_CHECK_PATH,
      retries: healthCheckOptions.retries || DEFAULT_HEALTH_CHECK_RETRIES
    };

    // Sağlık kontrolünü başlat
    this.startHealthCheck(service.id, healthCheck);

    return service;
  },

  /**
   * Servis kaydını kaldırır ve sağlık kontrolünü durdurur
   * @param {string} serviceId - Servis ID
   * @returns {boolean} İşlem başarılı mı
   */
  deregister(serviceId) {
    // Sağlık kontrolünü durdur
    this.stopHealthCheck(serviceId);

    // Servis kaydını kaldır
    return serviceRegistry.deregister(serviceId);
  },

  /**
   * Servis sağlık kontrolünü başlatır
   * @param {string} serviceId - Servis ID
   * @param {Object} options - Sağlık kontrolü seçenekleri
   */
  startHealthCheck(serviceId, options) {
    // Önceki sağlık kontrolü varsa durdur
    this.stopHealthCheck(serviceId);

    // Yeni sağlık kontrolü başlat
    const checkHealth = async () => {
      const service = serviceRegistry.services[serviceId];
      if (!service) {
        this.stopHealthCheck(serviceId);
        return;
      }

      try {
        // Servis sağlık durumunu kontrol et
        const response = await axios.get(`http://${service.host}:${service.port}${options.path}`, {
          timeout: options.timeout
        });

        // Başarılı yanıt kontrolü
        if (response.status === 200 && response.data && response.data.status === HEALTH_STATUS.UP) {
          // Servis sağlıklı
          service.metadata.healthCheck = {
            status: HEALTH_STATUS.UP,
            lastChecked: Date.now(),
            failureCount: 0
          };
          service.status = HEALTH_STATUS.UP;
        } else {
          // Başarılı yanıt ama servis sağlıklı değil
          this.handleHealthCheckFailure(service, options);
        }
      } catch (error) {
        // Bağlantı hatası
        this.handleHealthCheckFailure(service, options);
      }

      // Heartbeat'i güncelle
      serviceRegistry.heartbeat(serviceId);
    };

    // İlk kontrolü hemen yap
    checkHealth();

    // Periyodik kontrol için zamanlayıcı ayarla
    healthCheckTimers[serviceId] = setInterval(checkHealth, options.interval);
  },

  /**
   * Servis sağlık kontrolünü durdurur
   * @param {string} serviceId - Servis ID
   */
  stopHealthCheck(serviceId) {
    if (healthCheckTimers[serviceId]) {
      clearInterval(healthCheckTimers[serviceId]);
      delete healthCheckTimers[serviceId];
    }
  },

  /**
   * Sağlık kontrolü başarısızlığını işler
   * @param {Object} service - Servis nesnesi
   * @param {Object} options - Sağlık kontrolü seçenekleri
   */
  handleHealthCheckFailure(service, options) {
    service.metadata.healthCheck.failureCount++;
    service.metadata.healthCheck.lastChecked = Date.now();

    // Başarısızlık sayısı izin verilen yeniden deneme sayısını aştıysa
    if (service.metadata.healthCheck.failureCount > options.retries) {
      service.metadata.healthCheck.status = HEALTH_STATUS.DOWN;
      service.status = HEALTH_STATUS.DOWN;
    } else {
      service.metadata.healthCheck.status = HEALTH_STATUS.UNKNOWN;
    }
  },

  /**
   * Belirli bir servis adına sahip ve sağlıklı olan tüm servisleri döndürür
   * @param {string} name - Servis adı
   * @returns {Array} Servis listesi
   */
  findHealthyByName(name) {
    return Object.values(serviceRegistry.services).filter(service => 
      service.name === name && service.status === HEALTH_STATUS.UP
    );
  },

  /**
   * Belirli bir servis adına sahip ve sağlıklı olan rastgele bir servis döndürür
   * @param {string} name - Servis adı
   * @returns {Object|null} Servis bilgileri veya null
   */
  findOneHealthy(name) {
    const services = this.findHealthyByName(name);
    if (services.length === 0) return null;
    
    // Basit round-robin load balancing
    const randomIndex = Math.floor(Math.random() * services.length);
    return services[randomIndex];
  },

  /**
   * Tüm servisleri döndürür
   * @returns {Array} Tüm servisler
   */
  findAll() {
    return serviceRegistry.findAll();
  },

  /**
   * Tüm servislerin sağlık durumunu döndürür
   * @returns {Object} Servis sağlık durumları
   */
  getHealthStatus() {
    const services = this.findAll();
    const healthStatus = {
      total: services.length,
      up: 0,
      down: 0,
      unknown: 0,
      services: {}
    };

    services.forEach(service => {
      const status = service.metadata.healthCheck?.status || HEALTH_STATUS.UNKNOWN;
      
      // Toplam sayıları güncelle
      if (status === HEALTH_STATUS.UP) healthStatus.up++;
      else if (status === HEALTH_STATUS.DOWN) healthStatus.down++;
      else healthStatus.unknown++;

      // Servis detaylarını ekle
      healthStatus.services[service.id] = {
        name: service.name,
        status,
        lastChecked: service.metadata.healthCheck?.lastChecked || null,
        url: service.url
      };
    });

    return healthStatus;
  },

  /**
   * Tüm servislerin sağlık kontrolünü manuel olarak tetikler
   */
  async checkAllServicesHealth() {
    const services = this.findAll();
    const results = [];

    for (const service of services) {
      if (!service.metadata.healthCheck) continue;

      // Mevcut sağlık kontrolü ayarlarını al
      const options = {
        path: DEFAULT_HEALTH_CHECK_PATH,
        timeout: DEFAULT_HEALTH_CHECK_TIMEOUT,
        retries: DEFAULT_HEALTH_CHECK_RETRIES
      };

      try {
        // Servis sağlık durumunu kontrol et
        const response = await axios.get(`http://${service.host}:${service.port}${options.path}`, {
          timeout: options.timeout
        });

        // Başarılı yanıt kontrolü
        if (response.status === 200 && response.data && response.data.status === HEALTH_STATUS.UP) {
          // Servis sağlıklı
          service.metadata.healthCheck.status = HEALTH_STATUS.UP;
          service.metadata.healthCheck.lastChecked = Date.now();
          service.metadata.healthCheck.failureCount = 0;
          service.status = HEALTH_STATUS.UP;
        } else {
          // Başarılı yanıt ama servis sağlıklı değil
          this.handleHealthCheckFailure(service, options);
        }
      } catch (error) {
        // Bağlantı hatası
        this.handleHealthCheckFailure(service, options);
      }

      // Sonuçları ekle
      results.push({
        id: service.id,
        name: service.name,
        status: service.status,
        url: service.url
      });

      // Heartbeat'i güncelle
      serviceRegistry.heartbeat(service.id);
    }

    return results;
  }
};

// Düzenli olarak temizlik işlemi yap (mevcut serviceRegistry'nin temizlik işlemini kullan)
// Ek olarak, sağlık kontrolü olmayan servisler için varsayılan sağlık kontrolü başlat
setInterval(() => {
  const services = serviceRegistry.findAll();
  services.forEach(service => {
    if (!service.metadata.healthCheck) {
      service.metadata.healthCheck = {
        status: HEALTH_STATUS.UNKNOWN,
        lastChecked: null,
        failureCount: 0
      };
      
      // Varsayılan sağlık kontrolü başlat
      if (!healthCheckTimers[service.id]) {
        enhancedServiceDiscovery.startHealthCheck(service.id, {
          interval: DEFAULT_HEALTH_CHECK_INTERVAL,
          timeout: DEFAULT_HEALTH_CHECK_TIMEOUT,
          path: DEFAULT_HEALTH_CHECK_PATH,
          retries: DEFAULT_HEALTH_CHECK_RETRIES
        });
      }
    }
  });
}, 60000); // Her dakika

module.exports = enhancedServiceDiscovery;
