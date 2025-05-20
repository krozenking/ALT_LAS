import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import ConversationStarter from '../ConversationStarter';

// Mock hooks
vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key
  })
}));

describe('ConversationStarter Component', () => {
  const mockOnSelectPrompt = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <ConversationStarter onSelectPrompt={mockOnSelectPrompt} />
      </ChakraProvider>
    );

    // Başlığın görüntülendiğini kontrol et
    expect(screen.getByText('chat.emptyState.title')).toBeInTheDocument();
    
    // Açıklamanın görüntülendiğini kontrol et
    expect(screen.getByText('chat.emptyState.description')).toBeInTheDocument();
  });

  it('renders prompt suggestions', () => {
    render(
      <ChakraProvider>
        <ConversationStarter onSelectPrompt={mockOnSelectPrompt} />
      </ChakraProvider>
    );

    // Örnek konuşma başlatıcılarının görüntülendiğini kontrol et
    const promptSuggestions = screen.getAllByTestId('prompt-suggestion');
    expect(promptSuggestions.length).toBeGreaterThan(0);
  });

  it('calls onSelectPrompt when a prompt is clicked', () => {
    render(
      <ChakraProvider>
        <ConversationStarter onSelectPrompt={mockOnSelectPrompt} />
      </ChakraProvider>
    );

    // İlk örnek konuşma başlatıcısına tıkla
    const promptSuggestions = screen.getAllByTestId('prompt-suggestion');
    fireEvent.click(promptSuggestions[0]);

    // onSelectPrompt fonksiyonunun çağrıldığını kontrol et
    expect(mockOnSelectPrompt).toHaveBeenCalledTimes(1);
    expect(mockOnSelectPrompt).toHaveBeenCalledWith(expect.any(String));
  });

  it('displays different categories of prompts', () => {
    render(
      <ChakraProvider>
        <ConversationStarter onSelectPrompt={mockOnSelectPrompt} />
      </ChakraProvider>
    );

    // Kategori başlıklarının görüntülendiğini kontrol et
    expect(screen.getByText('chat.promptCategories.general')).toBeInTheDocument();
    expect(screen.getByText('chat.promptCategories.technical')).toBeInTheDocument();
    expect(screen.getByText('chat.promptCategories.creative')).toBeInTheDocument();
  });

  it('has accessible elements', () => {
    render(
      <ChakraProvider>
        <ConversationStarter onSelectPrompt={mockOnSelectPrompt} />
      </ChakraProvider>
    );

    // Erişilebilirlik özelliklerini kontrol et
    const promptSuggestions = screen.getAllByTestId('prompt-suggestion');
    promptSuggestions.forEach(suggestion => {
      expect(suggestion).toHaveAttribute('role', 'button');
      expect(suggestion).toHaveAttribute('tabIndex', '0');
    });
  });
});
