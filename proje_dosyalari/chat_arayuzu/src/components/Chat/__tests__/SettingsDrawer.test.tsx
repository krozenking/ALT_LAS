import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import SettingsDrawer from '../SettingsDrawer';

describe('SettingsDrawer Component', () => {
  const mockOnClose = vi.fn();
  const mockOnAiModelChange = vi.fn();
  const mockAvailableModels = [
    { id: 'openai-gpt4', name: 'GPT-4' },
    { id: 'openai-gpt35', name: 'GPT-3.5' }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders when isOpen is true', () => {
    render(
      <ChakraProvider>
        <SettingsDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          aiModel="openai-gpt4" 
          onAiModelChange={mockOnAiModelChange} 
          availableModels={mockAvailableModels} 
        />
      </ChakraProvider>
    );
    
    // Ayarlar başlığının görüntülendiğini kontrol et
    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
    
    // Görünüm bölümünün görüntülendiğini kontrol et
    expect(screen.getByText('Görünüm')).toBeInTheDocument();
    
    // AI Modeli bölümünün görüntülendiğini kontrol et
    expect(screen.getByText('AI Modeli')).toBeInTheDocument();
    
    // Bildirimler ve Davranış bölümünün görüntülendiğini kontrol et
    expect(screen.getByText('Bildirimler ve Davranış')).toBeInTheDocument();
  });
  
  it('does not render when isOpen is false', () => {
    render(
      <ChakraProvider>
        <SettingsDrawer 
          isOpen={false} 
          onClose={mockOnClose} 
          aiModel="openai-gpt4" 
          onAiModelChange={mockOnAiModelChange} 
          availableModels={mockAvailableModels} 
        />
      </ChakraProvider>
    );
    
    // Ayarlar başlığının görüntülenmediğini kontrol et
    expect(screen.queryByText('Ayarlar')).not.toBeInTheDocument();
  });
  
  it('calls onClose when close button is clicked', () => {
    render(
      <ChakraProvider>
        <SettingsDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          aiModel="openai-gpt4" 
          onAiModelChange={mockOnAiModelChange} 
          availableModels={mockAvailableModels} 
        />
      </ChakraProvider>
    );
    
    // Kapat düğmesine tıkla
    fireEvent.click(screen.getByText('Kapat'));
    
    // onClose fonksiyonunun çağrıldığını kontrol et
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  it('calls onAiModelChange when model is changed', () => {
    render(
      <ChakraProvider>
        <SettingsDrawer 
          isOpen={true} 
          onClose={mockOnClose} 
          aiModel="openai-gpt4" 
          onAiModelChange={mockOnAiModelChange} 
          availableModels={mockAvailableModels} 
        />
      </ChakraProvider>
    );
    
    // Model seçicisini bul
    const modelSelect = screen.getByLabelText('AI Modeli Seçin');
    
    // Modeli değiştir
    fireEvent.change(modelSelect, { target: { value: 'openai-gpt35' } });
    
    // onAiModelChange fonksiyonunun çağrıldığını kontrol et
    expect(mockOnAiModelChange).toHaveBeenCalledWith('openai-gpt35');
  });
});
