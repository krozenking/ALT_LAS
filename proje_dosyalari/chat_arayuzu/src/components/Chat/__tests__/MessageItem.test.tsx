import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import MessageItem from '../MessageItem';
import { ChakraProvider } from '@chakra-ui/react';
import { Message } from '../../../types';

// Mock props
const mockUserMessage: Message = {
  id: 'msg-1',
  content: 'Merhaba, nasılsın?',
  sender: 'user',
  timestamp: '2025-01-01T12:00:00.000Z',
  status: 'delivered'
};

const mockAiMessage: Message = {
  id: 'msg-2',
  content: 'Merhaba! Ben bir AI asistanıyım. Size nasıl yardımcı olabilirim?',
  sender: 'ai',
  timestamp: '2025-01-01T12:01:00.000Z',
  status: 'delivered'
};

const mockFileMessage: Message = {
  id: 'msg-3',
  content: 'Dosya gönderiyorum.',
  sender: 'user',
  timestamp: '2025-01-01T12:02:00.000Z',
  status: 'delivered',
  metadata: {
    file: {
      id: 'file-1',
      name: 'test.txt',
      type: 'text/plain',
      size: 1024,
      url: 'https://example.com/files/test.txt'
    }
  }
};

const mockAudioMessage: Message = {
  id: 'msg-4',
  content: 'Sesli mesaj gönderiyorum.',
  sender: 'user',
  timestamp: '2025-01-01T12:03:00.000Z',
  status: 'delivered',
  metadata: {
    audio: {
      id: 'audio-1',
      duration: 5,
      url: 'https://example.com/audio/test.mp3'
    }
  }
};

// Mock hooks
vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    language: 'tr',
    changeLanguage: vi.fn()
  })
}));

describe('MessageItem Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user message correctly', () => {
    render(
      <ChakraProvider>
        <MessageItem message={mockUserMessage} />
      </ChakraProvider>
    );

    // Mesaj içeriğinin varlığını kontrol et
    expect(screen.getByText('Merhaba, nasılsın?')).toBeInTheDocument();
    
    // Kullanıcı mesajı sınıfının varlığını kontrol et
    const messageItem = screen.getByTestId(`message-${mockUserMessage.id}`);
    expect(messageItem).toHaveClass('user');
  });

  it('renders AI message correctly', () => {
    render(
      <ChakraProvider>
        <MessageItem message={mockAiMessage} />
      </ChakraProvider>
    );

    // Mesaj içeriğinin varlığını kontrol et
    expect(screen.getByText('Merhaba! Ben bir AI asistanıyım. Size nasıl yardımcı olabilirim?')).toBeInTheDocument();
    
    // AI mesajı sınıfının varlığını kontrol et
    const messageItem = screen.getByTestId(`message-${mockAiMessage.id}`);
    expect(messageItem).toHaveClass('ai');
  });

  it('renders file message correctly', () => {
    render(
      <ChakraProvider>
        <MessageItem message={mockFileMessage} />
      </ChakraProvider>
    );

    // Mesaj içeriğinin varlığını kontrol et
    expect(screen.getByText('Dosya gönderiyorum.')).toBeInTheDocument();
    
    // Dosya adının varlığını kontrol et
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    
    // Dosya indirme düğmesinin varlığını kontrol et
    expect(screen.getByLabelText('chat.message.downloadFile')).toBeInTheDocument();
  });

  it('renders audio message correctly', () => {
    render(
      <ChakraProvider>
        <MessageItem message={mockAudioMessage} />
      </ChakraProvider>
    );

    // Mesaj içeriğinin varlığını kontrol et
    expect(screen.getByText('Sesli mesaj gönderiyorum.')).toBeInTheDocument();
    
    // Ses oynatma düğmesinin varlığını kontrol et
    expect(screen.getByLabelText('chat.message.playAudio')).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    render(
      <ChakraProvider>
        <MessageItem message={mockUserMessage} />
      </ChakraProvider>
    );

    // Zaman damgasının varlığını kontrol et
    expect(screen.getByText('chat.message.timestamp')).toBeInTheDocument();
  });

  it('shows message status correctly', () => {
    render(
      <ChakraProvider>
        <MessageItem message={mockUserMessage} />
      </ChakraProvider>
    );

    // Mesaj durumunun varlığını kontrol et
    expect(screen.getByTestId(`status-${mockUserMessage.id}`)).toHaveTextContent('chat.message.status.delivered');
  });

  it('handles file download correctly', () => {
    // Global.URL.createObjectURL'u mock'la
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test');
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = mockCreateObjectURL;
    
    // Mock anchor element
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      remove: vi.fn()
    };
    
    // document.createElement'i mock'la
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLElement;
      return originalCreateElement.call(document, tag);
    });

    render(
      <ChakraProvider>
        <MessageItem message={mockFileMessage} />
      </ChakraProvider>
    );

    // Dosya indirme düğmesine tıkla
    const downloadButton = screen.getByLabelText('chat.message.downloadFile');
    fireEvent.click(downloadButton);
    
    // Mock'ları temizle
    URL.createObjectURL = originalCreateObjectURL;
    document.createElement = originalCreateElement;
  });

  it('handles audio playback correctly', () => {
    // HTMLAudioElement.prototype.play'i mock'la
    const mockPlay = vi.fn();
    const mockPause = vi.fn();
    const originalAudio = window.Audio;
    
    window.Audio = vi.fn().mockImplementation(() => ({
      play: mockPlay,
      pause: mockPause,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      src: ''
    })) as unknown as typeof Audio;

    render(
      <ChakraProvider>
        <MessageItem message={mockAudioMessage} />
      </ChakraProvider>
    );

    // Ses oynatma düğmesine tıkla
    const playButton = screen.getByLabelText('chat.message.playAudio');
    fireEvent.click(playButton);
    
    // play fonksiyonunun çağrıldığını kontrol et
    expect(mockPlay).toHaveBeenCalled();
    
    // Mock'ları temizle
    window.Audio = originalAudio;
  });
});
