// ALT_LAS AI Model Adaptör Arayüzü

/**
 * AI Model adaptörü için temel arayüz
 * Tüm model adaptörleri bu arayüzü uygulamalıdır
 */
class ModelAdapter {
  /**
   * Model adaptörünü başlatır
   * @param {Object} config - Model yapılandırması
   */
  constructor(config) {
    if (this.constructor === ModelAdapter) {
      throw new Error('ModelAdapter sınıfı doğrudan örneklenemez');
    }
    
    this.config = config;
    this.modelName = config.modelName || 'Bilinmeyen Model';
    this.modelVersion = config.modelVersion || '1.0';
    this.isReady = false;
  }
  
  /**
   * Modeli başlatır ve kullanıma hazır hale getirir
   * @returns {Promise<boolean>} - Başlatma başarılı ise true döner
   */
  async initialize() {
    throw new Error('initialize metodu uygulanmalıdır');
  }
  
  /**
   * Modele sorgu gönderir ve yanıt alır
   * @param {string} prompt - Kullanıcı girdisi
   * @param {Array} context - Önceki mesajlar (bağlam)
   * @param {Object} options - Sorgu seçenekleri
   * @returns {Promise<Object>} - Model yanıtı
   */
  async query(prompt, context = [], options = {}) {
    throw new Error('query metodu uygulanmalıdır');
  }
  
  /**
   * Model hakkında bilgi döndürür
   * @returns {Object} - Model bilgileri
   */
  getModelInfo() {
    return {
      name: this.modelName,
      version: this.modelVersion,
      capabilities: this.getCapabilities(),
      ready: this.isReady
    };
  }
  
  /**
   * Modelin yeteneklerini döndürür
   * @returns {Array<string>} - Model yetenekleri
   */
  getCapabilities() {
    throw new Error('getCapabilities metodu uygulanmalıdır');
  }
  
  /**
   * Modelin durumunu kontrol eder
   * @returns {Promise<Object>} - Durum bilgisi
   */
  async checkStatus() {
    throw new Error('checkStatus metodu uygulanmalıdır');
  }
}

module.exports = ModelAdapter;
