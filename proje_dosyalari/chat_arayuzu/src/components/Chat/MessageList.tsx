import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useClipboard
} from '@chakra-ui/react';
import { ChevronDownIcon, CopyIcon, DownloadIcon, DeleteIcon } from '@chakra-ui/icons';
import MessageItem from './MessageItem';

// Mesaj arayüzü
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  conversationId?: string;
  userId?: string;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'markdown' | 'file';
  metadata?: {
    file?: {
      name: string;
      type: string;
      size: number;
      url?: string;
      uploadStatus?: 'uploading' | 'success' | 'error';
    };
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onResendMessage?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isTyping = false,
  onDeleteMessage,
  onResendMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [lastScrollPosition, setLastScrollPosition] = useState<number>(0);
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);

  // Konuşma metnini kopyalama
  const conversationText = messages
    .map(msg => `${msg.senderName} (${new Date(msg.timestamp).toLocaleTimeString()}): ${msg.content}`)
    .join('\n\n');
  const { hasCopied, onCopy } = useClipboard(conversationText);

  // Renk değişkenleri
  const dateBgColor = useColorModeValue('white', 'gray.800');
  const dateTextColor = useColorModeValue('gray.600', 'gray.400');
  const scrollButtonBg = useColorModeValue('white', 'gray.700');
  const scrollButtonShadow = useColorModeValue('lg', 'dark-lg');

  // Otomatik kaydırma
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, isTyping, autoScroll]);

  // Scroll olayını dinle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;

      // Scroll düğmesini göster/gizle
      setShowScrollButton(isScrolledUp);

      // Kullanıcı manuel olarak yukarı kaydırdıysa, otomatik kaydırmayı devre dışı bırak
      if (scrollTop < lastScrollPosition && isScrolledUp) {
        setAutoScroll(false);
      }

      // Kullanıcı manuel olarak en alta kaydırdıysa, otomatik kaydırmayı etkinleştir
      if (scrollHeight - scrollTop - clientHeight < 10) {
        setAutoScroll(true);
      }

      setLastScrollPosition(scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [lastScrollPosition]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mesajları tarihe göre grupla
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [date: string]: Message[] } = {};

    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(message);
    });

    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  // Mesaj işlemleri
  const handleMessageAction = (action: string, messageId: string) => {
    switch (action) {
      case 'delete':
        if (onDeleteMessage) onDeleteMessage(messageId);
        break;
      case 'resend':
        if (onResendMessage) onResendMessage(messageId);
        break;
      default:
        break;
    }
  };

  // Mesaj yok ise
  if (messages.length === 0) {
    return (
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        h="100%"
        color="gray.500"
        className="empty-state"
      >
        <Box
          as="svg"
          xmlns="http://www.w3.org/2000/svg"
          width="48px"
          height="48px"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          mb={4}
          opacity={0.6}
          className="empty-state-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </Box>
        <Text fontSize="xl" fontWeight="medium" mb={2} className="empty-state-title">
          ALT_LAS Asistan ile sohbete başlayın
        </Text>
        <Text fontSize="md" maxW="md" className="empty-state-description">
          Yukarıdaki önerilen konulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.
        </Text>
      </Flex>
    );
  }

  return (
    <Box position="relative">
      {/* Mesaj listesi */}
      <Box
        ref={containerRef}
        className="message-list-container"
        h="100%"
        maxH="calc(100vh - 180px)"
        overflowY="auto"
        p={4}
        display="flex"
        flexDirection="column"
        gap={4}
      >
        {/* Konuşma işlemleri */}
        {messages.length > 1 && (
          <Flex justify="center" mb={4}>
            <Menu>
              <MenuButton
                as={Button}
                size="sm"
                rightIcon={<ChevronDownIcon />}
                variant="outline"
                colorScheme="blue"
              >
                Konuşma İşlemleri
              </MenuButton>
              <MenuList>
                <MenuItem icon={<CopyIcon />} onClick={onCopy}>
                  {hasCopied ? 'Kopyalandı!' : 'Konuşmayı Kopyala'}
                </MenuItem>
                <MenuItem icon={<DownloadIcon />} onClick={() => {
                  const blob = new Blob([conversationText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ALT_LAS_Konuşma_${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}>
                  Konuşmayı İndir
                </MenuItem>
                <Divider />
                <MenuItem
                  icon={<DeleteIcon />}
                  color="red.500"
                  onClick={() => {
                    if (window.confirm('Tüm konuşma geçmişini silmek istediğinizden emin misiniz?')) {
                      localStorage.removeItem(`chat_history_${currentUserId}`);
                      window.location.reload();
                    }
                  }}
                >
                  Konuşmayı Temizle
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        )}

        {/* Mesaj grupları */}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <Box key={date} className="message-group" mb={4}>
            <Flex justify="center" mb={4} className="message-date-divider">
              <Text
                px={3}
                py={1}
                bg={dateBgColor}
                fontSize="xs"
                color={dateTextColor}
                borderRadius="full"
                position="relative"
                zIndex={1}
                className="message-date-divider-text"
              >
                {date}
              </Text>
            </Flex>

            <Box className="message-items" display="flex" flexDirection="column" gap={4}>
              {dateMessages.map(message => (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentUserId}
                  onAction={(action) => handleMessageAction(action, message.id)}
                />
              ))}
            </Box>
          </Box>
        ))}

        {/* AI yazıyor göstergesi */}
        {isTyping && (
          <Flex
            alignItems="center"
            p={2}
            borderRadius="lg"
            bg={useColorModeValue('gray.100', 'gray.700')}
            width="fit-content"
            mb={4}
            className="typing-indicator"
          >
            <Box className="typing-indicator-dot" />
            <Box className="typing-indicator-dot" />
            <Box className="typing-indicator-dot" />
            <Text ml={2} fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}>
              AI yazıyor...
            </Text>
          </Flex>
        )}

        <Box ref={messagesEndRef} />
      </Box>

      {/* Aşağı kaydırma düğmesi */}
      {showScrollButton && (
        <Tooltip label="Aşağı kaydır">
          <IconButton
            aria-label="Aşağı kaydır"
            icon={<ChevronDownIcon />}
            size="md"
            colorScheme="blue"
            borderRadius="full"
            position="absolute"
            bottom="20px"
            right="20px"
            boxShadow={scrollButtonShadow}
            bg={scrollButtonBg}
            onClick={() => {
              scrollToBottom();
              setAutoScroll(true);
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default MessageList;
