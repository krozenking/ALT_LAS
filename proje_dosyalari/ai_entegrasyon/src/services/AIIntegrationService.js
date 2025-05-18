// ALT_LAS AI Entegrasyon Servisi

/**
 * Çoklu AI modellerini yöneten servis
 */
class AIIntegrationService {
  /**
   * AI Entegrasyon Servisini başlatır
   * @param {Object} config - Servis yapılandırması
   */
  constructor(config = {}) {
    this.adapters = new Map(); // Model adaptörleri
    this.activeModel = null; // Aktif model
    this.config = config;
    this.initialized = false;
  }
  
  /**
   * Servisi başlatır ve modelleri yükler
   * @returns {Promise<boolean>} - Başlatma başarılı ise true döner
   */
  async initialize() {
    try {
      // Yapılandırmadaki tüm modelleri yükle
      if (this.config.models && Array.isArray(this.config.models)) {
        for (const modelConfig of this.config.models) {
          await this.registerModel(modelConfig);
        }
      }
      
      // Varsayılan modeli aktif et
      if (this.config.defaultModel && this.adapters.has(this.config.defaultModel)) {
        this.activeModel = this.config.defaultModel;
      } else if (this.adapters.size > 0) {
        // İlk modeli varsayılan olarak ayarla
        this.activeModel = Array.from(this.adapters.keys())[0];
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('AI Entegrasyon Servisi başlatılamadı:', error);
      return false;
    }
  }
  
  /**
   * Yeni bir model adaptörü kaydeder
   * @param {Object} modelConfig - Model yapılandırması
   * @returns {Promise<boolean>} - Kayıt başarılı ise true döner
   */
  async registerModel(modelConfig) {
    try {
      if (!modelConfig.id || !modelConfig.type) {
        throw new Error('Model ID ve tipi gereklidir');
      }
      
      // Model adaptörünü yükle
      const AdapterClass = this._getAdapterClass(modelConfig.type);
      const adapter = new AdapterClass(modelConfig);
      
      // Modeli başlat
      await adapter.initialize();
      
      // Adaptörü kaydet
      this.adapters.set(modelConfig.id, adapter);
      
      console.log(`Model kaydedildi: ${modelConfig.id} (${modelConfig.type})`);
      return true;
    } catch (error) {
      console.error(`Model kaydedilemedi: ${modelConfig.id}`, error);
      return false;
    }
  }
  
  /**
   * Aktif modeli değiştirir
   * @param {string} modelId - Model ID
   * @returns {boolean} - Değiştirme başarılı ise true döner
   */
  setActiveModel(modelId) {
    if (!this.adapters.has(modelId)) {
      console.error(`Model bulunamadı: ${modelId}`);
      return false;
    }
    
    this.activeModel = modelId;
    console.log(`Aktif model değiştirildi: ${modelId}`);
    return true;
  }
  
  /**
   * Aktif modele sorgu gönderir
   * @param {string} prompt - Kullanıcı girdisi
   * @param {Array} context - Önceki mesajlar (bağlam)
   * @param {Object} options - Sorgu seçenekleri
   * @returns {Promise<Object>} - Model yanıtı
   */
  async query(prompt, context = [], options = {}) {
    if (!this.initialized) {
      throw new Error('Servis henüz başlatılmadı, önce initialize() çağrılmalıdır');
    }
    
    if (!this.activeModel) {
      throw new Error('Aktif model bulunamadı');
    }
    
    const adapter = this.adapters.get(this.activeModel);
    return await adapter.query(prompt, context, options);
  }
  
  /**
   * Birden fazla modele paralel sorgu gönderir
   * @param {string} prompt - Kullanıcı girdisi
   * @param {Array} context - Önceki mesajlar (bağlam)
   * @param {Array<string>} modelIds - Sorgu gönderilecek model ID'leri
   * @param {Object} options - Sorgu seçenekleri
   * @returns {Promise<Object>} - Model yanıtları
   */
  async parallelQuery(prompt, context = [], modelIds = [], options = {}) {
    if (!this.initialized) {
      throw new Error('Servis henüz başlatılmadı, önce initialize() çağrılmalıdır');
    }
    
    // Model ID'leri belirtilmemişse tüm modelleri kullan
    if (!modelIds || modelIds.length === 0) {
      modelIds = Array.from(this.adapters.keys());
    }
    
    // Geçersiz model ID'lerini filtrele
    modelIds = modelIds.filter(id => this.adapters.has(id));
    
    if (modelIds.length === 0) {
      throw new Error('Sorgu gönderilecek model bulunamadı');
    }
    
    // Tüm modellere paralel sorgu gönder
    const queryPromises = modelIds.map(modelId => {
      const adapter = this.adapters.get(modelId);
      return adapter.query(prompt, context, options)
        .then(response => ({ modelId, response }))
        .catch(error => ({ modelId, error: error.message }));
    });
    
    // Tüm yanıtları bekle
    const results = await Promise.all(queryPromises);
    
    // Sonuçları model ID'lerine göre grupla
    const responseMap = {};
    for (const result of results) {
      responseMap[result.modelId] = result.error ? { error: result.error } : result.response;
    }
    
    return {
      prompt,
      timestamp: Date.now(),
      results: responseMap
    };
  }
  
  /**
   * Kayıtlı tüm modellerin bilgilerini döndürür
   * @returns {Array<Object>} - Model bilgileri
   */
  getAvailableModels() {
    const models = [];
    
    for (const [id, adapter] of this.adapters.entries()) {
      const info = adapter.getModelInfo();
      models.push({
        id,
        name: info.name,
        version: info.version,
        capabilities: info.capabilities,
        ready: info.ready,
        isActive: id === this.activeModel
      });
    }
    
    return models;
  }
  
  /**
   * Aktif modelin bilgilerini döndürür
   * @returns {Object|null} - Model bilgileri
   */
  getActiveModelInfo() {
    if (!this.activeModel) {
      return null;
    }
    
    const adapter = this.adapters.get(this.activeModel);
    const info = adapter.getModelInfo();
    
    return {
      id: this.activeModel,
      name: info.name,
      version: info.version,
      capabilities: info.capabilities,
      ready: info.ready
    };
  }
  
  /**
   * Model adaptör sınıfını döndürür
   * @param {string} type - Model tipi
   * @returns {Class} - Adaptör sınıfı
   * @private
   */
  _getAdapterClass(type) {
    // Gerçek uygulamada dinamik olarak yüklenebilir
    switch (type.toLowerCase()) {
      case 'openai':
        return require('./models/OpenAIAdapter');
      case 'anthropic':
        // return require('./models/AnthropicAdapter');
        throw new Error('Anthropic adaptörü henüz uygulanmadı');
      case 'llama':
        // return require('./models/LlamaAdapter');
        throw new Error('Llama adaptörü henüz uygulanmadı');
      default:
        throw new Error(`Bilinmeyen model tipi: ${type}`);
    }
  }
}

module.exports = AIIntegrationService;
