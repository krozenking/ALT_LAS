/**
 * Unit tests for MessageInput component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageInput from '../components/MessageInput/MessageInput';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { mockAttachments } from './testUtils';

// Mock services
jest.mock('../services/socket', () => ({
  socketService: {
    emit: jest.fn(),
  },
}));

jest.mock('../services/offlineManager', () => ({
  offlineManager: {
    isNetworkOnline: jest.fn(() => true),
    queueMessage: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

// Mock file reader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  onload: jest.fn(),
  result: 'data:image/jpeg;base64,test',
};
global.FileReader = jest.fn(() => mockFileReader) as any;

describe('MessageInput Component', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnFileUpload = jest.fn();
  const conversationId = '123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  const renderComponent = (props = {}) => {
    return render(
      <LanguageProvider>
        <ThemeProvider>
          <MessageInput
            onSendMessage={mockOnSendMessage}
            onFileUpload={mockOnFileUpload}
            conversationId={conversationId}
            {...props}
          />
        </ThemeProvider>
      </LanguageProvider>
    );
  };
  
  test('renders correctly', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText(/mesaj yaz/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gönder/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dosya ekle/i })).toBeInTheDocument();
  });
  
  test('handles text input correctly', () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    
    expect(input).toHaveValue('Hello, world!');
  });
  
  test('calls onSendMessage when send button is clicked', () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    
    const sendButton = screen.getByRole('button', { name: /gönder/i });
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!', undefined);
    expect(input).toHaveValue('');
  });
  
  test('calls onSendMessage when Enter key is pressed', () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello, world!', undefined);
    expect(input).toHaveValue('');
  });
  
  test('does not call onSendMessage when Shift+Enter is pressed', () => {
    renderComponent();
    
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    fireEvent.change(input, { target: { value: 'Hello, world!' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
    expect(input).toHaveValue('Hello, world!');
  });
  
  test('does not call onSendMessage when input is empty', () => {
    renderComponent();
    
    const sendButton = screen.getByRole('button', { name: /gönder/i });
    fireEvent.click(sendButton);
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
  
  test('disables input and send button when disabled prop is true', () => {
    renderComponent({ disabled: true });
    
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    const sendButton = screen.getByRole('button', { name: /gönder/i });
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });
  
  test('handles file upload button click', () => {
    renderComponent();
    
    const fileButton = screen.getByRole('button', { name: /dosya ekle/i });
    fireEvent.click(fileButton);
    
    // Check if file upload modal is shown
    expect(screen.getByText(/dosya yükle/i)).toBeInTheDocument();
  });
  
  test('handles file selection', async () => {
    renderComponent();
    
    // Mock file
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    // Trigger file selection
    const fileInput = screen.getByTestId('file-input');
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Simulate FileReader onload
    mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,test' } });
    
    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalled();
    });
  });
  
  test('handles emoji picker button click', () => {
    renderComponent();
    
    const emojiButton = screen.getByRole('button', { name: /emoji ekle/i });
    fireEvent.click(emojiButton);
    
    // Check if emoji picker is shown
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
  });
  
  test('handles emoji selection', () => {
    renderComponent();
    
    // Open emoji picker
    const emojiButton = screen.getByRole('button', { name: /emoji ekle/i });
    fireEvent.click(emojiButton);
    
    // Select emoji
    const emojiElement = screen.getByText('😊');
    fireEvent.click(emojiElement);
    
    // Check if emoji is added to input
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    expect(input).toHaveValue('😊');
  });
  
  test('handles attachments correctly', () => {
    const attachments = mockAttachments(2);
    renderComponent({ attachments });
    
    // Check if attachments are displayed
    expect(screen.getByText(attachments[0].name)).toBeInTheDocument();
    expect(screen.getByText(attachments[1].name)).toBeInTheDocument();
    
    // Remove attachment
    const removeButton = screen.getAllByRole('button', { name: /kaldır/i })[0];
    fireEvent.click(removeButton);
    
    // Check if onFileUpload is called with updated attachments
    expect(mockOnFileUpload).toHaveBeenCalledWith([attachments[1]]);
  });
  
  test('handles offline mode correctly', () => {
    // Mock offline status
    const offlineManager = require('../services/offlineManager').offlineManager;
    offlineManager.isNetworkOnline.mockReturnValue(false);
    
    renderComponent();
    
    // Type message
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    fireEvent.change(input, { target: { value: 'Offline message' } });
    
    // Send message
    const sendButton = screen.getByRole('button', { name: /gönder/i });
    fireEvent.click(sendButton);
    
    // Check if message is queued
    expect(offlineManager.queueMessage).toHaveBeenCalledWith({
      text: 'Offline message',
      senderId: 'currentUserId',
      conversationId,
      attachments: undefined,
    });
    
    // Check if input is cleared
    expect(input).toHaveValue('');
  });
});
