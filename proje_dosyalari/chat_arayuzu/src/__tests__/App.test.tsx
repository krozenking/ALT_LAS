import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { ChakraProvider } from '@chakra-ui/react';

// Mock AI integration
vi.mock('../ai-integration', () => ({
  aiIntegration: {
    initializeAI: vi.fn().mockResolvedValue(true),
    getAvailableModels: vi.fn().mockResolvedValue([
      { id: 'openai-gpt4', displayName: 'GPT-4' },
      { id: 'openai-gpt35', displayName: 'GPT-3.5' }
    ]),
    setActiveModel: vi.fn().mockResolvedValue(true),
    queryAI: vi.fn().mockResolvedValue({ text: 'Test response', model: 'openai-gpt4' })
  }
}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    
    // Uygulama başlığının görüntülendiğini kontrol et
    expect(screen.getByText(/ALT_LAS Chat/i)).toBeInTheDocument();
  });
  
  it('displays loading state initially', () => {
    render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
    
    // Yükleme göstergesinin görüntülendiğini kontrol et
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
