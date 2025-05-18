// ALT_LAS OpenAI Model Adaptörü

const ModelAdapter = require('./ModelAdapter');

/**
 * OpenAI API için model adaptörü
 * @extends ModelAdapter
 */
class OpenAIAdapter extends ModelAdapter {
  /**
   * OpenAI adaptörünü başlatır
   * @param {Object} config - Model yapılandırması
   */
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.apiEndpoint = config.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
    this.modelName = config.modelName || 'gpt-4';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
  }
  
  /**
   * OpenAI modelini başlatır ve kullanıma hazır hale getirir
   * @returns {Promise<boolean>} - Başlatma başarılı ise true döner
   */
  async initialize() {
    try {
      // API anahtarını kontrol et
      if (!this.apiKey) {
        throw new Error('OpenAI API anahtarı gereklidir');
      }
      
      // API bağlantısını test et
      const status = await this.checkStatus();
      this.isReady = status.available;
      return this.isReady;
    } catch (error) {
      console.error('OpenAI modeli başlatılamadı:', error);
      this.isReady = false;
      return false;
    }
  }
  
  /**
   * OpenAI modeline sorgu gönderir ve yanıt alır
   * @param {string} prompt - Kullanıcı girdisi
   * @param {Array} context - Önceki mesajlar (bağlam)
   * @param {Object} options - Sorgu seçenekleri
   * @returns {Promise<Object>} - Model yanıtı
   */
  async query(prompt, context = [], options = {}) {
    if (!this.isReady) {
      throw new Error('Model henüz hazır değil, önce initialize() çağrılmalıdır');
    }
    
    try {
      // Mesaj geçmişini oluştur
      const messages = this._formatContext(context);
      
      // Kullanıcı mesajını ekle
      messages.push({
        role: 'user',
        content: prompt
      });
      
      // Sorgu seçeneklerini hazırla
      const queryOptions = {
        model: options.model || this.modelName,
        messages: messages,
        temperature: options.temperature || this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      };
      
      // API isteği gönder
      const response = await this._sendRequest(queryOptions);
      
      // Yanıtı işle ve döndür
      return this._processResponse(response);
    } catch (error) {
      console.error('OpenAI sorgusu başarısız:', error);
      throw error;
    }
  }
  
  /**
   * OpenAI modelinin yeteneklerini döndürür
   * @returns {Array<string>} - Model yetenekleri
   */
  getCapabilities() {
    return [
      'text-generation',
      'chat-completion',
      'context-awareness',
      'code-generation',
      'language-understanding'
    ];
  }
  
  /**
   * OpenAI modelinin durumunu kontrol eder
   * @returns {Promise<Object>} - Durum bilgisi
   */
  async checkStatus() {
    try {
      // Basit bir API isteği ile durumu kontrol et
      // Gerçek uygulamada OpenAI'nin durum API'si kullanılabilir
      
      // Simüle edilmiş durum kontrolü
      return {
        available: true,
        latency: 150, // ms
        quotaRemaining: 10000,
        message: 'Model kullanıma hazır'
      };
    } catch (error) {
      return {
        available: false,
        message: error.message
      };
    }
  }
  
  /**
   * Bağlam mesajlarını OpenAI formatına dönüştürür
   * @param {Array} context - Bağlam mesajları
   * @returns {Array} - OpenAI formatında mesajlar
   * @private
   */
  _formatContext(context) {
    const messages = [];
    
    // Sistem mesajı ekle (varsa)
    if (this.config.systemMessage) {
      messages.push({
        role: 'system',
        content: this.config.systemMessage
      });
    }
    
    // Bağlam mesajlarını ekle
    for (const message of context) {
      messages.push({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: message.content
      });
    }
    
    return messages;
  }
  
  /**
   * OpenAI API'sine istek gönderir
   * @param {Object} options - Sorgu seçenekleri
   * @returns {Promise<Object>} - API yanıtı
   * @private
   */
  async _sendRequest(options) {
    // Gerçek uygulamada fetch veya axios ile API isteği yapılır
    // Bu örnekte simüle edilmiş bir yanıt döndürüyoruz
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'chatcmpl-' + Math.random().toString(36).substring(2, 12),
          object: 'chat.completion',
          created: Date.now(),
          model: options.model,
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'Bu bir simüle edilmiş OpenAI yanıtıdır. Gerçek uygulamada API yanıtı burada olacaktır.'
              },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 50,
            completion_tokens: 30,
            total_tokens: 80
          }
        });
      }, 500);
    });
  }
  
  /**
   * API yanıtını işler
   * @param {Object} response - API yanıtı
   * @returns {Object} - İşlenmiş yanıt
   * @private
   */
  _processResponse(response) {
    if (!response.choices || response.choices.length === 0) {
      throw new Error('Geçersiz API yanıtı');
    }
    
    const choice = response.choices[0];
    
    return {
      content: choice.message.content,
      role: 'assistant',
      model: response.model,
      tokenUsage: response.usage,
      finishReason: choice.finish_reason,
      id: response.id
    };
  }
}

module.exports = OpenAIAdapter;
