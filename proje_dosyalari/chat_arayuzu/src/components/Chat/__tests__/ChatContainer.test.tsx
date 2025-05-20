import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import ChatContainer from '../ChatContainer';
import { aiIntegration } from '../../../ai-integration';
import { Message, User } from '../../../types';

// Mock AI integration
vi.mock('../../../ai-integration', () => ({
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

// Mock hooks
vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key
  })
}));

vi.mock('../../../hooks/useKeyboardShortcuts', () => ({
  default: vi.fn()
}));

vi.mock('../../Notifications/NotificationSystem', () => ({
  useNotifications: () => ({
    addNotification: vi.fn()
  })
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ChatContainer Component', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // ChatHeader'ın görüntülendiğini kontrol et
    expect(screen.getByText('chat.title')).toBeInTheDocument();

    // AI entegrasyonunun başlatıldığını kontrol et
    await waitFor(() => {
      expect(aiIntegration.initializeAI).toHaveBeenCalled();
    });
  });

  it('shows conversation starter when no messages', () => {
    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // Konuşma başlatıcının görüntülendiğini kontrol et
    expect(screen.getByTestId('conversation-starter')).toBeInTheDocument();
  });

  it('allows sending messages', async () => {
    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // Mesaj giriş alanını bul
    const messageInput = screen.getByPlaceholderText('chat.messageInput.placeholder');

    // Mesaj yaz
    fireEvent.change(messageInput, { target: { value: 'Hello, AI!' } });

    // Gönder düğmesine tıkla
    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    // AI yanıtının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(aiIntegration.queryAI).toHaveBeenCalledWith('Hello, AI!', expect.any(Array));
      expect(screen.getByText('Test response')).toBeInTheDocument();
    });
  });

  it('loads conversation history from localStorage', async () => {
    // Konuşma geçmişini localStorage'a kaydet
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hello, AI!',
        senderId: mockUser.id,
        senderName: mockUser.name,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      },
      {
        id: '2',
        content: 'Hello! How can I help you?',
        senderId: 'ai',
        senderName: 'GPT-4',
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      }
    ];

    localStorage.setItem(`chat_history_${mockUser.id}`, JSON.stringify(mockMessages));

    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // Konuşma geçmişinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    });
  });

  it('allows changing AI model', async () => {
    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // AI modelini değiştir
    const modelSelector = screen.getByTestId('model-selector');
    fireEvent.change(modelSelector, { target: { value: 'openai-gpt35' } });

    // Model değişikliğinin yapıldığını kontrol et
    await waitFor(() => {
      expect(aiIntegration.setActiveModel).toHaveBeenCalledWith('openai-gpt35');
    });
  });

  it('allows clearing chat history', async () => {
    // Konuşma geçmişini localStorage'a kaydet
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hello, AI!',
        senderId: mockUser.id,
        senderName: mockUser.name,
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      },
      {
        id: '2',
        content: 'Hello! How can I help you?',
        senderId: 'ai',
        senderName: 'GPT-4',
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      }
    ];

    localStorage.setItem(`chat_history_${mockUser.id}`, JSON.stringify(mockMessages));

    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // Konuşma geçmişinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Hello, AI!')).toBeInTheDocument();
    });

    // Temizle düğmesine tıkla
    const clearButton = screen.getByTestId('clear-chat-button');
    fireEvent.click(clearButton);

    // Konuşma geçmişinin temizlendiğini kontrol et
    await waitFor(() => {
      expect(screen.queryByText('Hello, AI!')).not.toBeInTheDocument();
      expect(screen.getByTestId('conversation-starter')).toBeInTheDocument();
    });

    // localStorage'dan konuşma geçmişinin silindiğini kontrol et
    expect(localStorage.getItem(`chat_history_${mockUser.id}`)).toBeNull();
  });

  it('handles AI initialization failure', async () => {
    // AI başlatma hatasını simüle et
    vi.mocked(aiIntegration.initializeAI).mockRejectedValueOnce(new Error('Initialization failed'));

    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // Hata durumunda mesaj gönderme düğmesinin devre dışı olduğunu kontrol et
    await waitFor(() => {
      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeDisabled();
    });
  });

  it('handles AI query failure', async () => {
    // AI sorgu hatasını simüle et
    vi.mocked(aiIntegration.queryAI).mockRejectedValueOnce(new Error('Query failed'));

    render(
      <ChakraProvider>
        <ChatContainer user={mockUser} />
      </ChakraProvider>
    );

    // Mesaj gönder
    const messageInput = screen.getByPlaceholderText('chat.messageInput.placeholder');
    fireEvent.change(messageInput, { target: { value: 'Hello, AI!' } });

    const sendButton = screen.getByTestId('send-button');
    fireEvent.click(sendButton);

    // Hata mesajının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.')).toBeInTheDocument();
    });
  });
});
