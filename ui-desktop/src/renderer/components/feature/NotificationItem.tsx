import React, { memo, useCallback } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorMode,
  Badge,
  IconButton,
  HStack,
  Button
} from '@chakra-ui/react';
import { OptimizedAnimation } from '@/components/core/OptimizedAnimation';
import type { Notification } from './NotificationCenter'; // Import type

// Helper functions (moved from NotificationCenter)
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'info':
      return 'blue';
    case 'success':
      return 'green';
    case 'warning':
      return 'orange';
    case 'error':
      return 'red';
    case 'system':
      return 'purple';
    default:
      return 'gray';
  }
};

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return { color: 'red', label: 'Urgent' };
    case 'high':
      return { color: 'orange', label: 'High' };
    case 'medium':
      return { color: 'yellow', label: 'Medium' };
    case 'low':
      return { color: 'green', label: 'Low' };
    default:
      return { color: 'gray', label: 'Normal' };
  }
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onRead: (id: string) => void;
  onClear: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = memo(({
  notification,
  index,
  onRead,
  onClear
}) => {
  const { colorMode } = useColorMode();
  const categoryColor = getCategoryColor(notification.category);
  const priorityInfo = getPriorityIndicator(notification.priority);

  const handleItemClick = useCallback(() => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
  }, [notification.isRead, notification.id, onRead]);

  const handleClearClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClear(notification.id);
  }, [notification.id, onClear]);

  const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  }, []);

  return (
    <OptimizedAnimation
      animationType="fade"
      duration={0.3}
      delay={index * 0.05}
    >
      <Box
        p={3}
        mb={2}
        borderRadius="md"
        bg={colorMode === 'light'
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(26, 32, 44, 0.8)'
        }
        boxShadow="sm"
        borderLeft="4px solid"
        borderLeftColor={`${categoryColor}.500`}
        opacity={notification.isRead ? 0.7 : 1}
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'md',
          opacity: 1
        }}
        transition="all 0.2s"
        onClick={handleItemClick}
        role="listitem"
        aria-label={`${notification.title} notification`}
        cursor="pointer"
      >
        <Flex justify="space-between" align="center" mb={1}>
          <Heading size="xs" fontWeight="bold">
            {notification.title}
          </Heading>
          <HStack spacing={1}>
            {!notification.isRead && (
              <Badge
                colorScheme="blue"
                variant="solid"
                fontSize="2xs"
                borderRadius="full"
                px={1}
              >
                New
              </Badge>
            )}
            <Badge
              colorScheme={priorityInfo.color}
              variant="subtle"
              fontSize="2xs"
            >
              {priorityInfo.label}
            </Badge>
          </HStack>
        </Flex>

        <Text fontSize="sm" mb={2}>
          {notification.message}
        </Text>

        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="gray.500">
            {new Date(notification.timestamp).toLocaleString()}
          </Text>

          <HStack spacing={1}>
            {notification.actions?.map((action, idx) => (
              <Button
                key={idx}
                size="xs"
                variant="ghost"
                onClick={(e) => handleActionClick(e, action.action)}
              >
                {action.label}
              </Button>
            ))}
            <IconButton
              aria-label="Clear notification"
              icon={<span>×</span>}
              size="xs"
              variant="ghost"
              onClick={handleClearClick}
            />
          </HStack>
        </Flex>
      </Box>
    </OptimizedAnimation>
  );
});

NotificationItem.displayName = 'NotificationItem';

