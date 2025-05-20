import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MessageInput from '../MessageInput';
import { ChakraProvider } from '@chakra-ui/react';

// Mock props
const mockProps = {
  onSendMessage: vi.fn(),
  onSendFile: vi.fn(),
  onRecordVoice: vi.fn(),
  isLoading: false,
  placeholder: 'Mesajınızı yazın...'
};

// Mock hooks
vi.mock('../../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    language: 'tr',
    changeLanguage: vi.fn()
  })
}));

describe('MessageInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    // Input alanının varlığını kontrol et
    expect(screen.getByPlaceholderText('Mesajınızı yazın...')).toBeInTheDocument();
    
    // Dosya yükleme düğmesinin varlığını kontrol et
    expect(screen.getByLabelText('chat.input.attachFile')).toBeInTheDocument();
    
    // Ses kayıt düğmesinin varlığını kontrol et
    expect(screen.getByLabelText('chat.input.recordVoice')).toBeInTheDocument();
    
    // Gönder düğmesinin varlığını kontrol et
    expect(screen.getByLabelText('chat.input.send')).toBeInTheDocument();
  });

  it('handles text input correctly', () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    const input = screen.getByPlaceholderText('Mesajınızı yazın...');
    
    // Metin gir
    fireEvent.change(input, { target: { value: 'Test mesajı' } });
    
    // Metin değerini kontrol et
    expect(input).toHaveValue('Test mesajı');
  });

  it('calls onSendMessage when send button is clicked', async () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    const input = screen.getByPlaceholderText('Mesajınızı yazın...');
    const sendButton = screen.getByLabelText('chat.input.send');
    
    // Metin gir
    fireEvent.change(input, { target: { value: 'Test mesajı' } });
    
    // Gönder düğmesine tıkla
    fireEvent.click(sendButton);
    
    // onSendMessage fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(mockProps.onSendMessage).toHaveBeenCalledWith('Test mesajı');
    });
    
    // Input alanının temizlendiğini kontrol et
    expect(input).toHaveValue('');
  });

  it('calls onSendMessage when Enter key is pressed', async () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    const input = screen.getByPlaceholderText('Mesajınızı yazın...');
    
    // Metin gir
    fireEvent.change(input, { target: { value: 'Test mesajı' } });
    
    // Enter tuşuna bas
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    // onSendMessage fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(mockProps.onSendMessage).toHaveBeenCalledWith('Test mesajı');
    });
    
    // Input alanının temizlendiğini kontrol et
    expect(input).toHaveValue('');
  });

  it('does not call onSendMessage when input is empty', () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    const sendButton = screen.getByLabelText('chat.input.send');
    
    // Gönder düğmesine tıkla
    fireEvent.click(sendButton);
    
    // onSendMessage fonksiyonunun çağrılmadığını kontrol et
    expect(mockProps.onSendMessage).not.toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} isLoading={true} />
      </ChakraProvider>
    );

    // Yükleme göstergesinin varlığını kontrol et
    expect(screen.getByLabelText('chat.input.loading')).toBeInTheDocument();
    
    // Gönder düğmesinin devre dışı olduğunu kontrol et
    expect(screen.getByLabelText('chat.input.send')).toBeDisabled();
  });

  it('calls onSendFile when file is selected', async () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    const fileInput = screen.getByTestId('file-input');
    
    // Dosya seç
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // onSendFile fonksiyonunun çağrıldığını kontrol et
    await waitFor(() => {
      expect(mockProps.onSendFile).toHaveBeenCalledWith(file);
    });
  });

  it('calls onRecordVoice when voice record button is clicked', () => {
    render(
      <ChakraProvider>
        <MessageInput {...mockProps} />
      </ChakraProvider>
    );

    const recordButton = screen.getByLabelText('chat.input.recordVoice');
    
    // Ses kayıt düğmesine tıkla
    fireEvent.click(recordButton);
    
    // onRecordVoice fonksiyonunun çağrıldığını kontrol et
    expect(mockProps.onRecordVoice).toHaveBeenCalled();
  });
});
