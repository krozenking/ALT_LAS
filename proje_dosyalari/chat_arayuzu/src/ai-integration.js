// ALT_LAS Chat ve AI Entegrasyon Bağlantısı

/**
 * Bu modül, chat arayüzü ile AI entegrasyon modülü arasındaki bağlantıyı sağlar.
 * Chat arayüzünden gelen mesajları AI entegrasyon modülüne iletir ve yanıtları alır.
 */

// AI Entegrasyon modülünü içe aktar
const { initializeAIIntegration } = require('../../ai_entegrasyon/src/index.js');

// AI Entegrasyon API'sini başlat
let aiIntegration = null;
let availableModels = [];
let activeModel = null;
let isInitialized = false;

/**
 * AI Entegrasyon modülünü başlatır
 * @param {Object} config - Başlangıç yapılandırması
 * @returns {Promise<boolean>} - Başlatma başarılı ise true döner
 */
async function initializeAI(config = {}) {
  try {
    // AI Entegrasyon API'sini oluştur
    aiIntegration = initializeAIIntegration(config);
    
    // Servisi başlat
    const success = await aiIntegration.initialize();
    
    if (success) {
      // Mevcut modelleri al
      availableModels = aiIntegration.getAvailableModels();
      
      // Aktif model bilgisini al
      activeModel = aiIntegration.getActiveModelInfo();
      
      isInitialized = true;
      console.log('AI Entegrasyon başarıyla başlatıldı:', activeModel);
    } else {
      console.error('AI Entegrasyon başlatılamadı');
    }
    
    return success;
  } catch (error) {
    console.error('AI Entegrasyon başlatılırken hata oluştu:', error);
    return false;
  }
}

/**
 * AI modeline sorgu gönderir
 * @param {string} message - Kullanıcı mesajı
 * @param {Array} context - Mesaj geçmişi
 * @returns {Promise<Object>} - AI yanıtı
 */
async function queryAI(message, context = []) {
  if (!isInitialized || !aiIntegration) {
    throw new Error('AI Entegrasyon henüz başlatılmadı');
  }
  
  try {
    // AI'ya sorgu gönder
    const response = await aiIntegration.query(message, context);
    return response;
  } catch (error) {
    console.error('AI sorgusu sırasında hata oluştu:', error);
    throw error;
  }
}

/**
 * Birden fazla AI modeline paralel sorgu gönderir
 * @param {string} message - Kullanıcı mesajı
 * @param {Array} context - Mesaj geçmişi
 * @param {Array<string>} modelIds - Sorgu gönderilecek model ID'leri
 * @returns {Promise<Object>} - AI yanıtları
 */
async function parallelQueryAI(message, context = [], modelIds = []) {
  if (!isInitialized || !aiIntegration) {
    throw new Error('AI Entegrasyon henüz başlatılmadı');
  }
  
  try {
    // Birden fazla AI'ya paralel sorgu gönder
    const responses = await aiIntegration.parallelQuery(message, context, modelIds);
    
    // Yanıtları karşılaştır
    const comparison = aiIntegration.compareResponses(responses.results);
    
    return {
      responses: responses.results,
      comparison,
      timestamp: responses.timestamp
    };
  } catch (error) {
    console.error('Paralel AI sorgusu sırasında hata oluştu:', error);
    throw error;
  }
}

/**
 * Aktif AI modelini değiştirir
 * @param {string} modelId - Model ID
 * @returns {boolean} - Değiştirme başarılı ise true döner
 */
function changeAIModel(modelId) {
  if (!isInitialized || !aiIntegration) {
    throw new Error('AI Entegrasyon henüz başlatılmadı');
  }
  
  try {
    // Modelin varlığını kontrol et
    const modelExists = availableModels.some(model => model.id === modelId);
    if (!modelExists) {
      throw new Error(`Model bulunamadı: ${modelId}`);
    }
    
    // Aktif modeli değiştir
    const success = aiIntegration.setActiveModel(modelId);
    
    if (success) {
      // Aktif model bilgisini güncelle
      activeModel = aiIntegration.getActiveModelInfo();
      console.log('AI modeli değiştirildi:', activeModel);
    }
    
    return success;
  } catch (error) {
    console.error('AI modeli değiştirilirken hata oluştu:', error);
    return false;
  }
}

/**
 * Mevcut AI modellerini döndürür
 * @returns {Array<Object>} - Model bilgileri
 */
function getAvailableAIModels() {
  if (!isInitialized || !aiIntegration) {
    return [];
  }
  
  return availableModels;
}

/**
 * Aktif AI modelini döndürür
 * @returns {Object|null} - Model bilgisi
 */
function getActiveAIModel() {
  if (!isInitialized || !aiIntegration) {
    return null;
  }
  
  return activeModel;
}

// Dışa aktarılan fonksiyonlar
module.exports = {
  initializeAI,
  queryAI,
  parallelQueryAI,
  changeAIModel,
  getAvailableAIModels,
  getActiveAIModel
};
