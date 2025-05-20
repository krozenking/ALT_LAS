import React from 'react';
import {
  IconButton,
  Badge,
  Box,
  useDisclosure,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';
import { useNotifications, NotificationList } from './NotificationSystem';
import useTranslation from '../../hooks/useTranslation';

interface NotificationButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

const NotificationButton: React.FC<NotificationButtonProps> = ({ size = 'sm' }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { unreadCount } = useNotifications();
  const { t } = useTranslation();
  
  // Renk değişkenleri
  const badgeBg = useColorModeValue('red.500', 'red.300');
  const badgeColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box position="relative">
      <Tooltip label={t('notifications.title')}>
        <IconButton
          aria-label={t('notifications.title')}
          icon={<FiBell />}
          size={size}
          variant="ghost"
          onClick={onToggle}
          position="relative"
        />
      </Tooltip>
      
      {unreadCount > 0 && (
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          fontSize="0.8em"
          borderRadius="full"
          bg={badgeBg}
          color={badgeColor}
          minW="1.6em"
          height="1.6em"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
          zIndex={1}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      
      {isOpen && <NotificationList isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
};

export default NotificationButton;
