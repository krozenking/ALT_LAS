import React, { useState } from 'react';
import { Box, Flex, Text, Avatar, useColorModeValue, IconButton, Menu, MenuButton, MenuList, MenuItem, useClipboard, Tooltip, Divider, Image, Badge } from '@chakra-ui/react';
import { CheckIcon, TimeIcon, WarningIcon, CopyIcon, DeleteIcon, RepeatIcon, ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons';
import { FiFile, FiFileText, FiImage, FiCode } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

// Dosya metadata arayüzü
interface FileMetadata {
  name: string;
  type: string;
  size: number;
  url?: string;
  uploadStatus?: 'uploading' | 'success' | 'error';
}

// Mesaj arayüzü
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  conversationId?: string;
  userId?: string;
  status?: 'sending' | 'sent' | 'error';
  type?: 'text' | 'markdown' | 'file';
  metadata?: {
    file?: FileMetadata;
  };
}

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  onAction?: (action: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  onAction
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { hasCopied, onCopy } = useClipboard(message.content);

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Renk ayarları
  const userBubbleBg = 'brand.500';
  const userBubbleColor = 'white';
  const aiBubbleBg = useColorModeValue('gray.100', 'gray.700');
  const aiBubbleColor = useColorModeValue('gray.800', 'white');
  const timeColor = useColorModeValue(
    isOwnMessage ? 'whiteAlpha.800' : 'gray.500',
    isOwnMessage ? 'whiteAlpha.700' : 'gray.400'
  );
  const menuBg = useColorModeValue('white', 'gray.700');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Markdown stilleri için renk değerleri
  const codeBackgroundLight = 'gray.200';
  const preBackgroundLight = 'gray.200';
  const fileCardBorderLight = 'gray.200';
  const fileCardBgLight = 'gray.50';
  const fileIconBgLight = 'gray.100';

  // Mesaj durumuna göre simge
  const StatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <TimeIcon ml={1} boxSize={3} color={timeColor} className="message-status-sending" />;
      case 'sent':
        return <CheckIcon ml={1} boxSize={3} color={timeColor} />;
      case 'error':
        return <WarningIcon ml={1} boxSize={3} color="red.500" />;
      default:
        return null;
    }
  };

  // Markdown içeriği için özel stil
  const markdownStyles = {
    p: { mb: 2 },
    a: { color: isOwnMessage ? 'blue.100' : 'blue.500', textDecoration: 'underline' },
    ul: { pl: 4, mb: 2 },
    ol: { pl: 4, mb: 2 },
    li: { mb: 1 },
    h1: { fontSize: 'xl', fontWeight: 'bold', mb: 2, mt: 2 },
    h2: { fontSize: 'lg', fontWeight: 'bold', mb: 2, mt: 2 },
    h3: { fontSize: 'md', fontWeight: 'bold', mb: 1, mt: 1 },
    code: {
      bg: isOwnMessage ? 'rgba(255,255,255,0.2)' : (codeBackgroundLight),
      px: 1,
      borderRadius: 'sm',
      fontFamily: 'monospace'
    },
    pre: {
      bg: isOwnMessage ? 'rgba(255,255,255,0.1)' : (preBackgroundLight),
      p: 2,
      borderRadius: 'md',
      overflowX: 'auto',
      my: 2
    }
  };

  // Dosya tipine göre ikon belirle
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FiImage;
    if (fileType.startsWith('text/')) return FiFileText;
    if (fileType.includes('json') || fileType.includes('javascript') || fileType.includes('html')) return FiCode;
    return FiFile;
  };

  // Dosya boyutu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Dosya içeriği render
  const renderFileContent = () => {
    const fileMetadata = message.metadata?.file;
    if (!fileMetadata) return null;

    return (
      <Box
        mt={2}
        p={3}
        borderWidth="1px"
        borderColor={fileCardBorderLight}
        borderRadius="md"
        bg={fileCardBgLight}
      >
        <Flex align="center">
          <Box
            mr={3}
            p={2}
            borderRadius="md"
            bg={fileIconBgLight}
          >
            <Box as={getFileIcon(fileMetadata.type)} size="24px" color={isOwnMessage ? "blue.400" : "blue.500"} />
          </Box>

          <Box flex="1">
            <Text fontWeight="medium" fontSize="sm" mb={1} noOfLines={1}>
              {fileMetadata.name}
            </Text>
            <Flex align="center">
              <Text fontSize="xs" color="gray.500">
                {formatFileSize(fileMetadata.size)}
              </Text>
              {fileMetadata.uploadStatus && (
                <Badge
                  ml={2}
                  colorScheme={fileMetadata.uploadStatus === 'success' ? 'green' :
                              fileMetadata.uploadStatus === 'error' ? 'red' : 'blue'}
                  fontSize="2xs"
                >
                  {fileMetadata.uploadStatus === 'success' ? 'Yüklendi' :
                   fileMetadata.uploadStatus === 'error' ? 'Hata' : 'Yükleniyor'}
                </Badge>
              )}
            </Flex>
          </Box>

          {fileMetadata.url && (
            <Tooltip label="Dosyayı indir">
              <IconButton
                aria-label="Dosyayı indir"
                icon={<DownloadIcon />}
                size="sm"
                variant="ghost"
                onClick={() => window.open(fileMetadata.url, '_blank')}
              />
            </Tooltip>
          )}
        </Flex>

        {/* Görsel önizleme */}
        {fileMetadata.type.startsWith('image/') && fileMetadata.url && (
          <Box mt={3}>
            <Image
              src={fileMetadata.url}
              alt={fileMetadata.name}
              maxH="200px"
              borderRadius="md"
              objectFit="contain"
            />
          </Box>
        )}

        {/* Ses dosyası oynatıcı */}
        {fileMetadata.type.startsWith('audio/') && (
          <Box mt={3}>
            <audio
              controls
              style={{ width: '100%' }}
              src={fileMetadata.url || URL.createObjectURL(new Blob([]))}
            >
              Tarayıcınız ses oynatmayı desteklemiyor.
            </audio>
          </Box>
        )}
      </Box>
    );
  };

  // Mesaj işlemleri
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <Flex
      className={`message-item ${isOwnMessage ? 'user' : 'ai'}`}
      justify={isOwnMessage ? 'flex-end' : 'flex-start'}
      align="flex-end"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar (sadece AI mesajları için) */}
      {!isOwnMessage && (
        <Box mr={2} className="message-avatar-container">
          <Avatar
            size="sm"
            name={message.senderName || 'AI'}
            src={message.senderAvatar}
            bg="brand.500"
            color="white"
            className="message-avatar"
          />
        </Box>
      )}

      {/* Mesaj içeriği */}
      <Box
        maxW="80%"
        p={3}
        borderRadius="lg"
        bg={isOwnMessage ? userBubbleBg : aiBubbleBg}
        color={isOwnMessage ? userBubbleColor : aiBubbleColor}
        borderBottomRightRadius={isOwnMessage ? 0 : undefined}
        borderBottomLeftRadius={!isOwnMessage ? 0 : undefined}
        className={`message-bubble ${isOwnMessage ? 'user' : 'ai'}`}
        position="relative"
      >
        <Flex direction="column">
          <Flex justify="space-between" align="center">
            <Text
              fontSize="sm"
              fontWeight="medium"
              mb={1}
              className="message-sender"
            >
              {isOwnMessage ? 'Sen' : message.senderName || 'ALT_LAS AI'}
            </Text>

            {/* Mesaj işlemleri menüsü */}
            {isHovered && onAction && (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<ChevronDownIcon />}
                  variant="ghost"
                  size="xs"
                  aria-label="Mesaj işlemleri"
                  color={isOwnMessage ? "whiteAlpha.800" : "gray.500"}
                  _hover={{
                    bg: isOwnMessage ? "whiteAlpha.200" : "gray.200",
                  }}
                  position="absolute"
                  top="2"
                  right="2"
                />
                <MenuList bg={menuBg} borderColor={menuBorderColor} minW="150px" zIndex={10}>
                  <MenuItem icon={<CopyIcon />} onClick={onCopy}>
                    {hasCopied ? 'Kopyalandı!' : 'Kopyala'}
                  </MenuItem>

                  {message.status === 'error' && (
                    <MenuItem icon={<RepeatIcon />} onClick={() => handleAction('resend')}>
                      Yeniden Gönder
                    </MenuItem>
                  )}

                  {isOwnMessage && (
                    <>
                      <Divider />
                      <MenuItem
                        icon={<DeleteIcon />}
                        color="red.500"
                        onClick={() => handleAction('delete')}
                      >
                        Sil
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            )}
          </Flex>

          <Box
            className="message-content"
            sx={message.type === 'markdown' ? markdownStyles : {}}
          >
            {message.type === 'markdown' ? (
              <ReactMarkdown components={{
                p: (props) => <Text mb={2} {...props} />,
                a: (props) => <Text as="a" color={isOwnMessage ? "blue.100" : "blue.500"} textDecoration="underline" {...props} />,
                ul: (props) => <Box as="ul" pl={4} mb={2} {...props} />,
                ol: (props) => <Box as="ol" pl={4} mb={2} {...props} />,
                li: (props) => <Box as="li" mb={1} {...props} />,
                h1: (props) => <Text as="h1" fontSize="xl" fontWeight="bold" mb={2} mt={2} {...props} />,
                h2: (props) => <Text as="h2" fontSize="lg" fontWeight="bold" mb={2} mt={2} {...props} />,
                h3: (props) => <Text as="h3" fontSize="md" fontWeight="bold" mb={1} mt={1} {...props} />,
                code: (props) => <Box as="code" bg={isOwnMessage ? "rgba(255,255,255,0.2)" : codeBackgroundLight} px={1} borderRadius="sm" fontFamily="monospace" {...props} />,
                pre: (props) => <Box as="pre" bg={isOwnMessage ? "rgba(255,255,255,0.1)" : preBackgroundLight} p={2} borderRadius="md" overflowX="auto" my={2} {...props} />
              }}>
                {message.content}
              </ReactMarkdown>
            ) : message.type === 'file' ? (
              <>
                {message.content && <Text mb={2}>{message.content}</Text>}
                {renderFileContent()}
              </>
            ) : (
              <Text>{message.content}</Text>
            )}
          </Box>

          <Flex
            align="center"
            mt={1}
            fontSize="xs"
            color={timeColor}
            className="message-timestamp"
          >
            {formattedTime}
            <StatusIcon />
          </Flex>
        </Flex>

        {/* Kopyalama başarılı bildirimi */}
        {hasCopied && (
          <Tooltip label="Kopyalandı!" isOpen={true}>
            <Box position="absolute" top="0" right="0" />
          </Tooltip>
        )}
      </Box>
    </Flex>
  );
};

export default MessageItem;
