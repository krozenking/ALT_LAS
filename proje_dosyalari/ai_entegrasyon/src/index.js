/**
 * ALT_LAS Entegrasyon Modülü Ana Dosyası
 *
 * ALT_LAS Çoklu AI Entegrasyon Modülü
 * Bu modül, farklı AI modellerine bağlantı kurma, model seçimi ve paralel sorgu işleme özelliklerini sağlar.
 */

const AIIntegrationService = require('./services/AIIntegrationService');
const ConfigManager = require('./config/ConfigManager');
const AIUtils = require('./utils/AIUtils');

// Model adaptörleri
const ModelAdapter = require('./models/ModelAdapter');
const OpenAIAdapter = require('./models/OpenAIAdapter');

/**
 * Entegrasyon modülünü başlatır
 * @param {Object} config - Başlangıç yapılandırması
 * @returns {Object} - Entegrasyon API'si
 */
function initializeAIIntegration(config = {}) {
  // Yapılandırma yöneticisini oluştur
  const configManager = new ConfigManager(config);

  // AI entegrasyon servisini oluştur
  const integrationService = new AIIntegrationService(config);

  // API'yi döndür
  return {
    /**
     * Servisi başlatır
     * @returns {Promise<boolean>} - Başlatma başarılı ise true döner
     */
    async initialize() {
      return await integrationService.initialize();
    },

    /**
     * Aktif modele sorgu gönderir
     * @param {string} prompt - Kullanıcı girdisi
     * @param {Array} context - Önceki mesajlar (bağlam)
     * @param {Object} options - Sorgu seçenekleri
     * @returns {Promise<Object>} - Model yanıtı
     */
    async query(prompt, context = [], options = {}) {
      return await integrationService.query(prompt, context, options);
    },

    /**
     * Birden fazla modele paralel sorgu gönderir
     * @param {string} prompt - Kullanıcı girdisi
     * @param {Array} context - Önceki mesajlar (bağlam)
     * @param {Array<string>} modelIds - Sorgu gönderilecek model ID'leri
     * @param {Object} options - Sorgu seçenekleri
     * @returns {Promise<Object>} - Model yanıtları
     */
    async parallelQuery(prompt, context = [], modelIds = [], options = {}) {
      return await integrationService.parallelQuery(prompt, context, modelIds, options);
    },

    /**
     * Yeni bir model kaydeder
     * @param {Object} modelConfig - Model yapılandırması
     * @returns {Promise<boolean>} - Kayıt başarılı ise true döner
     */
    async registerModel(modelConfig) {
      // Yapılandırmaya ekle
      configManager.addModelConfig(modelConfig);

      // Servise kaydet
      return await integrationService.registerModel(modelConfig);
    },

    /**
     * Aktif modeli değiştirir
     * @param {string} modelId - Model ID
     * @returns {boolean} - Değiştirme başarılı ise true döner
     */
    setActiveModel(modelId) {
      // Yapılandırmayı güncelle
      configManager.setDefaultModel(modelId);

      // Servisi güncelle
      return integrationService.setActiveModel(modelId);
    },

    /**
     * Kayıtlı tüm modellerin bilgilerini döndürür
     * @returns {Array<Object>} - Model bilgileri
     */
    getAvailableModels() {
      return integrationService.getAvailableModels();
    },

    /**
     * Aktif modelin bilgilerini döndürür
     * @returns {Object|null} - Model bilgileri
     */
    getActiveModelInfo() {
      return integrationService.getActiveModelInfo();
    },

    /**
     * Yapılandırmayı döndürür
     * @returns {Object} - Yapılandırma
     */
    getConfig() {
      return configManager.getConfig();
    },

    /**
     * Yapılandırmayı günceller
     * @param {string} key - Yapılandırma anahtarı
     * @param {any} value - Yeni değer
     */
    updateConfig(key, value) {
      configManager.set(key, value);
    },

    /**
     * Yanıt kalitesini değerlendirir
     * @param {string} response - AI yanıtı
     * @returns {Object} - Kalite metrikleri
     */
    evaluateResponse(response) {
      return AIUtils.evaluateResponseQuality(response);
    },

    /**
     * Farklı model yanıtlarını karşılaştırır
     * @param {Object} responses - Model yanıtları
     * @returns {Object} - Karşılaştırma sonuçları
     */
    compareResponses(responses) {
      return AIUtils.compareResponses(responses);
    },

    // Yardımcı sınıfları dışa aktar
    utils: AIUtils,

    // Versiyon bilgisi
    version: '0.1.0'
  };
}

module.exports = {
  initializeAIIntegration,
  ModelAdapter,
  OpenAIAdapter
};
