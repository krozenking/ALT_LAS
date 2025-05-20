import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ChatHeader from '../ChatHeader/ChatHeader';
import ChatSidebar from '../ChatSidebar/ChatSidebar';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import { useChat } from '../../context/ChatContext';
import { Message, User } from '../../types';
import { encryptionService } from '../../services/encryption';

interface ChatContainerProps {
  currentUserId: string;
  onOpenNotificationSettings?: () => void;
  onOpenAccessibilitySettings?: () => void;
  onOpenLanguageSelector?: () => void;
  onOpenThemeSettings?: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  currentUserId,
  onOpenNotificationSettings,
  onOpenAccessibilitySettings,
  onOpenLanguageSelector,
  onOpenThemeSettings
}) => {
  const {
    users,
    messages,
    conversations,
    selectedConversationId,
    sendMessage,
    selectConversation,
    markMessagesAsRead,
    uploadFile,
    setCurrentUserId
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Set current user ID on mount
  useEffect(() => {
    setCurrentUserId(currentUserId);
  }, [currentUserId, setCurrentUserId]);

  // Find the selected conversation
  const selectedConversation = selectedConversationId
    ? conversations.find(conversation => conversation.id === selectedConversationId)
    : null;

  // Find the selected user for direct conversations
  const selectedUser = selectedUserId
    ? users.find(user => user.id === selectedUserId)
    : selectedConversation?.type === 'direct'
      ? users.find(user =>
          selectedConversation.participants.includes(user.id) &&
          user.id !== currentUserId
        )
      : null;

  // Handle sending a new message
  const handleSendMessage = async (text: string, attachments?: any[]) => {
    try {
      // Encrypt message if encryption is enabled
      let encryptedText = text;

      if (selectedUserId) {
        try {
          // Get user's public key (in a real app, this would come from the server)
          const publicKey = await encryptionService.getPublicKey();

          // Establish session with the user
          await encryptionService.establishSession(selectedUserId, publicKey);

          // Encrypt message
          encryptedText = await encryptionService.encryptMessage(selectedUserId, text);
        } catch (error) {
          console.error('Error encrypting message:', error);
          // Fall back to unencrypted message if encryption fails
        }
      }

      if (selectedConversationId) {
        sendMessage(encryptedText, selectedConversationId, attachments);
      } else if (selectedUserId) {
        // Create a new conversation if none exists
        const conversation = conversations.find(conv =>
          conv.participants.includes(currentUserId) &&
          conv.participants.includes(selectedUserId)
        );

        if (conversation) {
          selectConversation(conversation.id);
          sendMessage(encryptedText, conversation.id, attachments);
        } else {
          // Create a new conversation and then send the message
          // This will be handled in the context
          createConversation([selectedUserId]).then(() => {
            if (selectedConversationId) {
              sendMessage(encryptedText, selectedConversationId, attachments);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const fileData = await uploadFile(file);
      console.log('File uploaded:', fileData);
      // In a real application, we would create a message with the file URL
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Select a user to chat with
  const selectUser = (userId: string) => {
    setSelectedUserId(userId);

    // Find if there's an existing conversation with this user
    const conversation = conversations.find(conv =>
      conv.participants.includes(currentUserId) &&
      conv.participants.includes(userId)
    );

    if (conversation) {
      selectConversation(conversation.id);
    } else {
      // Clear selected conversation if no conversation exists
      selectConversation(null);
    }
  };

  // Create a new conversation
  const createConversation = async (participantIds: string[]) => {
    // This will be handled in the context
  };

  // Use messages from the selected conversation
  const conversationMessages = selectedConversationId
    ? messages.filter(message =>
        message.conversationId === selectedConversationId
      )
    : [];

  return (
    <Container>
      <ChatHeader
        user={selectedUser}
        conversation={selectedConversation}
        onToggleSidebar={toggleSidebar}
        onOpenNotificationSettings={onOpenNotificationSettings}
        onOpenAccessibilitySettings={onOpenAccessibilitySettings}
        onOpenLanguageSelector={onOpenLanguageSelector}
        onOpenThemeSettings={onOpenThemeSettings}
      />
      <Content>
        {isSidebarOpen && (
          <ChatSidebar
            users={users}
            selectedUserId={selectedUserId || ''}
            onSelectUser={selectUser}
            currentUserId={currentUserId}
            conversations={conversations}
          />
        )}
        <ChatArea>
          <MessageList
            messages={conversationMessages}
            currentUserId={currentUserId}
            selectedUser={selectedUser}
          />
          <MessageInput
            onSendMessage={handleSendMessage}
            onFileUpload={handleFileUpload}
            disabled={!selectedUserId && !selectedConversationId}
            conversationId={selectedConversationId || undefined}
          />
        </ChatArea>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ChatArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export default ChatContainer;
