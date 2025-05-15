/**
 * Performance Monitoring Service
 * 
 * Bu servis, API Gateway'in performansını izlemek için kullanılır.
 * İstek süreleri, yanıt kodları ve diğer metrikleri toplar.
 * Gerçek bir üretim ortamında Prometheus veya benzeri bir sistem ile entegre edilebilir.
 */

// Performans metriklerini saklamak için basit bir bellek tabanlı depo
const metrics = {
  requests: {
    total: 0,
    byEndpoint: {},
    byMethod: {},
    byStatusCode: {}
  },
  responseTimes: {
    average: 0,
    min: Number.MAX_SAFE_INTEGER,
    max: 0,
    byEndpoint: {}
  },
  errors: {
    total: 0,
    byType: {}
  },
  serviceDiscovery: {
    requests: 0,
    failures: 0,
    serviceStatus: {}
  },
  startTime: Date.now()
};

/**
 * Performans izleme servisi
 */
const performanceMonitor = {
  /**
   * Express middleware olarak kullanılabilecek performans izleyici
   * @returns {Function} Express middleware
   */
  middleware() {
    return (req, res, next) => {
      // İstek başlangıç zamanını kaydet
      const startTime = Date.now();
      
      // Orijinal end metodunu sakla
      const originalEnd = res.end;
      
      // end metodunu override et
      res.end = function(...args) {
        // Yanıt süresini hesapla
        const responseTime = Date.now() - startTime;
        
        // Endpoint ve metod bilgilerini al
        const endpoint = req.originalUrl || req.url;
        const method = req.method;
        const statusCode = res.statusCode;
        
        // Metrikleri güncelle
        performanceMonitor.recordMetrics(endpoint, method, statusCode, responseTime);
        
        // Orijinal end metodunu çağır
        return originalEnd.apply(this, args);
      };
      
      next();
    };
  },
  
  /**
   * Metrikleri kaydet
   * @param {string} endpoint - İstek endpoint'i
   * @param {string} method - HTTP metodu
   * @param {number} statusCode - HTTP durum kodu
   * @param {number} responseTime - Yanıt süresi (ms)
   */
  recordMetrics(endpoint, method, statusCode, responseTime) {
    // Toplam istek sayısını artır
    metrics.requests.total++;
    
    // Endpoint bazında istek sayısını güncelle
    metrics.requests.byEndpoint[endpoint] = (metrics.requests.byEndpoint[endpoint] || 0) + 1;
    
    // Metod bazında istek sayısını güncelle
    metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
    
    // Durum kodu bazında istek sayısını güncelle
    metrics.requests.byStatusCode[statusCode] = (metrics.requests.byStatusCode[statusCode] || 0) + 1;
    
    // Yanıt süresi metriklerini güncelle
    if (responseTime < metrics.responseTimes.min) {
      metrics.responseTimes.min = responseTime;
    }
    
    if (responseTime > metrics.responseTimes.max) {
      metrics.responseTimes.max = responseTime;
    }
    
    // Ortalama yanıt süresini güncelle
    const totalRequests = metrics.requests.total;
    const currentAverage = metrics.responseTimes.average;
    metrics.responseTimes.average = ((currentAverage * (totalRequests - 1)) + responseTime) / totalRequests;
    
    // Endpoint bazında yanıt süresi metriklerini güncelle
    if (!metrics.responseTimes.byEndpoint[endpoint]) {
      metrics.responseTimes.byEndpoint[endpoint] = {
        count: 0,
        total: 0,
        average: 0,
        min: Number.MAX_SAFE_INTEGER,
        max: 0
      };
    }
    
    const endpointMetrics = metrics.responseTimes.byEndpoint[endpoint];
    endpointMetrics.count++;
    endpointMetrics.total += responseTime;
    endpointMetrics.average = endpointMetrics.total / endpointMetrics.count;
    
    if (responseTime < endpointMetrics.min) {
      endpointMetrics.min = responseTime;
    }
    
    if (responseTime > endpointMetrics.max) {
      endpointMetrics.max = responseTime;
    }
    
    // Hata metriklerini güncelle (4xx ve 5xx durum kodları)
    if (statusCode >= 400) {
      metrics.errors.total++;
      
      const errorType = statusCode >= 500 ? 'server' : 'client';
      metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
    }
  },
  
  /**
   * Servis keşfi metriklerini güncelle
   * @param {string} action - Yapılan işlem (request, failure)
   * @param {Object} serviceInfo - Servis bilgileri (opsiyonel)
   */
  recordServiceDiscovery(action, serviceInfo = null) {
    if (action === 'request') {
      metrics.serviceDiscovery.requests++;
    } else if (action === 'failure') {
      metrics.serviceDiscovery.failures++;
    }
    
    if (serviceInfo) {
      const { id, name, status } = serviceInfo;
      metrics.serviceDiscovery.serviceStatus[id] = { name, status, lastUpdated: Date.now() };
    }
  },
  
  /**
   * Tüm metrikleri getir
   * @returns {Object} Metrikler
   */
  getMetrics() {
    return {
      ...metrics,
      uptime: Date.now() - metrics.startTime
    };
  },
  
  /**
   * Özet metrikleri getir
   * @returns {Object} Özet metrikler
   */
  getSummary() {
    const errorRate = metrics.requests.total > 0 
      ? (metrics.errors.total / metrics.requests.total) * 100 
      : 0;
    
    return {
      uptime: Date.now() - metrics.startTime,
      totalRequests: metrics.requests.total,
      averageResponseTime: metrics.responseTimes.average.toFixed(2),
      minResponseTime: metrics.responseTimes.min === Number.MAX_SAFE_INTEGER ? 0 : metrics.responseTimes.min,
      maxResponseTime: metrics.responseTimes.max,
      errorRate: errorRate.toFixed(2),
      serviceDiscovery: {
        requests: metrics.serviceDiscovery.requests,
        failures: metrics.serviceDiscovery.failures,
        failureRate: metrics.serviceDiscovery.requests > 0 
          ? (metrics.serviceDiscovery.failures / metrics.serviceDiscovery.requests) * 100 
          : 0
      }
    };
  },
  
  /**
   * Belirli bir endpoint için metrikleri getir
   * @param {string} endpoint - İstek endpoint'i
   * @returns {Object} Endpoint metrikleri
   */
  getEndpointMetrics(endpoint) {
    return {
      requests: metrics.requests.byEndpoint[endpoint] || 0,
      responseTimes: metrics.responseTimes.byEndpoint[endpoint] || {
        count: 0,
        total: 0,
        average: 0,
        min: 0,
        max: 0
      }
    };
  },
  
  /**
   * Metrikleri sıfırla
   */
  resetMetrics() {
    Object.assign(metrics, {
      requests: {
        total: 0,
        byEndpoint: {},
        byMethod: {},
        byStatusCode: {}
      },
      responseTimes: {
        average: 0,
        min: Number.MAX_SAFE_INTEGER,
        max: 0,
        byEndpoint: {}
      },
      errors: {
        total: 0,
        byType: {}
      },
      serviceDiscovery: {
        requests: 0,
        failures: 0,
        serviceStatus: {}
      },
      startTime: Date.now()
    });
  }
};

module.exports = performanceMonitor;
