import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChakraProvider } from '@chakra-ui/react';
import MessageList from '../MessageList';
import { Message } from '../../../types';

// Mock hooks
vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key
  })
}));

describe('MessageList Component', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Merhaba, nasılsın?',
      sender: 'user',
      senderId: 'user-1',
      senderName: 'Test User',
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    },
    {
      id: '2',
      content: 'Merhaba! Ben iyiyim, size nasıl yardımcı olabilirim?',
      sender: 'ai',
      senderId: 'ai',
      senderName: 'GPT-4',
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    }
  ];

  const mockDeleteMessage = vi.fn();
  const mockResendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <MessageList
          messages={mockMessages}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Mesajların görüntülendiğini kontrol et
    expect(screen.getByText('Merhaba, nasılsın?')).toBeInTheDocument();
    expect(screen.getByText('Merhaba! Ben iyiyim, size nasıl yardımcı olabilirim?')).toBeInTheDocument();
  });

  it('displays user and AI messages differently', () => {
    render(
      <ChakraProvider>
        <MessageList
          messages={mockMessages}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Kullanıcı mesajı için test
    const userMessage = screen.getByText('Merhaba, nasılsın?').closest('[data-testid="message-item"]');
    expect(userMessage).toHaveAttribute('data-sender', 'user');

    // AI mesajı için test
    const aiMessage = screen.getByText('Merhaba! Ben iyiyim, size nasıl yardımcı olabilirim?').closest('[data-testid="message-item"]');
    expect(aiMessage).toHaveAttribute('data-sender', 'ai');
  });

  it('shows typing indicator when isTyping is true', () => {
    render(
      <ChakraProvider>
        <MessageList
          messages={mockMessages}
          currentUserId="user-1"
          isTyping={true}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Yazma göstergesinin görüntülendiğini kontrol et
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('does not show typing indicator when isTyping is false', () => {
    render(
      <ChakraProvider>
        <MessageList
          messages={mockMessages}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Yazma göstergesinin görüntülenmediğini kontrol et
    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
  });

  it('renders empty state when no messages', () => {
    render(
      <ChakraProvider>
        <MessageList
          messages={[]}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Boş durum mesajının görüntülendiğini kontrol et
    expect(screen.getByTestId('empty-message-list')).toBeInTheDocument();
  });

  it('calls onDeleteMessage when delete button is clicked', async () => {
    render(
      <ChakraProvider>
        <MessageList
          messages={mockMessages}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Kullanıcı mesajını bul
    const userMessage = screen.getByText('Merhaba, nasılsın?').closest('[data-testid="message-item"]');

    // Mesaj menüsünü aç
    const menuButton = userMessage?.querySelector('[data-testid="message-menu-button"]');
    if (menuButton) {
      fireEvent.click(menuButton);
    }

    // Sil düğmesine tıkla
    const deleteButton = await screen.findByText('chat.messages.delete');
    fireEvent.click(deleteButton);

    // onDeleteMessage fonksiyonunun çağrıldığını kontrol et
    expect(mockDeleteMessage).toHaveBeenCalledWith('1');
  });

  it('calls onResendMessage when resend button is clicked', async () => {
    // Hata durumundaki mesaj
    const errorMessage: Message = {
      id: '3',
      content: 'Bu bir test mesajıdır.',
      sender: 'user',
      senderId: 'user-1',
      senderName: 'Test User',
      timestamp: new Date().toISOString(),
      status: 'error',
      type: 'text'
    };

    render(
      <ChakraProvider>
        <MessageList
          messages={[...mockMessages, errorMessage]}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Hata mesajını bul
    const errorMessageElement = screen.getByText('Bu bir test mesajıdır.').closest('[data-testid="message-item"]');

    // Yeniden gönder düğmesine tıkla
    const resendButton = errorMessageElement?.querySelector('[data-testid="resend-button"]');
    if (resendButton) {
      fireEvent.click(resendButton);
    }

    // onResendMessage fonksiyonunun çağrıldığını kontrol et
    expect(mockResendMessage).toHaveBeenCalledWith('3');
  });

  it('renders markdown content correctly', () => {
    // Markdown içerikli mesaj
    const markdownMessage: Message = {
      id: '4',
      content: '# Başlık\n\n**Kalın metin** ve *italik metin*\n\n```javascript\nconsole.log("Merhaba Dünya!");\n```',
      sender: 'ai',
      senderId: 'ai',
      senderName: 'GPT-4',
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'markdown'
    };

    render(
      <ChakraProvider>
        <MessageList
          messages={[markdownMessage]}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Markdown içeriğinin doğru şekilde işlendiğini kontrol et
    expect(screen.getByRole('heading', { level: 1, name: 'Başlık' })).toBeInTheDocument();
    expect(screen.getByText('Kalın metin')).toHaveStyle('font-weight: bold');
    expect(screen.getByText('italik metin')).toHaveStyle('font-style: italic');
    expect(screen.getByText('console.log("Merhaba Dünya!");')).toBeInTheDocument();
  });

  it('renders file messages correctly', () => {
    // Dosya içerikli mesaj
    const fileMessage: Message = {
      id: '5',
      content: 'Dosya gönderiyorum',
      sender: 'user',
      senderId: 'user-1',
      senderName: 'Test User',
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'file',
      metadata: {
        file: {
          name: 'test.pdf',
          size: 1024,
          type: 'application/pdf',
          uploadStatus: 'success'
        }
      }
    };

    render(
      <ChakraProvider>
        <MessageList
          messages={[fileMessage]}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Dosya mesajının doğru şekilde işlendiğini kontrol et
    expect(screen.getByText('Dosya gönderiyorum')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('handles messages with different statuses correctly', () => {
    // Farklı durumlardaki mesajlar
    const messages: Message[] = [
      {
        id: '6',
        content: 'Gönderildi',
        sender: 'user',
        senderId: 'user-1',
        senderName: 'Test User',
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      },
      {
        id: '7',
        content: 'Gönderiliyor',
        sender: 'user',
        senderId: 'user-1',
        senderName: 'Test User',
        timestamp: new Date().toISOString(),
        status: 'sending',
        type: 'text'
      },
      {
        id: '8',
        content: 'Hata',
        sender: 'user',
        senderId: 'user-1',
        senderName: 'Test User',
        timestamp: new Date().toISOString(),
        status: 'error',
        type: 'text'
      }
    ];

    render(
      <ChakraProvider>
        <MessageList
          messages={messages}
          currentUserId="user-1"
          isTyping={false}
          onDeleteMessage={mockDeleteMessage}
          onResendMessage={mockResendMessage}
        />
      </ChakraProvider>
    );

    // Farklı durumlardaki mesajların doğru şekilde işlendiğini kontrol et
    expect(screen.getByText('Gönderildi')).toBeInTheDocument();
    expect(screen.getByText('Gönderiliyor')).toBeInTheDocument();
    expect(screen.getByText('Hata')).toBeInTheDocument();

    // Hata durumundaki mesajın yeniden gönder düğmesine sahip olduğunu kontrol et
    const errorMessage = screen.getByText('Hata').closest('[data-testid="message-item"]');
    expect(errorMessage?.querySelector('[data-testid="resend-button"]')).toBeInTheDocument();
  });
});
