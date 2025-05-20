/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ChatInput from '../../components/Chat/ChatInput';
import { ChakraProvider } from '@chakra-ui/react';

// Jest-axe matchers'ı ekle
expect.extend(toHaveNoViolations);

// Mock useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: 'tr',
  }),
}));

describe('ChatInput Accessibility', () => {
  const mockHandlers = {
    onSendMessage: vi.fn(),
    onAttachFile: vi.fn(),
    onVoiceInput: vi.fn(),
  };

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <ChakraProvider>
        <ChatInput
          message=""
          setMessage={vi.fn()}
          onSendMessage={mockHandlers.onSendMessage}
          onAttachFile={mockHandlers.onAttachFile}
          onVoiceInput={mockHandlers.onVoiceInput}
          isLoading={false}
        />
      </ChakraProvider>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible buttons with proper labels', async () => {
    render(
      <ChakraProvider>
        <ChatInput
          message=""
          setMessage={vi.fn()}
          onSendMessage={mockHandlers.onSendMessage}
          onAttachFile={mockHandlers.onAttachFile}
          onVoiceInput={mockHandlers.onVoiceInput}
          isLoading={false}
        />
      </ChakraProvider>
    );
    
    // Gönder düğmesinin erişilebilir bir etiketi olmalı
    const sendButton = screen.getByLabelText('chat.send');
    expect(sendButton).toBeInTheDocument();
    
    // Dosya ekle düğmesinin erişilebilir bir etiketi olmalı
    const attachButton = screen.getByLabelText('chat.attach_file');
    expect(attachButton).toBeInTheDocument();
    
    // Ses girişi düğmesinin erişilebilir bir etiketi olmalı
    const voiceButton = screen.getByLabelText('chat.voice_input');
    expect(voiceButton).toBeInTheDocument();
  });

  it('should have accessible textarea with proper label', async () => {
    render(
      <ChakraProvider>
        <ChatInput
          message=""
          setMessage={vi.fn()}
          onSendMessage={mockHandlers.onSendMessage}
          onAttachFile={mockHandlers.onAttachFile}
          onVoiceInput={mockHandlers.onVoiceInput}
          isLoading={false}
        />
      </ChakraProvider>
    );
    
    // Metin alanının erişilebilir bir etiketi olmalı
    const textarea = screen.getByPlaceholderText('chat.type_message');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('aria-label', 'chat.type_message');
  });

  it('should have proper loading state indication', async () => {
    const { container, rerender } = render(
      <ChakraProvider>
        <ChatInput
          message="Test message"
          setMessage={vi.fn()}
          onSendMessage={mockHandlers.onSendMessage}
          onAttachFile={mockHandlers.onAttachFile}
          onVoiceInput={mockHandlers.onVoiceInput}
          isLoading={false}
        />
      </ChakraProvider>
    );
    
    // Yükleme durumunda yeniden render
    rerender(
      <ChakraProvider>
        <ChatInput
          message="Test message"
          setMessage={vi.fn()}
          onSendMessage={mockHandlers.onSendMessage}
          onAttachFile={mockHandlers.onAttachFile}
          onVoiceInput={mockHandlers.onVoiceInput}
          isLoading={true}
        />
      </ChakraProvider>
    );
    
    // Yükleme durumunda erişilebilirlik ihlali olmamalı
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Yükleme durumu görsel olarak gösterilmeli ve ekran okuyucular için erişilebilir olmalı
    const loadingIndicator = screen.getByLabelText('chat.loading');
    expect(loadingIndicator).toBeInTheDocument();
  });
});
