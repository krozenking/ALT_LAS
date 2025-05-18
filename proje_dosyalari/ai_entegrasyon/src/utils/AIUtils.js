// ALT_LAS Yardımcı Fonksiyonlar

/**
 * AI entegrasyon modülü için yardımcı fonksiyonlar
 */
class AIUtils {
  /**
   * Mesaj geçmişini standart formata dönüştürür
   * @param {Array} messages - Mesaj dizisi
   * @returns {Array} - Standartlaştırılmış mesajlar
   */
  static standardizeMessages(messages) {
    if (!Array.isArray(messages)) {
      return [];
    }
    
    return messages.map(msg => {
      // Temel mesaj yapısını kontrol et
      if (!msg || typeof msg !== 'object') {
        return null;
      }
      
      // Rol ve içerik alanlarını standartlaştır
      const role = this.standardizeRole(msg.role);
      const content = typeof msg.content === 'string' ? msg.content : '';
      
      if (!role || !content) {
        return null;
      }
      
      return { role, content };
    }).filter(msg => msg !== null);
  }
  
  /**
   * Mesaj rolünü standartlaştırır
   * @param {string} role - Orijinal rol
   * @returns {string} - Standartlaştırılmış rol
   */
  static standardizeRole(role) {
    if (!role || typeof role !== 'string') {
      return null;
    }
    
    const normalizedRole = role.toLowerCase().trim();
    
    // Standart roller: user, assistant, system
    if (['user', 'assistant', 'system'].includes(normalizedRole)) {
      return normalizedRole;
    }
    
    // Diğer rol eşleştirmeleri
    if (['human', 'kullanıcı', 'user_message'].includes(normalizedRole)) {
      return 'user';
    }
    
    if (['ai', 'bot', 'assistant_message', 'model'].includes(normalizedRole)) {
      return 'assistant';
    }
    
    if (['system_message', 'instruction'].includes(normalizedRole)) {
      return 'system';
    }
    
    return null;
  }
  
  /**
   * Mesaj içeriğini temizler ve formatlar
   * @param {string} content - Mesaj içeriği
   * @returns {string} - Temizlenmiş içerik
   */
  static cleanMessageContent(content) {
    if (typeof content !== 'string') {
      return '';
    }
    
    // Gereksiz boşlukları temizle
    let cleaned = content.trim();
    
    // Çoklu boşlukları tek boşluğa indir
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned;
  }
  
  /**
   * Token sayısını tahmin eder (yaklaşık)
   * @param {string} text - Metin
   * @returns {number} - Tahmini token sayısı
   */
  static estimateTokenCount(text) {
    if (typeof text !== 'string') {
      return 0;
    }
    
    // Basit bir tahmin: ortalama 4 karakter = 1 token
    // Gerçek uygulamada daha doğru bir tokenizer kullanılmalıdır
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Mesaj geçmişinin token sayısını tahmin eder
   * @param {Array} messages - Mesaj dizisi
   * @returns {number} - Tahmini token sayısı
   */
  static estimateContextTokens(messages) {
    if (!Array.isArray(messages)) {
      return 0;
    }
    
    return messages.reduce((total, msg) => {
      if (!msg || typeof msg !== 'object' || typeof msg.content !== 'string') {
        return total;
      }
      
      return total + this.estimateTokenCount(msg.content);
    }, 0);
  }
  
  /**
   * Bağlam penceresini yönetir (token limitini aşmamak için)
   * @param {Array} messages - Tüm mesaj geçmişi
   * @param {number} maxTokens - Maksimum token sayısı
   * @returns {Array} - Kırpılmış mesaj geçmişi
   */
  static manageContextWindow(messages, maxTokens = 4000) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return [];
    }
    
    // Sistem mesajlarını ayır (her zaman korunacak)
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    
    // Sistem mesajlarının token sayısını hesapla
    const systemTokens = this.estimateContextTokens(systemMessages);
    
    // Kalan token bütçesi
    const remainingTokens = maxTokens - systemTokens;
    
    if (remainingTokens <= 0) {
      // Sadece son sistem mesajını döndür
      return systemMessages.slice(-1);
    }
    
    // Mesajları sondan başa doğru ekle (en yeniler öncelikli)
    const result = [...systemMessages];
    let currentTokens = systemTokens;
    
    for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
      const msg = nonSystemMessages[i];
      const msgTokens = this.estimateTokenCount(msg.content);
      
      if (currentTokens + msgTokens <= maxTokens) {
        result.push(msg);
        currentTokens += msgTokens;
      } else {
        break;
      }
    }
    
    // Mesajları doğru sırayla döndür
    return result.sort((a, b) => {
      // Sistem mesajları her zaman önce
      if (a.role === 'system' && b.role !== 'system') return -1;
      if (a.role !== 'system' && b.role === 'system') return 1;
      
      // Diğer mesajlar orijinal sırayla
      return messages.indexOf(a) - messages.indexOf(b);
    });
  }
  
  /**
   * Yanıt kalitesini değerlendirir (basit metrikler)
   * @param {string} response - AI yanıtı
   * @returns {Object} - Kalite metrikleri
   */
  static evaluateResponseQuality(response) {
    if (typeof response !== 'string') {
      return { score: 0, metrics: {} };
    }
    
    // Basit metrikler
    const length = response.length;
    const wordCount = response.split(/\s+/).length;
    const sentenceCount = response.split(/[.!?]+/).length - 1;
    const avgWordLength = length / (wordCount || 1);
    const avgSentenceLength = wordCount / (sentenceCount || 1);
    
    // Kod bloğu içeriyor mu?
    const hasCodeBlock = /```[\s\S]+```/.test(response);
    
    // Bağlantı içeriyor mu?
    const hasLinks = /(https?:\/\/[^\s]+)/.test(response);
    
    // Basit bir kalite skoru (0-100)
    let score = 50; // Başlangıç skoru
    
    // Çok kısa yanıtlar için ceza
    if (wordCount < 10) score -= 20;
    
    // Çok uzun yanıtlar için bonus
    if (wordCount > 100) score += 10;
    
    // Çok uzun cümleler için ceza
    if (avgSentenceLength > 30) score -= 10;
    
    // Kod bloğu ve bağlantı için bonus
    if (hasCodeBlock) score += 10;
    if (hasLinks) score += 5;
    
    // Skoru 0-100 aralığında sınırla
    score = Math.max(0, Math.min(100, score));
    
    return {
      score,
      metrics: {
        length,
        wordCount,
        sentenceCount,
        avgWordLength,
        avgSentenceLength,
        hasCodeBlock,
        hasLinks
      }
    };
  }
  
  /**
   * Farklı model yanıtlarını karşılaştırır
   * @param {Object} responses - Model yanıtları
   * @returns {Object} - Karşılaştırma sonuçları
   */
  static compareResponses(responses) {
    const modelIds = Object.keys(responses);
    
    if (modelIds.length === 0) {
      return { winner: null, scores: {} };
    }
    
    const scores = {};
    let maxScore = -1;
    let winner = null;
    
    // Her model yanıtını değerlendir
    for (const modelId of modelIds) {
      const response = responses[modelId];
      
      // Hata durumunu kontrol et
      if (response.error) {
        scores[modelId] = { score: 0, error: response.error };
        continue;
      }
      
      // Yanıt kalitesini değerlendir
      const evaluation = this.evaluateResponseQuality(response.content);
      scores[modelId] = evaluation;
      
      // En yüksek skoru güncelle
      if (evaluation.score > maxScore) {
        maxScore = evaluation.score;
        winner = modelId;
      }
    }
    
    return {
      winner,
      scores
    };
  }
}

module.exports = AIUtils;
