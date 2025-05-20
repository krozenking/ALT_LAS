import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  useToast,
  useColorModeValue,
  Tooltip,
  Badge
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { FiFolder, FiSave, FiList } from 'react-icons/fi';
import useTranslation from '../../hooks/useTranslation';

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

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ConversationManagerProps {
  userId: string;
  currentMessages: Message[];
  onLoadConversation: (messages: Message[]) => void;
  onClearConversation: () => void;
  onExportConversation: () => void;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  userId,
  currentMessages,
  onLoadConversation,
  onClearConversation,
  onExportConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { isOpen: isSaveModalOpen, onOpen: onSaveModalOpen, onClose: onSaveModalClose } = useDisclosure();
  const { isOpen: isLoadModalOpen, onOpen: onLoadModalOpen, onClose: onLoadModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();

  const toast = useToast();
  const { t } = useTranslation();

  const menuBg = useColorModeValue('white', 'gray.700');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');

  // Konuşmaları yükle
  useEffect(() => {
    loadConversations();
  }, [userId]);

  // Konuşmaları yerel depolamadan yükle
  const loadConversations = () => {
    try {
      const savedConversations = localStorage.getItem(`conversations_${userId}`);
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (error) {
      console.error('Konuşma geçmişi yüklenirken hata:', error);
    }
  };

  // Konuşmaları yerel depolamaya kaydet
  const saveConversations = (updatedConversations: Conversation[]) => {
    try {
      localStorage.setItem(`conversations_${userId}`, JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
    } catch (error) {
      console.error('Konuşma geçmişi kaydedilirken hata:', error);
    }
  };

  // Yeni konuşma kaydet
  const handleSaveConversation = () => {
    if (currentMessages.length === 0) {
      toast({
        title: t('chat.conversation.empty'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    if (!newConversationTitle.trim()) {
      toast({
        title: t('chat.conversation.titleRequired'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: newConversationTitle,
      createdAt: now,
      updatedAt: now,
      messageCount: currentMessages.length
    };

    // Konuşma mesajlarını kaydet
    localStorage.setItem(`conversation_messages_${newConversation.id}`, JSON.stringify(currentMessages));

    // Konuşma listesini güncelle
    const updatedConversations = [...conversations, newConversation];
    saveConversations(updatedConversations);

    setNewConversationTitle('');
    onSaveModalClose();

    toast({
      title: t('chat.conversation.saved'),
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  // Konuşma yükle
  const handleLoadConversation = (conversationId: string) => {
    try {
      const savedMessages = localStorage.getItem(`conversation_messages_${conversationId}`);
      if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        onLoadConversation(messages);
        setSelectedConversation(conversationId);
        onLoadModalClose();

        toast({
          title: t('chat.conversation.loaded'),
          status: 'success',
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Konuşma yüklenirken hata:', error);
      toast({
        title: t('errors.general'),
        description: t('errors.tryAgain'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Konuşma sil
  const handleDeleteConversation = (conversationId: string) => {
    try {
      // Konuşma mesajlarını sil
      localStorage.removeItem(`conversation_messages_${conversationId}`);

      // Konuşma listesinden kaldır
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      saveConversations(updatedConversations);

      if (selectedConversation === conversationId) {
        setSelectedConversation(null);
      }

      onDeleteModalClose();

      toast({
        title: t('chat.conversation.deleted'),
        status: 'info',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Konuşma silinirken hata:', error);
      toast({
        title: t('errors.general'),
        description: t('errors.tryAgain'),
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Konuşma başlığını düzenle
  const handleEditTitle = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setEditingTitle(conversationId);
      setEditTitle(conversation.title);
    }
  };

  // Başlık düzenlemeyi kaydet
  const saveEditedTitle = (conversationId: string) => {
    if (!editTitle.trim()) {
      toast({
        title: t('chat.conversation.titleRequired'),
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          title: editTitle,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });

    saveConversations(updatedConversations);
    setEditingTitle(null);

    toast({
      title: t('chat.conversation.titleUpdated'),
      status: 'success',
      duration: 2000,
      isClosable: true
    });
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <>
      <Menu>
        <Tooltip label={t('chat.conversation.actions')}>
          <MenuButton
            as={IconButton}
            aria-label={t('chat.conversation.actions')}
            icon={<FiFolder />}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
        <MenuList bg={menuBg} borderColor={menuBorderColor}>
          <MenuItem icon={<FiSave />} onClick={onSaveModalOpen}>
            {t('chat.conversation.save')}
          </MenuItem>
          <MenuItem icon={<FiList />} onClick={onLoadModalOpen}>
            {t('chat.conversation.load')}
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<CopyIcon />} onClick={onExportConversation}>
            {t('chat.conversation.export')}
          </MenuItem>
          <MenuItem icon={<DeleteIcon />} onClick={onClearConversation}>
            {t('chat.conversation.clear')}
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Konuşma Kaydetme Modalı */}
      <Modal isOpen={isSaveModalOpen} onClose={onSaveModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('chat.conversation.save')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>{t('chat.conversation.saveDescription')}</Text>
            <Input
              placeholder={t('chat.conversation.titlePlaceholder')}
              value={newConversationTitle}
              onChange={(e) => setNewConversationTitle(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSaveModalClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveConversation}>
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Konuşma Yükleme Modalı */}
      <Modal isOpen={isLoadModalOpen} onClose={onLoadModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('chat.conversation.load')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {conversations.length === 0 ? (
              <Text>{t('chat.conversation.noSavedConversations')}</Text>
            ) : (
              <Box maxH="400px" overflowY="auto">
                {conversations.map((conv) => (
                  <Box
                    key={conv.id}
                    p={3}
                    mb={2}
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor={selectedConversation === conv.id ? 'blue.500' : menuBorderColor}
                  >
                    <Flex justify="space-between" align="center">
                      {editingTitle === conv.id ? (
                        <Flex flex="1" mr={2}>
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            size="sm"
                          />
                          <IconButton
                            aria-label={t('common.save')}
                            icon={<CheckIcon />}
                            size="sm"
                            ml={1}
                            onClick={() => saveEditedTitle(conv.id)}
                          />
                        </Flex>
                      ) : (
                        <Box flex="1">
                          <Text fontWeight="bold">{conv.title}</Text>
                        </Box>
                      )}
                      <Flex>
                        <IconButton
                          aria-label={t('common.edit')}
                          icon={<EditIcon />}
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTitle(conv.id)}
                          mr={1}
                        />
                        <IconButton
                          aria-label={t('common.delete')}
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteConversation(conv.id)}
                        />
                      </Flex>
                    </Flex>
                    <Flex mt={2} fontSize="xs" color="gray.500" justify="space-between">
                      <Text>{formatDate(conv.updatedAt)}</Text>
                      <Badge>{conv.messageCount} {t('chat.messages.count')}</Badge>
                    </Flex>
                    <Button
                      mt={2}
                      size="sm"
                      width="100%"
                      onClick={() => handleLoadConversation(conv.id)}
                    >
                      {t('chat.conversation.loadThis')}
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onLoadModalClose}>
              {t('common.close')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ConversationManager;
