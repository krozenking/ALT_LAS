import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Flex, useToast, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import ConversationStarter from './ConversationStarter';
import ErrorBoundary from './ErrorBoundary';
import HelpModal from './HelpModal';
import SettingsDrawer from './SettingsDrawer';
import { Message, User } from '../../types';
import { aiIntegration } from '../../ai-integration';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import useTranslation from '../../hooks/useTranslation';
import { useNotifications } from '../Notifications/NotificationSystem';
import '../../styles/chat.css';

interface ChatContainerProps {
  user: User;
  onUpdateUser?: (updatedUser: User) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  user,
  onUpdateUser
}) => {
  // Kullanıcı bilgileri
  const userId = user?.id || 'user';
  const userName = user?.name || 'Kullanıcı';
  const userAvatar = user?.avatar;

  // Kullanıcı güncelleme
  const handleUpdateUser = useCallback((updatedUser: User) => {
    // Gerçek uygulamada burada API çağrısı yapılır
    console.log('Kullanıcı güncellendi:', updatedUser);

    // Demo için kullanıcıyı doğrudan güncelle
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    toast({
      title: t('user.profileUpdated'),
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  }, [onUpdateUser]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiModel, setAiModel] = useState<string>('openai-gpt4');
  const [availableModels, setAvailableModels] = useState<{id: string, name: string}[]>([]);
  const [isAiInitialized, setIsAiInitialized] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const { t } = useTranslation();
  const { addNotification } = useNotifications();

  // Modal ve Drawer için state
  const {
    isOpen: isHelpOpen,
    onOpen: onHelpOpen,
    onClose: onHelpClose
  } = useDisclosure();

  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // AI entegrasyonunu başlat
  useEffect(() => {
    const initAI = async () => {
      try {
        const initialized = await aiIntegration.initializeAI({
          models: [
            {
              id: 'openai-gpt4',
              type: 'openai',
              modelName: 'gpt-4',
              displayName: 'GPT-4',
              apiKey: process.env.OPENAI_API_KEY || 'sim_api_key',
              systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın. ALT_LAS, merkezi olmayan, kullanıcı kontrollü ve birlikte çalışabilir bir dijital ekosistem oluşturmayı hedefleyen bir projedir. "Özgür AI" vizyonu doğrultusunda geliştirilmektedir.'
            },
            {
              id: 'openai-gpt35',
              type: 'openai',
              modelName: 'gpt-3.5-turbo',
              displayName: 'GPT-3.5',
              apiKey: process.env.OPENAI_API_KEY || 'sim_api_key',
              systemMessage: 'Sen ALT_LAS projesinin yardımcı asistanısın. ALT_LAS, merkezi olmayan, kullanıcı kontrollü ve birlikte çalışabilir bir dijital ekosistem oluşturmayı hedefleyen bir projedir. "Özgür AI" vizyonu doğrultusunda geliştirilmektedir.'
            }
          ],
          defaultModel: 'openai-gpt4',
          parallelQueryEnabled: false
        });

        setIsAiInitialized(initialized);

        if (initialized) {
          const models = await aiIntegration.getAvailableModels();
          setAvailableModels(models.map(model => ({
            id: model.id,
            name: model.displayName || model.id
          })));

          toast({
            title: t('chat.title'),
            description: t('chat.emptyState.description'),
            status: 'success',
            duration: 3000,
            isClosable: true,
            position: 'top-right'
          });

          // Bildirim ekle
          addNotification({
            title: t('notifications.systemUpdate'),
            message: t('chat.emptyState.description'),
            type: 'info'
          });
        }
      } catch (error) {
        console.error('AI başlatma hatası:', error);
        setIsAiInitialized(false);

        toast({
          title: t('errors.general'),
          description: t('errors.tryAgain'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });

        // Bildirim ekle
        addNotification({
          title: t('errors.general'),
          message: t('errors.tryAgain'),
          type: 'error',
          duration: 10000
        });
      }
    };

    initAI();

    // Konuşma geçmişini yerel depolamadan yükle
    const loadConversation = () => {
      try {
        const savedMessages = localStorage.getItem(`chat_history_${userId}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (error) {
        console.error('Konuşma geçmişi yüklenirken hata:', error);
      }
    };

    loadConversation();

    // Temizleme işlevi
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [toast, userId]);

  // Mesajları yerel depolamaya kaydet
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
      } catch (error) {
        console.error('Konuşma geçmişi kaydedilirken hata:', error);
      }
    }
  }, [messages, userId]);

  // Mesaj gönderme işlevi
  const handleSendMessage = async (content: string, file?: File) => {
    if ((!content.trim() && !file) || !isAiInitialized) return;

    setLoading(true);

    // Kullanıcı mesajını ekle
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      senderId: userId,
      senderName: userName,
      senderAvatar: userAvatar,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: file ? 'file' : 'text',
      metadata: file ? {
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadStatus: 'success'
        }
      } : undefined
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);

    // AI yazıyor efekti
    setIsTyping(true);

    try {
      // AI'ya sorgu gönder
      const messageHistory = messages.map(msg => ({
        role: msg.senderId === userId ? 'user' : 'assistant',
        content: msg.content
      }));

      // Dosya içeriğini işle (gerçek uygulamada dosya API'ye gönderilir)
      let processedContent = content;
      if (file) {
        // Dosya türüne göre içeriği zenginleştir
        if (file.type.startsWith('image/')) {
          processedContent = `${content.trim() ? content + '\n\n' : ''}[Kullanıcı bir görsel yükledi: ${file.name}]`;
        } else if (file.type.includes('pdf')) {
          processedContent = `${content.trim() ? content + '\n\n' : ''}[Kullanıcı bir PDF dosyası yükledi: ${file.name}]`;
        } else if (file.type.startsWith('audio/')) {
          processedContent = `${content.trim() ? content + '\n\n' : ''}[Kullanıcı bir ses kaydı yükledi: ${file.name}]`;

          // Ses dosyası için URL oluştur
          const audioUrl = URL.createObjectURL(file);

          // Metadata'ya URL ekle
          userMessage.metadata = {
            ...userMessage.metadata,
            file: {
              ...userMessage.metadata?.file,
              url: audioUrl
            }
          };
        } else {
          processedContent = `${content.trim() ? content + '\n\n' : ''}[Kullanıcı bir dosya yükledi: ${file.name}]`;
        }
      }

      const aiResponse = await aiIntegration.queryAI(processedContent, messageHistory);

      // Yazma efektini kaldır
      setIsTyping(false);

      // AI yanıtını ekle
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.text,
        senderId: 'ai',
        senderName: aiModel === 'openai-gpt4' ? 'GPT-4' : 'GPT-3.5',
        senderAvatar: '/assets/ai-avatar.png',
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'markdown' // Markdown formatında yanıt
      };

      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('AI yanıt hatası:', error);

      // Yazma efektini kaldır
      setIsTyping(false);

      // Hata mesajı ekle
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        senderId: 'ai',
        senderName: 'Sistem',
        timestamp: new Date().toISOString(),
        status: 'error',
        type: 'text'
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);

      toast({
        title: t('errors.serverError'),
        description: t('errors.tryAgain'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });

      // Bildirim ekle
      addNotification({
        title: t('errors.serverError'),
        message: t('errors.tryAgain'),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // AI modelini değiştirme işlevi
  const handleModelChange = async (modelId: string) => {
    try {
      const success = await aiIntegration.setActiveModel(modelId);
      if (success) {
        setAiModel(modelId);

        toast({
          title: t('chat.settings.aiModel.title'),
          description: `${t('chat.settings.aiModel.select')}: ${availableModels.find(m => m.id === modelId)?.name || modelId}`,
          status: 'info',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });

        // Bildirim ekle
        addNotification({
          title: t('notifications.aiModelChanged'),
          message: `${t('chat.settings.aiModel.select')}: ${availableModels.find(m => m.id === modelId)?.name || modelId}`,
          type: 'info'
        });
      }
    } catch (error) {
      console.error('Model değiştirme hatası:', error);

      toast({
        title: t('errors.general'),
        description: t('errors.tryAgain'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    }
  };

  // Örnek konuşma başlatıcı seçildiğinde
  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Sohbeti temizle
  const handleClearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(`chat_history_${userId}`);

    toast({
      title: t('chat.conversation.clear'),
      description: t('common.success'),
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });

    // Bildirim ekle
    addNotification({
      title: t('chat.conversation.clear'),
      message: t('common.success'),
      type: 'info'
    });
  }, [userId, toast]);

  // Mesaj silme işlevi
  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prevMessages => {
      // Silinecek mesajı bul
      const messageIndex = prevMessages.findIndex(msg => msg.id === messageId);
      if (messageIndex === -1) return prevMessages;

      // Kullanıcı mesajı ise ve sonrasında AI yanıtı varsa, AI yanıtını da sil
      if (
        prevMessages[messageIndex].senderId === userId &&
        messageIndex + 1 < prevMessages.length &&
        prevMessages[messageIndex + 1].senderId === 'ai'
      ) {
        const newMessages = [...prevMessages];
        newMessages.splice(messageIndex, 2); // Kullanıcı mesajı ve AI yanıtını sil
        return newMessages;
      }

      // Sadece seçilen mesajı sil
      return prevMessages.filter(msg => msg.id !== messageId);
    });

    toast({
      title: t('chat.messages.delete'),
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right'
    });
  }, [userId, toast]);

  // Mesajı yeniden gönderme işlevi
  const handleResendMessage = useCallback((messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    // Hata mesajını sil
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));

    // Mesajı yeniden gönder
    if (message.senderId === userId) {
      handleSendMessage(message.content);
    }
  }, [messages, userId]);

  // Mesaj giriş alanına odaklanma
  const focusMessageInput = useCallback(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, []);

  // Konuşma geçmişini dışa aktarma
  const handleExportConversation = useCallback(() => {
    if (messages.length === 0) return;

    // Konuşma metnini oluştur
    const conversationText = messages
      .map(msg => {
        const sender = msg.senderId === userId ? userName : msg.senderName;
        return `${sender} (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}\n`;
      })
      .join('\n');

    // Dosya adı oluştur
    const fileName = `conversation_${new Date().toISOString().slice(0, 10)}.txt`;

    // Dosyayı indir
    const element = document.createElement('a');
    const file = new Blob([conversationText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: t('chat.conversation.export'),
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  }, [messages, userId, userName, toast, t]);

  // Konuşma yükleme
  const handleLoadConversation = useCallback((loadedMessages: Message[]) => {
    setMessages(loadedMessages);

    // Otomatik kaydırma
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  // Klavye kısayolları
  useKeyboardShortcuts([
    {
      key: '/',
      callback: focusMessageInput,
      options: { ctrlKey: true }
    },
    {
      key: 'k',
      callback: focusMessageInput,
      options: { ctrlKey: true }
    },
    {
      key: '?',
      callback: onHelpOpen,
      options: { shiftKey: true }
    },
    {
      key: ',',
      callback: onSettingsOpen,
      options: { ctrlKey: true }
    },
    {
      key: 'Escape',
      callback: () => {
        if (isHelpOpen) onHelpClose();
        if (isSettingsOpen) onSettingsClose();
      },
      options: { preventDefault: false }
    }
  ]);

  return (
    <ErrorBoundary>
      <Flex
        direction="column"
        h="100%"
        bg={bgColor}
        borderRadius="lg"
        boxShadow="lg"
        overflow="hidden"
        className="chat-container"
      >
        <ChatHeader
          title={t('chat.title')}
          models={availableModels}
          activeModel={aiModel}
          onModelChange={handleModelChange}
          isAiInitialized={isAiInitialized}
          onClearChat={messages.length > 0 ? handleClearChat : undefined}
          userId={userId}
          messages={messages}
          onLoadConversation={handleLoadConversation}
          onExportConversation={handleExportConversation}
          user={user}
          onUpdateUser={handleUpdateUser}
        />

        <Box flex="1" overflow="hidden" position="relative">
          {messages.length === 0 ? (
            <ConversationStarter onSelectPrompt={handleSelectPrompt} />
          ) : (
            <MessageList
              messages={messages}
              currentUserId={userId}
              isTyping={isTyping}
              onDeleteMessage={handleDeleteMessage}
              onResendMessage={handleResendMessage}
            />
          )}
        </Box>

        <Box borderTop="1px" borderColor={borderColor} p={4}>
          <MessageInput
            ref={messageInputRef}
            onSendMessage={handleSendMessage}
            disabled={loading || !isAiInitialized}
            loading={loading}
          />
        </Box>

        {/* Yardım ve Ayarlar Modalleri */}
        <HelpModal isOpen={isHelpOpen} onClose={onHelpClose} />
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={onSettingsClose}
          aiModel={aiModel}
          onAiModelChange={handleModelChange}
          availableModels={availableModels}
        />
      </Flex>
    </ErrorBoundary>
  );
};

export default ChatContainer;
