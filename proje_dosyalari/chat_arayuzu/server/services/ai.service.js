const axios = require('axios');
// Geçici olarak model yerine mock veri kullanıyoruz
// const Message = require('../models/message.model');

// Mock mesajlar
const mockMessages = [];

/**
 * AI Service for interacting with the ALT_LAS AI model
 */
class AIService {
  constructor() {
    this.apiUrl = process.env.AI_API_URL || 'http://localhost:8000/api/ai';
  }

  /**
   * Get conversation history for context
   * @param {string} conversationId - The ID of the conversation
   * @param {number} limit - Maximum number of messages to retrieve
   * @returns {Promise<Array>} - Array of previous messages
   */
  async getConversationHistory(conversationId, limit = 10) {
    try {
      // Mock veri için filtreleme
      const filteredMessages = mockMessages.filter(msg => msg.conversationId === conversationId);

      // Sıralama ve limit
      const sortedMessages = filteredMessages
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

      return sortedMessages.reverse();
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  /**
   * Format conversation history for the AI model
   * @param {Array} messages - Array of message objects
   * @returns {Array} - Formatted messages for the AI model
   */
  formatConversationHistory(messages) {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  /**
   * Get AI response for a user message
   * @param {string} userMessage - The user's message
   * @param {string} conversationId - The ID of the conversation
   * @returns {Promise<string>} - The AI's response
   */
  async getResponse(userMessage, conversationId) {
    try {
      // Get conversation history for context
      const history = await this.getConversationHistory(conversationId);
      const formattedHistory = this.formatConversationHistory(history);

      // Add the current user message
      const messages = [
        ...formattedHistory,
        { role: 'user', content: userMessage }
      ];

      // Geçici olarak AI API'yi çağırmak yerine basit bir yanıt döndürüyoruz
      // Gerçek uygulamada burada AI API'ye istek yapılacak
      // const response = await axios.post(this.apiUrl, {
      //   messages,
      //   conversationId
      // });

      // Mock AI yanıtı
      const mockResponses = [
        `"${userMessage}" mesajınızı aldım. Size nasıl yardımcı olabilirim?`,
        `ALT_LAS AI olarak size yardımcı olmaktan memnuniyet duyarım. "${userMessage}" hakkında daha fazla bilgi verebilir misiniz?`,
        `Bu konuda size yardımcı olmak için buradayım. "${userMessage}" ile ilgili başka sorularınız var mı?`,
        `"${userMessage}" hakkında düşünüyorum... İlginç bir konu!`,
        `ALT_LAS projesi kapsamında geliştirilen AI asistanı olarak, "${userMessage}" konusunda size destek olmaktan mutluluk duyarım.`
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      // Mesajı mock mesajlar listesine ekle
      mockMessages.push({
        id: `msg_${Date.now()}`,
        content: userMessage,
        sender: 'user',
        conversationId,
        timestamp: new Date().toISOString()
      });

      return randomResponse;
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Fallback response in case of error
      return "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.";
    }
  }
}

module.exports = new AIService();
