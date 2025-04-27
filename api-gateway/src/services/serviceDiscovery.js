/**
 * Service Discovery Module
 * 
 * Bu modül, mikroservisler arasında servis keşfi için kullanılır.
 * Basit bir bellek tabanlı servis kayıt ve keşif mekanizması sunar.
 * Üretim ortamında Consul, etcd veya Kubernetes gibi bir çözüm kullanılması önerilir.
 */

// Servis kayıtlarını tutacak nesne
const serviceRegistry = {
  services: {},
  
  /**
   * Servis kaydı ekler veya günceller
   * @param {string} name - Servis adı
   * @param {string} host - Servis host adresi
   * @param {number} port - Servis port numarası
   * @param {Object} metadata - Servis ile ilgili ek bilgiler
   * @returns {Object} Kayıt bilgileri
   */
  register(name, host, port, metadata = {}) {
    if (!name || !host || !port) {
      throw new Error('Service name, host and port are required');
    }
    
    const serviceId = `${name}-${host}-${port}`;
    const timestamp = Date.now();
    
    this.services[serviceId] = {
      id: serviceId,
      name,
      host,
      port,
      url: `http://${host}:${port}`,
      metadata,
      status: 'UP',
      registeredAt: timestamp,
      lastHeartbeat: timestamp
    };
    
    return this.services[serviceId];
  },
  
  /**
   * Servis kaydını kaldırır
   * @param {string} serviceId - Servis ID
   * @returns {boolean} İşlem başarılı mı
   */
  deregister(serviceId) {
    if (this.services[serviceId]) {
      delete this.services[serviceId];
      return true;
    }
    return false;
  },
  
  /**
   * Servis heartbeat'ini günceller
   * @param {string} serviceId - Servis ID
   * @returns {Object|null} Güncellenen servis bilgileri veya null
   */
  heartbeat(serviceId) {
    if (this.services[serviceId]) {
      this.services[serviceId].lastHeartbeat = Date.now();
      return this.services[serviceId];
    }
    return null;
  },
  
  /**
   * Belirli bir servis adına sahip tüm servisleri döndürür
   * @param {string} name - Servis adı
   * @returns {Array} Servis listesi
   */
  findByName(name) {
    return Object.values(this.services).filter(service => 
      service.name === name && service.status === 'UP'
    );
  },
  
  /**
   * Belirli bir servis adına sahip rastgele bir servis döndürür (basit load balancing)
   * @param {string} name - Servis adı
   * @returns {Object|null} Servis bilgileri veya null
   */
  findOne(name) {
    const services = this.findByName(name);
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
    return Object.values(this.services);
  },
  
  /**
   * Belirli bir süre heartbeat göndermeyen servisleri temizler
   * @param {number} timeout - Zaman aşımı süresi (ms)
   */
  cleanup(timeout = 30000) {
    const now = Date.now();
    Object.keys(this.services).forEach(serviceId => {
      const service = this.services[serviceId];
      if (now - service.lastHeartbeat > timeout) {
        if (service.status === 'UP') {
          service.status = 'DOWN';
        } else {
          delete this.services[serviceId];
        }
      }
    });
  }
};

// Düzenli olarak temizlik işlemi yap
setInterval(() => {
  serviceRegistry.cleanup();
}, 60000); // Her dakika

module.exports = serviceRegistry;
