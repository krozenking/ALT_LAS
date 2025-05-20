/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageItem from '../../components/Chat/MessageItem';

// Mesaj arayüzü
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  conversationId?: string;
  userId?: string;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'markdown' | 'file';
  metadata?: {
    file?: {
      name: string;
      type: string;
      size: number;
      url?: string;
      uploadStatus?: 'uploading' | 'success' | 'error';
    };
  };
}

// Mock useClipboard hook
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useClipboard: () => ({
      hasCopied: false,
      onCopy: vi.fn(),
    }),
    useColorModeValue: (light: unknown, dark: unknown) => light,
  };
});

describe('MessageItem Component', () => {
  let mockMessage: Message;
  let handleAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Her test öncesi mesaj ve işleyici fonksiyonu sıfırla
    mockMessage = {
      id: '1',
      content: 'Test message',
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    handleAction = vi.fn();
  });

  it('renders user message correctly', () => {
    render(
      <MessageItem
        message={mockMessage}
        isOwnMessage={true}
        onAction={handleAction}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Sen')).toBeInTheDocument();
  });

  it('renders AI message correctly', () => {
    const aiMessage = {
      ...mockMessage,
      sender: 'ai' as const,
      senderName: 'ALT_LAS AI',
    };

    render(
      <MessageItem
        message={aiMessage}
        isOwnMessage={false}
        onAction={handleAction}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('ALT_LAS AI')).toBeInTheDocument();
  });

  it('renders markdown content correctly', () => {
    const markdownMessage = {
      ...mockMessage,
      content: '# Heading\n\nThis is **bold** text',
      type: 'markdown' as const,
    };

    render(
      <MessageItem
        message={markdownMessage}
        isOwnMessage={true}
        onAction={handleAction}
      />
    );

    // Not: Markdown içeriği render edildiğinde, DOM yapısı değişir
    // Bu nedenle, içeriği doğrudan kontrol etmek yerine, dönüştürülmüş içeriği kontrol ediyoruz
    expect(screen.getByText('This is')).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
  });
});
