/**
 * Integration tests for ChatContainer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatContainer from '../components/ChatContainer/ChatContainer';
import { ChatProvider } from '../context/ChatContext';
import { ThemeProvider } from '../context/ThemeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { mockUser, mockUsers, mockConversations, mockMessages } from './testUtils';

// Mock services
jest.mock('../services/socket', () => ({
  socketService: {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
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

jest.mock('../services/encryption', () => ({
  encryptionService: {
    getPublicKey: jest.fn(() => Promise.resolve('mock-public-key')),
    establishSession: jest.fn(() => Promise.resolve()),
    encryptMessage: jest.fn((userId, text) => Promise.resolve(`encrypted:${text}`)),
    decryptMessage: jest.fn((userId, text) => Promise.resolve(text.replace('encrypted:', ''))),
  },
}));

// Mock context values
const mockContextValue = {
  users: mockUsers(5),
  conversations: mockConversations(3, '1'),
  messages: {},
  selectedUserId: null,
  selectedConversationId: null,
  selectUser: jest.fn(),
  selectConversation: jest.fn(),
  sendMessage: jest.fn(),
  createConversation: jest.fn(),
  searchMessages: jest.fn(),
  clearSearch: jest.fn(),
  currentUserId: '1',
};

// Setup mock context
jest.mock('../context/ChatContext', () => ({
  ...jest.requireActual('../context/ChatContext'),
  useChat: () => mockContextValue,
}));

describe('ChatContainer Integration', () => {
  const currentUserId = '1';
  const mockOnOpenNotificationSettings = jest.fn();
  const mockOnOpenAccessibilitySettings = jest.fn();
  const mockOnOpenLanguageSelector = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup messages for conversations
    mockContextValue.messages = {
      '1': mockMessages(10, '1', ['1', '2']),
      '2': mockMessages(5, '2', ['1', '3']),
      '3': mockMessages(8, '3', ['1', '2', '3', '4']),
    };
  });
  
  const renderComponent = () => {
    return render(
      <LanguageProvider>
        <ThemeProvider>
          <ChatProvider>
            <ChatContainer
              currentUserId={currentUserId}
              onOpenNotificationSettings={mockOnOpenNotificationSettings}
              onOpenAccessibilitySettings={mockOnOpenAccessibilitySettings}
              onOpenLanguageSelector={mockOnOpenLanguageSelector}
            />
          </ChatProvider>
        </ThemeProvider>
      </LanguageProvider>
    );
  };
  
  test('renders correctly with sidebar and empty chat area', () => {
    renderComponent();
    
    // Check if sidebar is rendered
    expect(screen.getByPlaceholderText(/ara/i)).toBeInTheDocument();
    
    // Check if empty chat area is rendered
    expect(screen.getByText(/lütfen bir kullanıcı seçin/i)).toBeInTheDocument();
  });
  
  test('selects a user from sidebar', async () => {
    renderComponent();
    
    // Find and click on a user in the sidebar
    const userElement = screen.getByText('User 2');
    fireEvent.click(userElement);
    
    // Check if selectUser was called
    expect(mockContextValue.selectUser).toHaveBeenCalledWith('2');
  });
  
  test('selects a conversation from sidebar', async () => {
    // Set selected conversation
    mockContextValue.selectedConversationId = '1';
    
    renderComponent();
    
    // Find and click on a conversation in the sidebar
    const conversationElement = screen.getByText(/group 1/i);
    fireEvent.click(conversationElement);
    
    // Check if selectConversation was called
    expect(mockContextValue.selectConversation).toHaveBeenCalledWith('1');
  });
  
  test('displays messages when conversation is selected', async () => {
    // Set selected conversation and messages
    mockContextValue.selectedConversationId = '1';
    mockContextValue.messages = {
      '1': [
        {
          id: '1',
          text: 'Hello, world!',
          senderId: '2',
          conversationId: '1',
          timestamp: new Date().toISOString(),
          status: 'sent',
        },
        {
          id: '2',
          text: 'Hi there!',
          senderId: '1',
          conversationId: '1',
          timestamp: new Date().toISOString(),
          status: 'sent',
        },
      ],
    };
    
    renderComponent();
    
    // Check if messages are displayed
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });
  
  test('sends a message', async () => {
    // Set selected conversation
    mockContextValue.selectedConversationId = '1';
    
    renderComponent();
    
    // Type a message
    const input = screen.getByPlaceholderText(/mesaj yaz/i);
    fireEvent.change(input, { target: { value: 'New message' } });
    
    // Send the message
    const sendButton = screen.getByRole('button', { name: /gönder/i });
    fireEvent.click(sendButton);
    
    // Check if sendMessage was called with encrypted message
    await waitFor(() => {
      expect(mockContextValue.sendMessage).toHaveBeenCalledWith('encrypted:New message', undefined);
    });
  });
  
  test('toggles sidebar', async () => {
    renderComponent();
    
    // Check if sidebar is initially visible
    expect(screen.getByPlaceholderText(/ara/i)).toBeInTheDocument();
    
    // Toggle sidebar
    const toggleButton = screen.getByRole('button', { name: '' }); // Sidebar toggle button
    fireEvent.click(toggleButton);
    
    // Check if sidebar is hidden
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/ara/i)).not.toBeVisible();
    });
    
    // Toggle sidebar again
    fireEvent.click(toggleButton);
    
    // Check if sidebar is visible again
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/ara/i)).toBeVisible();
    });
  });
  
  test('opens notification settings', async () => {
    renderComponent();
    
    // Find and click on notification settings button
    const notificationButton = screen.getByRole('button', { name: /bildirim/i });
    fireEvent.click(notificationButton);
    
    // Check if onOpenNotificationSettings was called
    expect(mockOnOpenNotificationSettings).toHaveBeenCalled();
  });
  
  test('opens accessibility settings', async () => {
    renderComponent();
    
    // Find and click on accessibility settings button
    const accessibilityButton = screen.getByRole('button', { name: /erişilebilirlik/i });
    fireEvent.click(accessibilityButton);
    
    // Check if onOpenAccessibilitySettings was called
    expect(mockOnOpenAccessibilitySettings).toHaveBeenCalled();
  });
  
  test('opens language selector', async () => {
    renderComponent();
    
    // Find and click on language selector button
    const languageButton = screen.getByRole('button', { name: /dil/i });
    fireEvent.click(languageButton);
    
    // Check if onOpenLanguageSelector was called
    expect(mockOnOpenLanguageSelector).toHaveBeenCalled();
  });
  
  test('searches for messages', async () => {
    // Set selected conversation
    mockContextValue.selectedConversationId = '1';
    
    renderComponent();
    
    // Open search
    const searchButton = screen.getByRole('button', { name: /ara/i });
    fireEvent.click(searchButton);
    
    // Type search query
    const searchInput = screen.getByPlaceholderText(/mesajlarda ara/i);
    fireEvent.change(searchInput, { target: { value: 'hello' } });
    
    // Submit search
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    // Check if searchMessages was called
    expect(mockContextValue.searchMessages).toHaveBeenCalledWith('hello');
  });
  
  test('creates a new group conversation', async () => {
    renderComponent();
    
    // Open group modal
    const groupButton = screen.getByRole('button', { name: /grup/i });
    fireEvent.click(groupButton);
    
    // Check if group modal is shown
    expect(screen.getByText(/grup oluştur/i)).toBeInTheDocument();
    
    // Select users
    const userCheckboxes = screen.getAllByRole('checkbox');
    fireEvent.click(userCheckboxes[0]);
    fireEvent.click(userCheckboxes[1]);
    
    // Enter group name
    const nameInput = screen.getByPlaceholderText(/grup adı/i);
    fireEvent.change(nameInput, { target: { value: 'Test Group' } });
    
    // Create group
    const createButton = screen.getByRole('button', { name: /oluştur/i });
    fireEvent.click(createButton);
    
    // Check if createConversation was called
    expect(mockContextValue.createConversation).toHaveBeenCalled();
  });
});
