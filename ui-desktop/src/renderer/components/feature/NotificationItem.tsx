import React, { memo, useMemo, useCallback } from 'react';
import { 
  Box, 
  Flex, 
  Text, 
  IconButton, 
  useColorMode, 
  Badge, 
  HStack, 
  CloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'task';
export type NotificationPriority = 'low' | 'medium' | 'high';

// Notification object interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  snoozedUntil?: Date; // Add optional snooze timestamp
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

// NotificationItem properties
interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onActionClick?: (id: string, actionIndex: number) => void;
  onSnooze?: (id: string, duration: number) => void; // Add snooze handler prop
}

// Helper to get icon based on type
const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'success': return '✅';
    case 'warning': return '⚠️';
    case 'error': return '❌';
    case 'task': return '⏳';
    case 'info':
    default: return 'ℹ️';
  }
};

// Helper to get color scheme based on type
const getNotificationColorScheme = (type: NotificationType): string => {
  switch (type) {
    case 'success': return 'green';
    case 'warning': return 'orange';
    case 'error': return 'red';
    case 'task': return 'blue';
    case 'info':
    default: return 'gray';
  }
};

// Helper to format timestamp
const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Şimdi';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} dk önce`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} sa önce`;
  } else {
    return date.toLocaleDateString(); // Older than a day, show date
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = memo(({
  notification,
  onDismiss,
  onMarkAsRead,
  onActionClick
}) => {
  const { colorMode } = useColorMode();

  const icon = useMemo(() => getNotificationIcon(notification.type), [notification.type]);
  const colorScheme = useMemo(() => getNotificationColorScheme(notification.type), [notification.type]);
  const timestampText = useMemo(() => formatTimestamp(notification.timestamp), [notification.timestamp]);

  const handleDismiss = useCallback(() => {
    onDismiss(notification.id);
  }, [notification.id, onDismiss]);

  const handleMarkAsRead = useCallback(() => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  }, [notification.id, onMarkAsRead]);

  const handleAction = useCallback((index: number) => {
    if (onActionClick) {
      onActionClick(notification.id, index);
    }
  }, [notification.id, onActionClick]);

  const handleSnooze = useCallback((duration: number) => {
    if (onSnooze) {
      onSnooze(notification.id, duration);
    }
  }, [notification.id, onSnooze]);

  const itemBg = colorMode === 'light' ? 'white' : 'gray.700';
  const itemHoverBg = colorMode === 'light' ? 'gray.50' : 'gray.600';
  const unreadBg = colorMode === 'light' ? `${colorScheme}.50` : `${colorScheme}.900`;
  const unreadHoverBg = colorMode === 'light' ? `${colorScheme}.100` : `${colorScheme}.800`;

  return (
    <Box
      p={3}
      mb={2}
      borderRadius="md"
      bg={notification.read ? itemBg : unreadBg}
      borderWidth="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      boxShadow="sm"
      _hover={{ bg: notification.read ? itemHoverBg : unreadHoverBg }}
      transition={animations.createAdaptiveTransition(['background-color', 'box-shadow'], 'fast')}
      position="relative"
      role="listitem"
      aria-labelledby={`notification-title-${notification.id}`}
      aria-describedby={`notification-message-${notification.id}`}
      {...animations.performanceUtils.forceGPU}
    >
      <Flex align="flex-start">
        <Box fontSize="xl" mr={3} mt={1} aria-hidden="true">{icon}</Box>
        <Box flex="1">
          <Flex justifyContent="space-between" alignItems="center" mb={1}>
            <HStack>
              <Text fontWeight="bold" id={`notification-title-${notification.id}`}>{notification.title}</Text>
              {notification.priority === 'high' && <Badge colorScheme='red' variant='solid' fontSize='xs'>Yüksek</Badge>}
              {notification.priority === 'medium' && <Badge colorScheme='orange' variant='solid' fontSize='xs'>Orta</Badge>}
            </HStack>
            <Text fontSize="xs" color="gray.500">{timestampText}</Text>
          </Flex>
          <Text fontSize="sm" color={colorMode === 'light' ? 'gray.700' : 'gray.300'} id={`notification-message-${notification.id}`}>
            {notification.message}
          </Text>
          {(notification.actions && notification.actions.length > 0) && (
            <HStack mt={2} spacing={2}>
              {notification.actions.map((action, index) => (
                <Badge
                  key={index}
                  as="button"
                  variant="subtle"
                  colorScheme={colorScheme}
                  onClick={() => handleAction(index)}
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  cursor="pointer"
                  _hover={{ bg: `${colorScheme}.200` }}
                  aria-label={`${action.label}: ${notification.title}`}
                >
                  {action.label}
                </Badge>
              ))}
            </HStack>
          )}
        </Box>
        <Flex direction="column" ml={2}>
          <CloseButton 
            size="sm" 
            onClick={handleDismiss} 
            aria-label="Bildirimi kapat"
            mb={1}
          />
          {onSnooze && (
            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Bildirimi ertele"
                icon={<Box fontSize="xs">⏰</Box>}
                variant="ghost"
                size="sm"
              />
              <MenuList minWidth="120px">
                <MenuItem onClick={() => handleSnooze(5 * 60)}>5 dakika</MenuItem>
                <MenuItem onClick={() => handleSnooze(15 * 60)}>15 dakika</MenuItem>
                <MenuItem onClick={() => handleSnooze(60 * 60)}>1 saat</MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
      {!notification.read && onMarkAsRead && (
        <Box 
          as="button"
          position="absolute"
          bottom="8px"
          right="8px"
          width="10px"
          height="10px"
          borderRadius="full"
          bg={`${colorScheme}.500`}
          onClick={handleMarkAsRead}
          aria-label="Okundu olarak işaretle"
          title="Okundu olarak işaretle"
          _hover={{ transform: 'scale(1.2)' }}
          transition="transform 0.1s ease-out"
        />
      )}
    </Box>
  );
});

NotificationItem.displayName = 'NotificationItem';

