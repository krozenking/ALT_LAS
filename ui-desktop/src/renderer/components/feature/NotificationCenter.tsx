import React, { useState, useEffect, useRef } from 'react';
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
  HStack,
  Divider,
  Button
} from '@chakra-ui/react';
import { glassmorphism } from '@/styles/theme';
import { OptimizedAnimation } from '@/components/core/OptimizedAnimation';
import { VirtualList } from '@/components/core/VirtualList';

// Types for notifications
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

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onNotificationRead,
  onNotificationClear,
  onClearAll,
  maxHeight = '80vh',
  position = 'top-right',
}) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [unreadCount, setUnreadCount] = useState(0);
  const [groupedNotifications, setGroupedNotifications] = useState<Record<string, Notification[]>>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  
  // Calculate unread count and group notifications
  useEffect(() => {
    // Count unread notifications
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
    
    // Group notifications by category
    const grouped = notifications.reduce((acc, notification) => {
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
        // First by priority (urgent > high > medium > low)
        const priorityOrder = { urgent: 3, high: 2, medium: 1, low: 0 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by timestamp (newest first)
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    });
    
    setGroupedNotifications(grouped);
  }, [notifications]);
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onNotificationRead) {
      onNotificationRead(notification.id);
    }
  };
  
  // Get position styles
  const getPositionStyles = () => {
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
  
  // Get category color
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
  
  // Get priority indicator
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
  
  // Render notification item
  const renderNotificationItem = (notification: Notification, index: number) => {
    const categoryColor = getCategoryColor(notification.category);
    const priorityInfo = getPriorityIndicator(notification.priority);
    
    return (
      <OptimizedAnimation 
        key={notification.id}
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
          onClick={() => handleNotificationClick(notification)}
          role="listitem"
          aria-label={`${notification.title} notification`}
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
            
            {notification.actions && notification.actions.length > 0 && (
              <HStack spacing={1}>
                {notification.actions.map((action, idx) => (
                  <Button 
                    key={idx}
                    size="xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </HStack>
            )}
            
            {onNotificationClear && (
              <IconButton
                aria-label="Clear notification"
                icon={<span>×</span>}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onNotificationClear(notification.id);
                }}
              />
            )}
          </Flex>
        </Box>
      </OptimizedAnimation>
    );
  };
  
  return (
    <>
      {/* Notification Bell Button */}
      <Box
        position="fixed"
        zIndex={1000}
        {...getPositionStyles()}
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
              {notifications.length > 0 && onClearAll && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onClearAll}
                  aria-label="Clear all notifications"
                >
                  Clear All
                </Button>
              )}
            </Flex>
          </DrawerHeader>
          
          <DrawerBody>
            {notifications.length === 0 ? (
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
                      itemHeight={120} // Approximate height of each notification
                      renderItem={renderNotificationItem}
                      height={Math.min(categoryNotifications.length * 120, 400)}
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
};

export default NotificationCenter;
