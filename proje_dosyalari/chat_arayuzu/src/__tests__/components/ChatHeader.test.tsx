/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatHeader from '../../components/Chat/ChatHeader';

// Mock useColorModeValue hook
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useColorModeValue: (light: any) => light,
  };
});

// Mock useTranslation hook
vi.mock('../../hooks/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    changeLanguage: vi.fn(),
    language: 'tr',
  }),
}));

describe('ChatHeader Component', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
  };

  const mockConversation = {
    id: '1',
    title: 'Test Conversation',
    lastMessageTimestamp: new Date().toISOString(),
  };

  const mockHandlers = {
    onSettingsOpen: vi.fn(),
    onUserProfileOpen: vi.fn(),
    onNewChat: vi.fn(),
    onExportChat: vi.fn(),
    onDeleteChat: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with user and conversation', () => {
    render(
      <ChatHeader
        user={mockUser}
        currentConversation={mockConversation}
        onSettingsOpen={mockHandlers.onSettingsOpen}
        onUserProfileOpen={mockHandlers.onUserProfileOpen}
        onNewChat={mockHandlers.onNewChat}
        onExportChat={mockHandlers.onExportChat}
        onDeleteChat={mockHandlers.onDeleteChat}
      />
    );

    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders correctly without conversation', () => {
    render(
      <ChatHeader
        user={mockUser}
        onSettingsOpen={mockHandlers.onSettingsOpen}
        onUserProfileOpen={mockHandlers.onUserProfileOpen}
        onNewChat={mockHandlers.onNewChat}
        onExportChat={mockHandlers.onExportChat}
        onDeleteChat={mockHandlers.onDeleteChat}
      />
    );

    expect(screen.getByText('chat.new_conversation')).toBeInTheDocument();
  });

  it('calls onNewChat when new chat button is clicked', async () => {
    render(
      <ChatHeader
        user={mockUser}
        currentConversation={mockConversation}
        onSettingsOpen={mockHandlers.onSettingsOpen}
        onUserProfileOpen={mockHandlers.onUserProfileOpen}
        onNewChat={mockHandlers.onNewChat}
        onExportChat={mockHandlers.onExportChat}
        onDeleteChat={mockHandlers.onDeleteChat}
      />
    );

    const newChatButton = screen.getByLabelText('chat.new_chat');
    await userEvent.click(newChatButton);

    expect(mockHandlers.onNewChat).toHaveBeenCalled();
  });

  it('calls onSettingsOpen when settings button is clicked', async () => {
    render(
      <ChatHeader
        user={mockUser}
        currentConversation={mockConversation}
        onSettingsOpen={mockHandlers.onSettingsOpen}
        onUserProfileOpen={mockHandlers.onUserProfileOpen}
        onNewChat={mockHandlers.onNewChat}
        onExportChat={mockHandlers.onExportChat}
        onDeleteChat={mockHandlers.onDeleteChat}
      />
    );

    const settingsButton = screen.getByLabelText('common.settings');
    await userEvent.click(settingsButton);

    expect(mockHandlers.onSettingsOpen).toHaveBeenCalled();
  });

  it('calls onUserProfileOpen when user avatar is clicked', async () => {
    render(
      <ChatHeader
        user={mockUser}
        currentConversation={mockConversation}
        onSettingsOpen={mockHandlers.onSettingsOpen}
        onUserProfileOpen={mockHandlers.onUserProfileOpen}
        onNewChat={mockHandlers.onNewChat}
        onExportChat={mockHandlers.onExportChat}
        onDeleteChat={mockHandlers.onDeleteChat}
      />
    );

    const userAvatar = screen.getByText('Test User');
    await userEvent.click(userAvatar);

    expect(mockHandlers.onUserProfileOpen).toHaveBeenCalled();
  });
});
