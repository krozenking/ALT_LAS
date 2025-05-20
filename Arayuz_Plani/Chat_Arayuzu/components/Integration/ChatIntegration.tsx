/**
 * Chat Integration Component
 * 
 * This component provides integration with other ALT_LAS modules.
 */

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../../context/ChatContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Conversation, Message } from '../../types';

// Integration event types
export type IntegrationEventType = 
  | 'OPEN_CHAT'
  | 'CLOSE_CHAT'
  | 'SELECT_USER'
  | 'SELECT_CONVERSATION'
  | 'SEND_MESSAGE'
  | 'NOTIFICATION';

// Integration event interface
export interface IntegrationEvent {
  type: IntegrationEventType;
  data?: any;
}

// Integration props
interface ChatIntegrationProps {
  containerId?: string;
  onEvent?: (event: IntegrationEvent) => void;
}

/**
 * Chat Integration Component
 * 
 * @param containerId - Container ID for embedding
 * @param onEvent - Event handler
 */
const ChatIntegration: React.FC<ChatIntegrationProps> = ({
  containerId = 'alt-las-chat-container',
  onEvent,
}) => {
  const {
    users,
    conversations,
    messages,
    selectedUserId,
    selectedConversationId,
    selectUser,
    selectConversation,
    sendMessage,
    createConversation,
    currentUserId,
  } = useChat();
  
  const { t, language, setLanguage } = useLanguage();
  const { themeMode, setThemeMode } = useTheme();
  
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check if component is embedded in another container
  useEffect(() => {
    const container = document.getElementById(containerId);
    
    if (container && container !== containerRef.current?.parentElement) {
      setIsEmbedded(true);
      container.appendChild(containerRef.current!);
      
      return () => {
        try {
          container.removeChild(containerRef.current!);
        } catch (error) {
          console.error('Error removing chat container:', error);
        }
      };
    }
  }, [containerId]);
  
  // Listen for integration messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin for security
      const allowedOrigins = [
        window.location.origin,
        'https://altlas.com',
        'https://app.altlas.com',
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn(`Rejected message from unauthorized origin: ${event.origin}`);
        return;
      }
      
      // Process message
      if (event.data && event.data.type === 'ALT_LAS_CHAT_COMMAND') {
        const { command, data } = event.data;
        
        switch (command) {
          case 'OPEN_CHAT':
            setIsVisible(true);
            onEvent?.({ type: 'OPEN_CHAT' });
            break;
            
          case 'CLOSE_CHAT':
            setIsVisible(false);
            onEvent?.({ type: 'CLOSE_CHAT' });
            break;
            
          case 'SELECT_USER':
            if (data && data.userId) {
              selectUser(data.userId);
              onEvent?.({ type: 'SELECT_USER', data: { userId: data.userId } });
            }
            break;
            
          case 'SELECT_CONVERSATION':
            if (data && data.conversationId) {
              selectConversation(data.conversationId);
              onEvent?.({ type: 'SELECT_CONVERSATION', data: { conversationId: data.conversationId } });
            }
            break;
            
          case 'SEND_MESSAGE':
            if (data && data.text && (data.userId || data.conversationId)) {
              if (data.userId) {
                // Find or create conversation with user
                const existingConversation = conversations.find(
                  conv => conv.type === 'direct' && conv.participants.includes(data.userId)
                );
                
                if (existingConversation) {
                  selectConversation(existingConversation.id);
                  sendMessage(data.text, data.attachments);
                } else {
                  createConversation({
                    type: 'direct',
                    participants: [data.userId],
                  }).then(conversation => {
                    selectConversation(conversation.id);
                    sendMessage(data.text, data.attachments);
                  });
                }
              } else if (data.conversationId) {
                selectConversation(data.conversationId);
                sendMessage(data.text, data.attachments);
              }
              
              onEvent?.({ type: 'SEND_MESSAGE', data });
            }
            break;
            
          case 'SET_LANGUAGE':
            if (data && data.language) {
              setLanguage(data.language);
            }
            break;
            
          case 'SET_THEME':
            if (data && data.theme) {
              setThemeMode(data.theme);
            }
            break;
            
          default:
            console.warn(`Unknown command: ${command}`);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    conversations,
    createConversation,
    onEvent,
    selectConversation,
    selectUser,
    sendMessage,
    setLanguage,
    setThemeMode,
  ]);
  
  // Expose API to parent window
  useEffect(() => {
    if (isEmbedded) {
      // Create API object
      const chatAPI = {
        openChat: () => setIsVisible(true),
        closeChat: () => setIsVisible(false),
        selectUser: (userId: string) => selectUser(userId),
        selectConversation: (conversationId: string) => selectConversation(conversationId),
        sendMessage: (
          text: string,
          recipientId?: string,
          conversationId?: string,
          attachments?: any[]
        ) => {
          if (conversationId) {
            selectConversation(conversationId);
            sendMessage(text, attachments);
          } else if (recipientId) {
            const existingConversation = conversations.find(
              conv => conv.type === 'direct' && conv.participants.includes(recipientId)
            );
            
            if (existingConversation) {
              selectConversation(existingConversation.id);
              sendMessage(text, attachments);
            } else {
              createConversation({
                type: 'direct',
                participants: [recipientId],
              }).then(conversation => {
                selectConversation(conversation.id);
                sendMessage(text, attachments);
              });
            }
          } else if (selectedConversationId) {
            sendMessage(text, attachments);
          }
        },
        getUsers: () => users,
        getConversations: () => conversations,
        getMessages: (conversationId: string) => messages[conversationId] || [],
        getCurrentUser: () => users.find(user => user.id === currentUserId),
        setLanguage: (lang: string) => setLanguage(lang),
        setTheme: (theme: 'light' | 'dark' | 'system') => setThemeMode(theme),
      };
      
      // Expose API to parent window
      window.ALT_LAS_CHAT_API = chatAPI;
      
      // Notify parent that chat is ready
      window.parent.postMessage(
        {
          type: 'ALT_LAS_CHAT_READY',
          chatAPI,
        },
        '*'
      );
    }
  }, [
    conversations,
    createConversation,
    currentUserId,
    isEmbedded,
    messages,
    selectConversation,
    selectUser,
    selectedConversationId,
    sendMessage,
    setLanguage,
    setThemeMode,
    users,
  ]);
  
  // Notify parent of new messages
  useEffect(() => {
    if (isEmbedded && selectedConversationId) {
      const conversationMessages = messages[selectedConversationId] || [];
      
      if (conversationMessages.length > 0) {
        const lastMessage = conversationMessages[conversationMessages.length - 1];
        
        if (lastMessage.senderId !== currentUserId) {
          window.parent.postMessage(
            {
              type: 'ALT_LAS_CHAT_EVENT',
              event: {
                type: 'NEW_MESSAGE',
                data: {
                  message: lastMessage,
                  conversation: conversations.find(conv => conv.id === selectedConversationId),
                },
              },
            },
            '*'
          );
          
          onEvent?.({
            type: 'NOTIFICATION',
            data: {
              message: lastMessage,
              conversation: conversations.find(conv => conv.id === selectedConversationId),
            },
          });
        }
      }
    }
  }, [
    conversations,
    currentUserId,
    isEmbedded,
    messages,
    onEvent,
    selectedConversationId,
  ]);
  
  // Render nothing if not visible
  if (!isVisible) {
    return <div ref={containerRef} style={{ display: 'none' }} />;
  }
  
  return (
    <Container ref={containerRef} isEmbedded={isEmbedded}>
      {/* Chat content will be rendered by parent component */}
      {isEmbedded && (
        <EmbeddedInfo>
          {t('integration', 'embeddedMode')}
          <CloseButton onClick={() => setIsVisible(false)}>
            {t('common', 'close')}
          </CloseButton>
        </EmbeddedInfo>
      )}
    </Container>
  );
};

const Container = styled.div<{ isEmbedded: boolean }>`
  display: flex;
  flex-direction: column;
  height: ${props => (props.isEmbedded ? '100%' : '100vh')};
  width: ${props => (props.isEmbedded ? '100%' : '100vw')};
  background-color: var(--color-background-default);
  color: var(--color-text-primary);
  position: ${props => (props.isEmbedded ? 'absolute' : 'relative')};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${props => (props.isEmbedded ? 1000 : 1)};
  border-radius: ${props => (props.isEmbedded ? 'var(--border-radius-md)' : '0')};
  overflow: hidden;
  box-shadow: ${props => (props.isEmbedded ? 'var(--shadow-lg)' : 'none')};
`;

const EmbeddedInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: var(--color-background-light);
  border-bottom: 1px solid var(--color-border-light);
  font-size: 12px;
  color: var(--color-text-secondary);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  
  &:hover {
    color: var(--color-text-primary);
  }
`;

// Declare global window interface
declare global {
  interface Window {
    ALT_LAS_CHAT_API: any;
  }
}

export default ChatIntegration;
