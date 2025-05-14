import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorMode,
  Badge,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Divider,
  Button
} from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { VirtualList } from '@/components/core/VirtualList';
import { NotificationItem } from './NotificationItem'; // Import the memoized item component

// Types for notifications (can be moved to a types file)
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  category: 'info' | 'success' | 'warning' | 'error' | 'system';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationRead?: (id: string) => void;
  onNotificationClear?: (id: string) => void;
  onClearAll?: () => void;
  maxHeight?: string | number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Helper function for position styles
const getPositionStyles = (position: NotificationCenterProps['position']) => {
  switch (position) {
    case 'top-right':
      return { top: 4, right: 4 };
    case 'top-left':
      return { top: 4, left: 4 };
    case 'bottom-right':
      return { bottom: 4, right: 4 };
    case 'bottom-left':
      return { bottom: 4, left: 4 };
    default:
      return { top: 4, right: 4 };
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = memo(({
  notifications = [],
  onNotificationRead,
  onNotificationClear,
  onClearAll,
  maxHeight = '80vh',
  position = 'top-right',
}) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  // Memoize notifications prop to prevent unnecessary recalculations if the reference hasn't changed
  const memoizedNotifications = useMemo(() => notifications, [notifications]);

  // Calculate unread count using useMemo
  const unreadCount = useMemo(() => {
    return memoizedNotifications.filter(n => !n.isRead).length;
  }, [memoizedNotifications]);

  // Group and sort notifications using useMemo
  const groupedNotifications = useMemo(() => {
    const grouped = memoizedNotifications.reduce((acc, notification) => {
      const category = notification.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(notification);
      return acc;
    }, {} as Record<string, Notification[]>);

    // Sort notifications within each group by priority and timestamp
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Ensure Date objects are used for comparison
      });
    });

    return grouped;
  }, [memoizedNotifications]);

  // Memoize callback functions
  const handleNotificationRead = useCallback((id: string) => {
    if (onNotificationRead) {
      onNotificationRead(id);
    }
  }, [onNotificationRead]);

  const handleNotificationClear = useCallback((id: string) => {
    if (onNotificationClear) {
      onNotificationClear(id);
    }
  }, [onNotificationClear]);

  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    }
  }, [onClearAll]);

  // Memoize the renderItem function for VirtualList
  const renderItem = useCallback((notification: Notification, index: number) => (
    <NotificationItem
      notification={notification}
      index={index}
      onRead={handleNotificationRead}
      onClear={handleNotificationClear}
    />
  ), [handleNotificationRead, handleNotificationClear]);

  const positionStyles = useMemo(() => getPositionStyles(position), [position]);

  return (
    <>
      {/* Notification Bell Button */}
      <Box
        position="fixed"
        zIndex={1000}
        {...positionStyles}
      >
        <Button
          ref={btnRef}
          onClick={onOpen}
          position="relative"
          aria-label={`Open notification center. ${unreadCount} unread notifications.`}
          {...(colorMode === 'light'
            ? glassmorphism.create(0.7, 8, 1)
            : glassmorphism.createDark(0.7, 8, 1)
          )}
        >
          <span aria-hidden="true">🔔</span>
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-8px"
              right="-8px"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="18px"
              height="18px"
              textAlign="center"
              lineHeight="18px"
              p={0}
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </Box>

      {/* Notification Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Notifications</Heading>
              {memoizedNotifications.length > 0 && onClearAll && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearAll}
                  aria-label="Clear all notifications"
                >
                  Clear All
                </Button>
              )}
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            {memoizedNotifications.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                height="100%"
                opacity={0.7}
              >
                <Text>No notifications</Text>
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch">
                {Object.entries(groupedNotifications).map(([category, categoryNotifications]) => (
                  <Box key={category}>
                    <Heading size="sm" mb={2} textTransform="capitalize">
                      {category} ({categoryNotifications.length})
                    </Heading>
                    <Divider mb={2} />

                    <VirtualList
                      items={categoryNotifications}
                      itemHeight={120} // Adjust if NotificationItem height changes
                      renderItem={renderItem}
                      height={Math.min(categoryNotifications.length * 120, 400)} // Limit height per category
                      width="100%"
                      overscan={2}
                    />
                  </Box>
                ))}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;

