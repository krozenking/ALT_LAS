/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageInput from '../../components/Chat/MessageInput';

// Mock FileUploader ve VoiceRecorder bileşenlerini
vi.mock('../../components/Chat/FileUploader', () => ({
  default: vi.fn().mockImplementation(({ onFileSelect }) => (
    <button 
      data-testid="mock-file-uploader"
      onClick={() => onFileSelect(new File(['test'], 'test.txt', { type: 'text/plain' }))}
    >
      Mock File Uploader
    </button>
  ))
}));

vi.mock('../../components/Chat/VoiceRecorder', () => ({
  default: vi.fn().mockImplementation(({ onRecordingComplete }) => (
    <button 
      data-testid="mock-voice-recorder"
      onClick={() => onRecordingComplete(new Blob(['test']), 'Test transcript')}
    >
      Mock Voice Recorder
    </button>
  ))
}));

describe('MessageInput Component', () => {
  let handleSendMessage: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    handleSendMessage = vi.fn();
  });
  
  it('renders correctly', () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={false}
      />
    );
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mesaj gönder/i })).toBeInTheDocument();
  });
  
  it('handles text input correctly', async () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={false}
      />
    );
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message');
    
    expect(input).toHaveValue('Test message');
  });
  
  it('calls onSendMessage when send button is clicked', async () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={false}
      />
    );
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message');
    
    const sendButton = screen.getByRole('button', { name: /Mesaj gönder/i });
    await userEvent.click(sendButton);
    
    expect(handleSendMessage).toHaveBeenCalledWith('Test message', undefined);
    expect(input).toHaveValue(''); // Input should be cleared after sending
  });
  
  it('calls onSendMessage when Enter key is pressed', async () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={false}
      />
    );
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test message');
    await userEvent.keyboard('{Enter}');
    
    expect(handleSendMessage).toHaveBeenCalledWith('Test message', undefined);
  });
  
  it('does not call onSendMessage when input is empty', async () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={false}
      />
    );
    
    const sendButton = screen.getByRole('button', { name: /Mesaj gönder/i });
    await userEvent.click(sendButton);
    
    expect(handleSendMessage).not.toHaveBeenCalled();
  });
  
  it('shows loading state correctly', () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={true}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
  
  it('handles file selection correctly', async () => {
    render(
      <MessageInput 
        onSendMessage={handleSendMessage}
        loading={false}
      />
    );
    
    // Dosya yükleyici düğmesini bul ve tıkla
    const fileUploaderButton = screen.getByTestId('mock-file-uploader');
    await userEvent.click(fileUploaderButton);
    
    // Dosya seçildiğinde, dosya göstergesi görünür olmalı
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    
    // Mesaj gönder düğmesine tıkla
    const sendButton = screen.getByRole('button', { name: /Mesaj gönder/i });
    await userEvent.click(sendButton);
    
    // onSendMessage dosya ile çağrılmalı
    expect(handleSendMessage).toHaveBeenCalledWith('', expect.any(File));
  });
});
