import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import MessageItem from '../MessageItem/MessageItem';
import VirtualList from '../VirtualList/VirtualList';
import LazyLoad from '../LazyLoad/LazyLoad';
import { Message, User } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { socketService, SocketEvents } from '../../services/socket';
import { encryptionService } from '../../services/encryption';
import useDebounce from '../../hooks/useDebounce';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  selectedUser: User | undefined;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, selectedUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use debounced scroll position to avoid too many updates
  const debouncedScrollPosition = useDebounce(scrollPosition, 100);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Measure container height
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);

      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollTop);
  }, []);

  // Listen for typing events
  useEffect(() => {
    if (!selectedUser) return;

    const handleUserTyping = (data: { conversationId: string; userId: string }) => {
      if (data.userId === selectedUser.id) {
        setTypingUsers(prev => [...prev, data.userId]);
      }
    };

    const handleUserStopTyping = (data: { conversationId: string; userId: string }) => {
      if (data.userId === selectedUser.id) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStopTyping(handleUserStopTyping);

    return () => {
      socketService.off(SocketEvents.USER_TYPING);
      socketService.off(SocketEvents.USER_STOP_TYPING);
    };
  }, [selectedUser]);

  // Decrypt messages if needed
  const [decryptedMessages, setDecryptedMessages] = useState<Message[]>([]);

  useEffect(() => {
    const decryptMessages = async () => {
      if (!selectedUser) return;

      try {
        // Get user's public key (in a real app, this would come from the server)
        const publicKey = await encryptionService.getPublicKey();

        // Establish session with the user
        await encryptionService.establishSession(selectedUser.id, publicKey);

        // Decrypt messages
        const decrypted = await Promise.all(
          messages.map(async (message) => {
            if (message.senderId === selectedUser.id) {
              try {
                // Try to decrypt the message
                const decryptedText = await encryptionService.decryptMessage(
                  selectedUser.id,
                  message.text
                );
                return { ...message, text: decryptedText };
              } catch (error) {
                // If decryption fails, return the original message
                console.error('Error decrypting message:', error);
                return message;
              }
            }
            return message;
          })
        );

        setDecryptedMessages(decrypted);
      } catch (error) {
        console.error('Error setting up encryption:', error);
        setDecryptedMessages(messages);
      }
    };

    decryptMessages();
  }, [messages, selectedUser]);

  // Use decrypted messages if available, otherwise use original messages
  const displayMessages = decryptedMessages.length > 0 ? decryptedMessages : messages;

  // Group messages by date
  const groupedMessages: { [date: string]: Message[] } = displayMessages.reduce((groups, message) => {
    const date = formatDate(new Date(message.timestamp));
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as { [date: string]: Message[] });

  // If no messages or no selected user
  if (messages.length === 0 || !selectedUser) {
    return (
      <Container>
        <EmptyState>
          <EmptyStateText>
            {!selectedUser ? 'Lütfen bir kullanıcı seçin' : 'Henüz mesaj yok'}
          </EmptyStateText>
        </EmptyState>
      </Container>
    );
  }

  // Render message item (for virtual list)
  const renderMessageItem = useCallback((message: Message, index: number) => {
    return (
      <LazyLoad key={message.id}>
        <MessageItem
          message={message}
          isOwnMessage={message.senderId === currentUserId}
          user={message.senderId === currentUserId ? undefined : selectedUser}
        />
      </LazyLoad>
    );
  }, [currentUserId, selectedUser]);

  // Flatten messages for virtual list
  const flattenedMessages = Object.values(groupedMessages).flat();

  return (
    <Container ref={containerRef} onScroll={handleScroll}>
      {containerHeight > 0 ? (
        // Use virtual list for better performance with many messages
        flattenedMessages.length > 50 ? (
          <>
            <VirtualList
              items={flattenedMessages}
              itemHeight={80} // Approximate height of a message
              height={containerHeight}
              renderItem={renderMessageItem}
            />

            {typingUsers.length > 0 && selectedUser && (
              <TypingIndicator>
                <TypingDots>
                  <TypingDot delay="0s" />
                  <TypingDot delay="0.2s" />
                  <TypingDot delay="0.4s" />
                </TypingDots>
                <TypingText>{selectedUser.name} yazıyor...</TypingText>
              </TypingIndicator>
            )}

            <div ref={messagesEndRef} />
          </>
        ) : (
          // Use regular rendering for fewer messages
          <>
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                <DateSeparator>
                  <DateText>{date}</DateText>
                </DateSeparator>
                {dateMessages.map(message => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === currentUserId}
                    user={message.senderId === currentUserId ? undefined : selectedUser}
                  />
                ))}
              </div>
            ))}

            {typingUsers.length > 0 && selectedUser && (
              <TypingIndicator>
                <TypingDots>
                  <TypingDot delay="0s" />
                  <TypingDot delay="0.2s" />
                  <TypingDot delay="0.4s" />
                </TypingDots>
                <TypingText>{selectedUser.name} yazıyor...</TypingText>
              </TypingIndicator>
            )}

            <div ref={messagesEndRef} />
          </>
        )
      ) : (
        // Fallback while measuring container
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Yükleniyor...</div>
        </div>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fb;
`;

const DateSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
`;

const DateText = styled.span`
  font-size: 12px;
  color: #8e8e8e;
  background-color: #f5f7fb;
  padding: 0 10px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -50px;
    right: -50px;
    height: 1px;
    background-color: #e0e0e0;
    z-index: -1;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const EmptyStateText = styled.p`
  color: #8e8e8e;
  font-size: 16px;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
  padding: 8px 12px;
  background-color: #f0f2f5;
  border-radius: 18px;
  align-self: flex-start;
  max-width: 50%;
`;

const TypingDots = styled.div`
  display: flex;
  align-items: center;
  margin-right: 8px;
`;

interface TypingDotProps {
  delay: string;
}

const TypingDot = styled.div<TypingDotProps>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #8e8e8e;
  margin: 0 2px;
  animation: typing 1s infinite;
  animation-delay: ${props => props.delay};

  @keyframes typing {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;

const TypingText = styled.span`
  font-size: 12px;
  color: #8e8e8e;
`;

export default MessageList;
