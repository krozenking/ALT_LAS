import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button, Flex, Text, Badge, Tooltip, IconButton, useColorModeValue, useDisclosure, HStack, Avatar } from '@chakra-ui/react';
import { ChevronDownIcon, SettingsIcon, InfoIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiUser } from 'react-icons/fi';
import SettingsDrawer from './SettingsDrawer';
import HelpModal from './HelpModal';
import ConversationManager from './ConversationManager';
import UserProfileDrawer from '../User/UserProfileDrawer';
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

// Kullanıcı arayüzü
interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  lastActive?: string;
  conversations?: string[];
}

interface ChatHeaderProps {
  title: string;
  models: { id: string; name: string }[];
  activeModel: string;
  onModelChange: (modelId: string) => void;
  isAiInitialized: boolean;
  onClearChat?: () => void;
  userId: string;
  messages: Message[];
  onLoadConversation: (messages: Message[]) => void;
  onExportConversation: () => void;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  models,
  activeModel,
  onModelChange,
  isAiInitialized,
  onClearChat,
  userId,
  messages,
  onLoadConversation,
  onExportConversation,
  user,
  onUpdateUser
}) => {
  const activeModelName = models.find(model => model.id === activeModel)?.name || activeModel;
  const { t } = useTranslation();

  // Drawer ve Modal için state
  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose
  } = useDisclosure();

  const {
    isOpen: isHelpOpen,
    onOpen: onHelpOpen,
    onClose: onHelpClose
  } = useDisclosure();

  const {
    isOpen: isProfileOpen,
    onOpen: onProfileOpen,
    onClose: onProfileClose
  } = useDisclosure();

  // Renk değişkenleri
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const badgeBg = useColorModeValue(
    isAiInitialized ? 'green.100' : 'red.100',
    isAiInitialized ? 'green.800' : 'red.800'
  );
  const badgeColor = useColorModeValue(
    isAiInitialized ? 'green.800' : 'red.800',
    isAiInitialized ? 'green.100' : 'red.100'
  );

  return (
    <>
      <Flex
        p={4}
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        justifyContent="space-between"
        alignItems="center"
        className="chat-header"
      >
        <Flex alignItems="center">
          <Text fontWeight="bold" fontSize="lg" mr={2}>
            {title}
          </Text>
          <Badge
            bg={badgeBg}
            color={badgeColor}
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {isAiInitialized ? 'Çevrimiçi' : 'Çevrimdışı'}
          </Badge>
        </Flex>

        <HStack spacing={2}>
          {/* Kullanıcı Profili */}
          <Tooltip label={t('user.profile')}>
            <Button
              size="sm"
              variant="ghost"
              onClick={onProfileOpen}
              leftIcon={<Avatar size="xs" name={user.name} src={user.avatar || undefined} />}
              display={{ base: 'none', md: 'flex' }}
            >
              {user.name}
            </Button>
          </Tooltip>

          <Tooltip label={t('user.profile')} display={{ base: 'flex', md: 'none' }}>
            <IconButton
              aria-label={t('user.profile')}
              icon={<FiUser />}
              size="sm"
              variant="ghost"
              onClick={onProfileOpen}
            />
          </Tooltip>

          {/* AI Model Seçici */}
          {isAiInitialized && (
            <Menu>
              <Tooltip label={t('chat.settings.aiModel.select')}>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  size="sm"
                  variant="outline"
                >
                  {activeModelName}
                </MenuButton>
              </Tooltip>
              <MenuList bg={useColorModeValue('white', 'gray.700')} borderColor={borderColor}>
                {models.map(model => (
                  <MenuItem
                    key={model.id}
                    onClick={() => onModelChange(model.id)}
                    bg={model.id === activeModel ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
                    _hover={{
                      bg: useColorModeValue('gray.100', 'gray.600')
                    }}
                  >
                    {model.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}

          <ConversationManager
            userId={userId}
            currentMessages={messages}
            onLoadConversation={onLoadConversation}
            onClearConversation={onClearChat || (() => {})}
            onExportConversation={onExportConversation}
          />

          {onClearChat && (
            <Tooltip label={t('chat.conversation.clear')}>
              <IconButton
                aria-label={t('chat.conversation.clear')}
                icon={<DeleteIcon />}
                size="sm"
                variant="ghost"
                onClick={onClearChat}
              />
            </Tooltip>
          )}

          <Tooltip label={t('chat.settings.title')}>
            <IconButton
              aria-label={t('chat.settings.title')}
              icon={<SettingsIcon />}
              size="sm"
              variant="ghost"
              onClick={onSettingsOpen}
            />
          </Tooltip>

          <Tooltip label={t('chat.help.title')}>
            <IconButton
              aria-label={t('chat.help.title')}
              icon={<InfoIcon />}
              size="sm"
              variant="ghost"
              onClick={onHelpOpen}
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Ayarlar Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
        aiModel={activeModel}
        onAiModelChange={onModelChange}
        availableModels={models}
      />

      {/* Yardım Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={onHelpClose}
      />

      {/* Kullanıcı Profili Drawer */}
      <UserProfileDrawer
        isOpen={isProfileOpen}
        onClose={onProfileClose}
        user={user}
        onUpdateUser={onUpdateUser}
      />
    </>
  );
};

export default ChatHeader;
