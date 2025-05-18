// ALT_LAS Yapılandırma Yöneticisi

/**
 * AI modelleri için yapılandırma yöneticisi
 */
class ConfigManager {
  /**
   * Yapılandırma yöneticisini başlatır
   * @param {Object} initialConfig - Başlangıç yapılandırması
   */
  constructor(initialConfig = {}) {
    this.config = {
      models: [],
      defaultModel: null,
      ...initialConfig
    };
    
    this.configPath = null;
  }
  
  /**
   * Yapılandırmayı yükler
   * @param {string} path - Yapılandırma dosyası yolu
   * @returns {Promise<Object>} - Yüklenen yapılandırma
   */
  async loadConfig(path) {
    try {
      // Gerçek uygulamada dosyadan yükleme yapılır
      // Bu örnekte simüle edilmiş bir yapılandırma döndürüyoruz
      this.configPath = path;
      
      // Örnek yapılandırma
      const loadedConfig = {
        models: [
          {
            id: 'openai-gpt4',
            type: 'openai',
            modelName: 'gpt-4',
            apiKey: 'sim_api_key',
            systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın.'
          },
          {
            id: 'openai-gpt35',
            type: 'openai',
            modelName: 'gpt-3.5-turbo',
            apiKey: 'sim_api_key',
            systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın.'
          }
        ],
        defaultModel: 'openai-gpt4',
        parallelQueryEnabled: true,
        maxParallelQueries: 3,
        contextLength: 10
      };
      
      this.config = loadedConfig;
      return this.config;
    } catch (error) {
      console.error('Yapılandırma yüklenemedi:', error);
      throw error;
    }
  }
  
  /**
   * Yapılandırmayı kaydeder
   * @param {string} path - Yapılandırma dosyası yolu (opsiyonel)
   * @returns {Promise<boolean>} - Kaydetme başarılı ise true döner
   */
  async saveConfig(path = null) {
    try {
      // Gerçek uygulamada dosyaya kaydetme yapılır
      this.configPath = path || this.configPath;
      
      if (!this.configPath) {
        throw new Error('Yapılandırma dosyası yolu belirtilmedi');
      }
      
      // Simüle edilmiş kaydetme işlemi
      console.log('Yapılandırma kaydedildi:', this.configPath);
      return true;
    } catch (error) {
      console.error('Yapılandırma kaydedilemedi:', error);
      return false;
    }
  }
  
  /**
   * Tüm yapılandırmayı döndürür
   * @returns {Object} - Yapılandırma
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Belirli bir yapılandırma değerini döndürür
   * @param {string} key - Yapılandırma anahtarı
   * @param {any} defaultValue - Varsayılan değer
   * @returns {any} - Yapılandırma değeri
   */
  get(key, defaultValue = null) {
    return key in this.config ? this.config[key] : defaultValue;
  }
  
  /**
   * Yapılandırma değerini günceller
   * @param {string} key - Yapılandırma anahtarı
   * @param {any} value - Yeni değer
   */
  set(key, value) {
    this.config[key] = value;
  }
  
  /**
   * Yeni bir model yapılandırması ekler
   * @param {Object} modelConfig - Model yapılandırması
   * @returns {boolean} - Ekleme başarılı ise true döner
   */
  addModelConfig(modelConfig) {
    if (!modelConfig.id || !modelConfig.type) {
      console.error('Model ID ve tipi gereklidir');
      return false;
    }
    
    // Aynı ID'ye sahip model varsa güncelle
    const existingIndex = this.config.models.findIndex(m => m.id === modelConfig.id);
    if (existingIndex >= 0) {
      this.config.models[existingIndex] = modelConfig;
    } else {
      this.config.models.push(modelConfig);
    }
    
    return true;
  }
  
  /**
   * Model yapılandırmasını kaldırır
   * @param {string} modelId - Model ID
   * @returns {boolean} - Kaldırma başarılı ise true döner
   */
  removeModelConfig(modelId) {
    const initialLength = this.config.models.length;
    this.config.models = this.config.models.filter(m => m.id !== modelId);
    
    // Varsayılan model kaldırıldıysa güncelle
    if (this.config.defaultModel === modelId) {
      this.config.defaultModel = this.config.models.length > 0 ? this.config.models[0].id : null;
    }
    
    return this.config.models.length < initialLength;
  }
  
  /**
   * Varsayılan modeli ayarlar
   * @param {string} modelId - Model ID
   * @returns {boolean} - Ayarlama başarılı ise true döner
   */
  setDefaultModel(modelId) {
    if (!this.config.models.some(m => m.id === modelId)) {
      console.error(`Model bulunamadı: ${modelId}`);
      return false;
    }
    
    this.config.defaultModel = modelId;
    return true;
  }
  
  /**
   * Tüm model yapılandırmalarını döndürür
   * @returns {Array<Object>} - Model yapılandırmaları
   */
  getModelConfigs() {
    return [...this.config.models];
  }
  
  /**
   * Belirli bir model yapılandırmasını döndürür
   * @param {string} modelId - Model ID
   * @returns {Object|null} - Model yapılandırması
   */
  getModelConfig(modelId) {
    return this.config.models.find(m => m.id === modelId) || null;
  }
}

module.exports = ConfigManager;
