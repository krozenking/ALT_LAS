/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import ChatContainer from '../../components/Chat/ChatContainer';

// Mock API service
vi.mock('../../services/api.service', () => ({
  default: {
    sendMessage: vi.fn().mockResolvedValue({
      id: 'ai-response-1',
      content: 'Bu bir AI yanıtıdır.',
      sender: 'ai',
      timestamp: new Date().toISOString(),
    }),
    getUser: vi.fn().mockResolvedValue({
      id: 'user-1',
      name: 'Test User',
      avatar: '',
    }),
    getConversations: vi.fn().mockResolvedValue([]),
    createConversation: vi.fn().mockImplementation((title) => ({
      id: 'conv-1',
      title,
      lastMessageTimestamp: new Date().toISOString(),
    })),
    updateUser: vi.fn(),
  },
}));

// Mock useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: 'tr',
  }),
}));

// Mock useColorModeValue hook
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useColorModeValue: (light: any) => light,
  };
});

describe('Chat Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render chat interface and allow sending messages', async () => {
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );

    // Başlangıçta yükleme durumunu kontrol et
    expect(screen.getByText('chat.welcome_message')).toBeInTheDocument();

    // Mesaj gönderme
    const input = screen.getByPlaceholderText('chat.type_message');
    await userEvent.type(input, 'Merhaba, bu bir test mesajıdır.');
    
    const sendButton = screen.getByLabelText('chat.send');
    await userEvent.click(sendButton);

    // Kullanıcı mesajının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Merhaba, bu bir test mesajıdır.')).toBeInTheDocument();
    });

    // AI yanıtının görüntülendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Bu bir AI yanıtıdır.')).toBeInTheDocument();
    });
  });

  it('should allow creating a new conversation', async () => {
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );

    // Yeni sohbet düğmesine tıkla
    const newChatButton = screen.getByLabelText('chat.new_chat');
    await userEvent.click(newChatButton);

    // Yeni sohbetin başlatıldığını kontrol et
    expect(screen.getByText('chat.new_conversation')).toBeInTheDocument();
  });

  it('should show settings when settings button is clicked', async () => {
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );

    // Ayarlar düğmesine tıkla
    const settingsButton = screen.getByLabelText('common.settings');
    await userEvent.click(settingsButton);

    // Ayarlar çekmecesinin açıldığını kontrol et
    await waitFor(() => {
      expect(screen.getByText('settings.title')).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    // API hatasını simüle et
    const apiService = await import('../../services/api.service');
    apiService.default.sendMessage = vi.fn().mockRejectedValue(new Error('API Error'));

    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );

    // Mesaj gönderme
    const input = screen.getByPlaceholderText('chat.type_message');
    await userEvent.type(input, 'Bu mesaj hata verecek.');
    
    const sendButton = screen.getByLabelText('chat.send');
    await userEvent.click(sendButton);

    // Hata durumunun gösterildiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('error.message_send')).toBeInTheDocument();
    });
  });
});
