import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import ChatHeader from '../ChatHeader';
import { Message, User } from '../../../types';

// Mock hooks
vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key
  })
}));

describe('ChatHeader Component', () => {
  const mockModels = [
    { id: 'openai-gpt4', name: 'GPT-4' },
    { id: 'openai-gpt35', name: 'GPT-3.5' }
  ];
  
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Test message',
      sender: 'user',
      timestamp: new Date().toISOString()
    }
  ];
  
  const mockUser: User = {
    id: 'user-1',
    name: 'Test User'
  };
  
  const mockOnModelChange = vi.fn();
  const mockOnClearChat = vi.fn();
  const mockOnLoadConversation = vi.fn();
  const mockOnExportConversation = vi.fn();
  const mockOnUpdateUser = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <ChatHeader
          title="Test Title"
          models={mockModels}
          activeModel="openai-gpt4"
          onModelChange={mockOnModelChange}
          isAiInitialized={true}
          onClearChat={mockOnClearChat}
          userId="user-1"
          messages={mockMessages}
          onLoadConversation={mockOnLoadConversation}
          onExportConversation={mockOnExportConversation}
          user={mockUser}
          onUpdateUser={mockOnUpdateUser}
        />
      </ChakraProvider>
    );
    
    // Başlığın görüntülendiğini kontrol et
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('displays active model', () => {
    render(
      <ChakraProvider>
        <ChatHeader
          title="Test Title"
          models={mockModels}
          activeModel="openai-gpt4"
          onModelChange={mockOnModelChange}
          isAiInitialized={true}
          onClearChat={mockOnClearChat}
          userId="user-1"
          messages={mockMessages}
          onLoadConversation={mockOnLoadConversation}
          onExportConversation={mockOnExportConversation}
          user={mockUser}
          onUpdateUser={mockOnUpdateUser}
        />
      </ChakraProvider>
    );
    
    // Aktif modelin görüntülendiğini kontrol et
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
  });
  
  it('calls onModelChange when model is changed', () => {
    render(
      <ChakraProvider>
        <ChatHeader
          title="Test Title"
          models={mockModels}
          activeModel="openai-gpt4"
          onModelChange={mockOnModelChange}
          isAiInitialized={true}
          onClearChat={mockOnClearChat}
          userId="user-1"
          messages={mockMessages}
          onLoadConversation={mockOnLoadConversation}
          onExportConversation={mockOnExportConversation}
          user={mockUser}
          onUpdateUser={mockOnUpdateUser}
        />
      </ChakraProvider>
    );
    
    // Model seçicisini aç
    fireEvent.click(screen.getByText('GPT-4'));
    
    // Farklı bir modeli seç
    fireEvent.click(screen.getByText('GPT-3.5'));
    
    // onModelChange fonksiyonunun çağrıldığını kontrol et
    expect(mockOnModelChange).toHaveBeenCalledWith('openai-gpt35');
  });
  
  it('calls onClearChat when clear button is clicked', () => {
    render(
      <ChakraProvider>
        <ChatHeader
          title="Test Title"
          models={mockModels}
          activeModel="openai-gpt4"
          onModelChange={mockOnModelChange}
          isAiInitialized={true}
          onClearChat={mockOnClearChat}
          userId="user-1"
          messages={mockMessages}
          onLoadConversation={mockOnLoadConversation}
          onExportConversation={mockOnExportConversation}
          user={mockUser}
          onUpdateUser={mockOnUpdateUser}
        />
      </ChakraProvider>
    );
    
    // Menüyü aç
    fireEvent.click(screen.getByTestId('header-menu-button'));
    
    // Temizle düğmesine tıkla
    fireEvent.click(screen.getByText('chat.conversation.clear'));
    
    // onClearChat fonksiyonunun çağrıldığını kontrol et
    expect(mockOnClearChat).toHaveBeenCalled();
  });
  
  it('calls onExportConversation when export button is clicked', () => {
    render(
      <ChakraProvider>
        <ChatHeader
          title="Test Title"
          models={mockModels}
          activeModel="openai-gpt4"
          onModelChange={mockOnModelChange}
          isAiInitialized={true}
          onClearChat={mockOnClearChat}
          userId="user-1"
          messages={mockMessages}
          onLoadConversation={mockOnLoadConversation}
          onExportConversation={mockOnExportConversation}
          user={mockUser}
          onUpdateUser={mockOnUpdateUser}
        />
      </ChakraProvider>
    );
    
    // Menüyü aç
    fireEvent.click(screen.getByTestId('header-menu-button'));
    
    // Dışa aktar düğmesine tıkla
    fireEvent.click(screen.getByText('chat.conversation.export'));
    
    // onExportConversation fonksiyonunun çağrıldığını kontrol et
    expect(mockOnExportConversation).toHaveBeenCalled();
  });
  
  it('disables buttons when AI is not initialized', () => {
    render(
      <ChakraProvider>
        <ChatHeader
          title="Test Title"
          models={mockModels}
          activeModel="openai-gpt4"
          onModelChange={mockOnModelChange}
          isAiInitialized={false}
          onClearChat={mockOnClearChat}
          userId="user-1"
          messages={mockMessages}
          onLoadConversation={mockOnLoadConversation}
          onExportConversation={mockOnExportConversation}
          user={mockUser}
          onUpdateUser={mockOnUpdateUser}
        />
      </ChakraProvider>
    );
    
    // Model seçicisinin devre dışı olduğunu kontrol et
    expect(screen.getByTestId('model-selector')).toBeDisabled();
  });
});
