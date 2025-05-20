/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ChatContainer from '../../components/Chat/ChatContainer';

// Mock API sunucusu
const server = setupServer(
  // Kullanıcı bilgilerini getir
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'user-1',
        name: 'Test User',
        avatar: '',
        preferences: {
          theme: 'light',
          language: 'tr'
        }
      })
    );
  }),
  
  // Sohbetleri getir
  rest.get('/api/conversations', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'conv-1',
          title: 'Test Conversation',
          lastMessageTimestamp: new Date().toISOString()
        }
      ])
    );
  }),
  
  // Mesajları getir
  rest.get('/api/conversations/:id/messages', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 'msg-1',
          content: 'Merhaba, nasıl yardımcı olabilirim?',
          sender: 'ai',
          timestamp: new Date().toISOString()
        }
      ])
    );
  }),
  
  // Mesaj gönder
  rest.post('/api/messages', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'ai-response-1',
        content: 'Bu bir AI yanıtıdır.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      })
    );
  }),
  
  // Yeni sohbet oluştur
  rest.post('/api/conversations', (req, res, ctx) => {
    return res(
      ctx.json({
        id: 'new-conv-1',
        title: 'New Conversation',
        lastMessageTimestamp: new Date().toISOString()
      })
    );
  })
);

// Mock useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: 'tr',
  }),
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    server.listen();
  });
  
  afterEach(() => {
    server.resetHandlers();
  });
  
  afterAll(() => {
    server.close();
  });
  
  it('should load user data and conversations', async () => {
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );
    
    // Kullanıcı bilgilerinin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Sohbetlerin yüklendiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    });
  });
  
  it('should send a message and receive a response', async () => {
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );
    
    // Mesaj gönderme
    const input = await screen.findByPlaceholderText('chat.type_message');
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
  
  it('should create a new conversation', async () => {
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );
    
    // Yeni sohbet düğmesine tıkla
    const newChatButton = await screen.findByLabelText('chat.new_chat');
    await userEvent.click(newChatButton);
    
    // Yeni sohbetin başlatıldığını kontrol et
    await waitFor(() => {
      expect(screen.getByText('New Conversation')).toBeInTheDocument();
    });
  });
  
  it('should handle API errors gracefully', async () => {
    // API hatasını simüle et
    server.use(
      rest.post('/api/messages', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Internal Server Error' })
        );
      })
    );
    
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );
    
    // Mesaj gönderme
    const input = await screen.findByPlaceholderText('chat.type_message');
    await userEvent.type(input, 'Bu mesaj hata verecek.');
    
    const sendButton = screen.getByLabelText('chat.send');
    await userEvent.click(sendButton);
    
    // Hata durumunun gösterildiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('error.message_send')).toBeInTheDocument();
    });
  });
  
  it('should handle network errors gracefully', async () => {
    // Ağ hatasını simüle et
    server.use(
      rest.post('/api/messages', (req, res) => {
        return res.networkError('Network error');
      })
    );
    
    render(
      <ChakraProvider>
        <ChatContainer />
      </ChakraProvider>
    );
    
    // Mesaj gönderme
    const input = await screen.findByPlaceholderText('chat.type_message');
    await userEvent.type(input, 'Bu mesaj ağ hatası verecek.');
    
    const sendButton = screen.getByLabelText('chat.send');
    await userEvent.click(sendButton);
    
    // Hata durumunun gösterildiğini kontrol et
    await waitFor(() => {
      expect(screen.getByText('error.network')).toBeInTheDocument();
    });
  });
});
