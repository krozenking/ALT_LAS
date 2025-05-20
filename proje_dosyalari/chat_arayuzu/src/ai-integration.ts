import { AIConfig, AIModel, AIResponse } from './types';

interface MessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AIIntegration {
  private config: AIConfig | null = null;
  private activeModel: string = '';
  private models: AIModel[] = [];
  private initialized: boolean = false;

  /**
   * AI entegrasyonunu başlatır
   */
  async initializeAI(config: AIConfig): Promise<boolean> {
    try {
      this.config = config;
      this.models = config.models;
      this.activeModel = config.defaultModel;
      this.initialized = true;
      
      console.log('AI entegrasyonu başlatıldı:', this.activeModel);
      return true;
    } catch (error) {
      console.error('AI entegrasyonu başlatılamadı:', error);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Mevcut AI modellerini döndürür
   */
  async getAvailableModels(): Promise<AIModel[]> {
    if (!this.initialized) {
      throw new Error('AI entegrasyonu başlatılmadı');
    }
    
    return this.models;
  }

  /**
   * Aktif AI modelini değiştirir
   */
  async setActiveModel(modelId: string): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('AI entegrasyonu başlatılmadı');
    }
    
    const model = this.models.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model bulunamadı: ${modelId}`);
    }
    
    this.activeModel = modelId;
    console.log('Aktif model değiştirildi:', this.activeModel);
    return true;
  }

  /**
   * AI'ya sorgu gönderir
   */
  async queryAI(query: string, messageHistory: MessageHistory[] = []): Promise<AIResponse> {
    if (!this.initialized) {
      throw new Error('AI entegrasyonu başlatılmadı');
    }
    
    const model = this.models.find(m => m.id === this.activeModel);
    if (!model) {
      throw new Error(`Aktif model bulunamadı: ${this.activeModel}`);
    }
    
    // Gerçek bir API çağrısı yerine simülasyon
    // Gerçek implementasyonda burada OpenAI, Anthropic, vb. API çağrıları yapılacak
    return this.simulateAIResponse(query, messageHistory, model);
  }

  /**
   * AI yanıtını simüle eder (geliştirme amaçlı)
   */
  private async simulateAIResponse(
    query: string, 
    messageHistory: MessageHistory[],
    model: AIModel
  ): Promise<AIResponse> {
    // Gerçek implementasyonda bu fonksiyon yerine gerçek API çağrısı yapılacak
    console.log('AI sorgusu:', query);
    console.log('Mesaj geçmişi:', messageHistory);
    console.log('Kullanılan model:', model.id);
    
    // Yapay gecikme
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Basit yanıt simülasyonu
    let response = '';
    
    if (query.toLowerCase().includes('merhaba') || query.toLowerCase().includes('selam')) {
      response = 'Merhaba! Size nasıl yardımcı olabilirim?';
    } else if (query.toLowerCase().includes('yardım')) {
      response = 'Size nasıl yardımcı olabilirim? ALT_LAS projesi hakkında sorularınızı yanıtlayabilirim.';
    } else if (query.toLowerCase().includes('alt_las')) {
      response = 'ALT_LAS, merkezi olmayan, kullanıcı kontrollü ve birlikte çalışabilir bir dijital ekosistem oluşturmayı hedefleyen bir projedir. "Özgür AI" vizyonu doğrultusunda geliştirilmektedir.';
    } else if (query.toLowerCase().includes('özellik')) {
      response = 'ALT_LAS\'ın temel özellikleri arasında Federe Mesajlaşma Protokolü, Bilişsel İletişim Platformu, Güvenli AI Sandbox ve Kolektif Zeka Ağı bulunmaktadır.';
    } else {
      response = `Sorgunuzu aldım: "${query}". Bu konuda size daha fazla bilgi vermek için çalışıyorum. Lütfen daha spesifik bir soru sorarsanız daha iyi yardımcı olabilirim.`;
    }
    
    return {
      text: response,
      model: model.id
    };
  }
}

export const aiIntegration = new AIIntegration();
