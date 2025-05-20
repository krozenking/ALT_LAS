import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiIntegration } from './ai-integration';
import { AIConfig, AIModel } from './types';

describe('AI Integration', () => {
  const mockConfig: AIConfig = {
    models: [
      {
        id: 'openai-gpt4',
        type: 'openai',
        modelName: 'gpt-4',
        displayName: 'GPT-4',
        apiKey: 'test-api-key',
        systemMessage: 'Test system message'
      },
      {
        id: 'openai-gpt35',
        type: 'openai',
        modelName: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5',
        apiKey: 'test-api-key',
        systemMessage: 'Test system message'
      }
    ],
    defaultModel: 'openai-gpt4',
    parallelQueryEnabled: false
  };
  
  beforeEach(() => {
    // Reset AI integration state before each test
    aiIntegration.initializeAI(mockConfig);
  });
  
  describe('initializeAI', () => {
    it('initializes AI integration with config', async () => {
      const result = await aiIntegration.initializeAI(mockConfig);
      
      expect(result).toBe(true);
    });
    
    it('handles initialization errors', async () => {
      // Force an error by passing invalid config
      const result = await aiIntegration.initializeAI(null as unknown as AIConfig);
      
      expect(result).toBe(false);
    });
  });
  
  describe('getAvailableModels', () => {
    it('returns available models after initialization', async () => {
      await aiIntegration.initializeAI(mockConfig);
      
      const models = await aiIntegration.getAvailableModels();
      
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('openai-gpt4');
      expect(models[1].id).toBe('openai-gpt35');
    });
    
    it('throws error when not initialized', async () => {
      // Create a new instance to ensure it's not initialized
      const newAiIntegration = Object.create(aiIntegration);
      
      await expect(newAiIntegration.getAvailableModels()).rejects.toThrow('AI entegrasyonu başlatılmadı');
    });
  });
  
  describe('setActiveModel', () => {
    it('changes active model', async () => {
      await aiIntegration.initializeAI(mockConfig);
      
      const result = await aiIntegration.setActiveModel('openai-gpt35');
      
      expect(result).toBe(true);
      
      // Verify model was changed by making a query
      const response = await aiIntegration.queryAI('Test query');
      
      // In the mock implementation, the model ID is returned in the response
      expect(response.model).toBe('openai-gpt35');
    });
    
    it('throws error for invalid model ID', async () => {
      await aiIntegration.initializeAI(mockConfig);
      
      await expect(aiIntegration.setActiveModel('invalid-model')).rejects.toThrow('Model bulunamadı');
    });
  });
  
  describe('queryAI', () => {
    it('returns simulated response', async () => {
      await aiIntegration.initializeAI(mockConfig);
      
      const response = await aiIntegration.queryAI('Merhaba');
      
      expect(response).toHaveProperty('text');
      expect(response).toHaveProperty('model', 'openai-gpt4');
    });
    
    it('handles message history', async () => {
      await aiIntegration.initializeAI(mockConfig);
      
      const messageHistory = [
        { role: 'user', content: 'Merhaba' },
        { role: 'assistant', content: 'Merhaba! Size nasıl yardımcı olabilirim?' }
      ];
      
      const response = await aiIntegration.queryAI('ALT_LAS nedir?', messageHistory);
      
      expect(response).toHaveProperty('text');
      expect(response.text).toContain('ALT_LAS');
    });
  });
});
