import React, { useState, useEffect, useCallback, useMemo, memo, useRef, useTransition, useDeferredValue } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorMode,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Tooltip,
  VisuallyHidden,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { NotificationItem, Notification, NotificationType } from './NotificationItem';
import { animations } from '@/styles/animations';

// NotificationCenter properties
interface NotificationCenterProps {
  initialNotifications?: Notification[];
  isFocusModeActive?: boolean; // Add prop to indicate focus mode status
  onNotificationRead?: (id: string) => void;
  onNotificationDismiss?: (id: string) => void;
  onNotificationAction?: (id: string, actionIndex: number) => void;
  onClearAll?: () => void;
  onClearRead?: () => void;
}

// Filter types
type NotificationFilter = 'all' | 'unread' | NotificationType;

export const NotificationCenter: React.FC<NotificationCenterProps> = memo(({
  initialNotifications = [],
  isFocusModeActive = false, // Default to false
  onNotificationRead,
  onNotificationDismiss,
  onNotificationAction,
  onClearAll,
  onClearRead
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const btnRef = useRef<HTMLButtonElement>(null);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Add useTransition for state updates that might cause UI to feel sluggish
  const [isPending, startTransition] = useTransition();
  
  // Use useDeferredValue for search query to prevent UI freezing during typing
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Filter notifications based on active filter and search query
  // Use deferredSearchQuery instead of searchQuery for filtering
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Skip high priority notifications in focus mode
      if (isFocusModeActive && notification.priority !== 'high') {
        return false;
      }
      
      // Apply type/status filter
      const matchesFilter = 
        activeFilter === 'all' || 
        (activeFilter === 'unread' && !notification.read) ||
        notification.type === activeFilter;
      
      // Apply search filter using deferred search query
      const matchesSearch = 
        deferredSearchQuery === '' ||
        notification.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(deferredSearchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [notifications, activeFilter, deferredSearchQuery, isFocusModeActive]);
  
  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const groups: { [key: string]: Notification[] } = {
      'Bugün': [],
      'Dün': [],
      'Bu Hafta': [],
      'Daha Eski': []
    };
    
    filteredNotifications.forEach(notification => {
      const notifDate = new Date(notification.timestamp);
      notifDate.setHours(0, 0, 0, 0);
      
      if (notifDate.getTime() === today.getTime()) {
        groups['Bugün'].push(notification);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups['Dün'].push(notification);
      } else if (notifDate.getTime() >= lastWeek.getTime()) {
        groups['Bu Hafta'].push(notification);
      } else {
        groups['Daha Eski'].push(notification);
      }
    });
    
    // Remove empty groups
    return Object.entries(groups).filter(([_, groupNotifications]) => groupNotifications.length > 0);
  }, [filteredNotifications]);
  
  // Handle notification dismissal
  const handleDismiss = useCallback((id: string) => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    });
    
    if (onNotificationDismiss) {
      onNotificationDismiss(id);
    }
    
    toast({
      title: "Bildirim kapatıldı",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "bottom-right"
    });
  }, [onNotificationDismiss, toast, startTransition]);
  
  // Handle marking notification as read
  const handleMarkAsRead = useCallback((id: string) => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
    });
    
    if (onNotificationRead) {
      onNotificationRead(id);
    }
  }, [onNotificationRead, startTransition]);
  
  // Handle notification snooze
  const handleSnooze = useCallback((id: string, duration: number) => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      // Hide notification temporarily
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, snoozedUntil: new Date(Date.now() + duration * 1000) } 
            : notification
        )
      );
    });
    
    toast({
      title: `Bildirim ${Math.floor(duration / 60)} dakika ertelendi`,
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "bottom-right"
    });
    
    // Set timeout to "unsnooze" after duration
    setTimeout(() => {
      startTransition(() => {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, snoozedUntil: undefined } 
              : notification
          )
        );
      });
      
      toast({
        title: "Ertelenen bildirim geri döndü",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "bottom-right"
      });
    }, duration * 1000);
  }, [toast, startTransition]);
  
  // Handle notification action click
  const handleActionClick = useCallback((id: string, actionIndex: number) => {
    const notification = notifications.find(n => n.id === id);
    
    if (notification && notification.actions && notification.actions[actionIndex]) {
      // Execute the action
      notification.actions[actionIndex].onClick();
      
      // Mark as read after action
      handleMarkAsRead(id);
      
      if (onNotificationAction) {
        onNotificationAction(id, actionIndex);
      }
    }
  }, [notifications, handleMarkAsRead, onNotificationAction]);
  
  // Handle clear all notifications
  const handleClearAll = useCallback(() => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      setNotifications([]);
    });
    
    if (onClearAll) {
      onClearAll();
    }
    
    toast({
      title: "Tüm bildirimler temizlendi",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "bottom-right"
    });
  }, [onClearAll, toast, startTransition]);
  
  // Handle clear read notifications
  const handleClearRead = useCallback(() => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      setNotifications(prev => prev.filter(notification => !notification.read));
    });
    
    if (onClearRead) {
      onClearRead();
    }
    
    toast({
      title: "Okunmuş bildirimler temizlendi",
      status: "info",
      duration: 2000,
      isClosable: true,
      position: "bottom-right"
    });
  }, [onClearRead, toast, startTransition]);
  
  // Handle filter change
  const handleFilterChange = useCallback((filter: NotificationFilter) => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      setActiveFilter(filter);
    });
  }, [startTransition]);
  
  // Handle search change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // This update is not wrapped in startTransition because we want the input to be responsive
    // The actual filtering is deferred using useDeferredValue
    setSearchQuery(e.target.value);
  }, []);
  
  // Mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    // Use startTransition to mark this state update as non-urgent
    startTransition(() => {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    });
    
    if (onNotificationRead) {
      notifications.forEach(notification => {
        if (!notification.read) {
          onNotificationRead(notification.id);
        }
      });
    }
    
    toast({
      title: "Tüm bildirimler okundu olarak işaretlendi",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "bottom-right"
    });
  }, [notifications, onNotificationRead, toast, startTransition]);
  
  // Get notification type counts
  const typeCounts = useMemo(() => {
    const counts: Record<NotificationFilter, number> = {
      all: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      info: notifications.filter(n => n.type === 'info').length,
      success: notifications.filter(n => n.type === 'success').length,
      warning: notifications.filter(n => n.type === 'warning').length,
      error: notifications.filter(n => n.type === 'error').length,
      task: notifications.filter(n => n.type === 'task').length,
    };
    return counts;
  }, [notifications]);
  
  // Notification bell icon with unread indicator
  const NotificationBell = (
    <Box position="relative">
      <Box fontSize="xl" aria-hidden="true">🔔</Box>
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
          p="0"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
      <VisuallyHidden>
        {unreadCount > 0 
          ? `${unreadCount} okunmamış bildirim` 
          : 'Bildirim yok'}
      </VisuallyHidden>
    </Box>
  );
  
  return (
    <>
      {/* Notification Bell Button */}
      <Tooltip label={`Bildirimler (${unreadCount} okunmamış)`} aria-label="Bildirimler">
        <IconButton
          ref={btnRef}
          aria-label="Bildirimleri aç"
          icon={NotificationBell}
          variant="glass"
          onClick={onOpen}
          {...animations.performanceUtils.forceGPU}
        />
      </Tooltip>
      
      {/* Notification Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent
          ref={drawerContentRef}
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-center-header"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" id="notification-center-header">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold">Bildirim Merkezi</Text>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Bildirim işlemleri"
                  icon={<Box aria-hidden="true">⋮</Box>}
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <MenuItem 
                    icon={<Box aria-hidden="true">✓</Box>} 
                    onClick={handleMarkAllAsRead}
                    isDisabled={typeCounts.unread === 0}
                  >
                    Tümünü Okundu İşaretle
                  </MenuItem>
                  <MenuItem 
                    icon={<Box aria-hidden="true">🧹</Box>} 
                    onClick={handleClearRead}
                    isDisabled={notifications.length === typeCounts.unread}
                  >
                    Okunmuşları Temizle
                  </MenuItem>
                  <MenuItem 
                    icon={<Box aria-hidden="true">🗑️</Box>} 
                    onClick={handleClearAll}
                    isDisabled={notifications.length === 0}
                  >
                    Tümünü Temizle
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={4}>
            <VStack spacing={4} align="stretch">
              {/* Search and Filters */}
              <Box>
                <InputGroup mb={3}>
                  <InputLeftElement pointerEvents="none">
                    <Box color="gray.500" aria-hidden="true">🔍</Box>
                  </InputLeftElement>
                  <Input
                    placeholder="Bildirimlerde ara..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Bildirimlerde ara"
                  />
                </InputGroup>
                
                <HStack spacing={2} overflowX="auto" py={2} className="notification-filters" role="tablist" aria-label="Bildirim filtreleri">
                  <Button
                    size="sm"
                    variant={activeFilter === 'all' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('all')}
                    aria-selected={activeFilter === 'all'}
                    role="tab"
                  >
                    Tümü ({typeCounts.all})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeFilter === 'unread' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('unread')}
                    aria-selected={activeFilter === 'unread'}
                    role="tab"
                    colorScheme={typeCounts.unread > 0 ? 'red' : undefined}
                  >
                    Okunmamış ({typeCounts.unread})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeFilter === 'info' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('info')}
                    aria-selected={activeFilter === 'info'}
                    role="tab"
                    leftIcon={<Box aria-hidden="true">ℹ️</Box>}
                  >
                    Bilgi ({typeCounts.info})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeFilter === 'success' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('success')}
                    aria-selected={activeFilter === 'success'}
                    role="tab"
                    leftIcon={<Box aria-hidden="true">✅</Box>}
                  >
                    Başarı ({typeCounts.success})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeFilter === 'warning' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('warning')}
                    aria-selected={activeFilter === 'warning'}
                    role="tab"
                    leftIcon={<Box aria-hidden="true">⚠️</Box>}
                  >
                    Uyarı ({typeCounts.warning})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeFilter === 'error' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('error')}
                    aria-selected={activeFilter === 'error'}
                    role="tab"
                    leftIcon={<Box aria-hidden="true">❌</Box>}
                  >
                    Hata ({typeCounts.error})
                  </Button>
                  <Button
                    size="sm"
                    variant={activeFilter === 'task' ? 'solid' : 'outline'}
                    onClick={() => handleFilterChange('task')}
                    aria-selected={activeFilter === 'task'}
                    role="tab"
                    leftIcon={<Box aria-hidden="true">⏳</Box>}
                  >
                    Görev ({typeCounts.task})
                  </Button>
                </HStack>
              </Box>
              
              {/* Show loading indicator when transitions are pending */}
              {isPending && (
                <Flex justify="center" py={4}>
                  <Spinner size="md" color="blue.500" thickness="3px" speed="0.65s" />
                </Flex>
              )}
              
              {/* Notification List */}
              <Box flex="1" overflowY="auto">
                {groupedNotifications.length === 0 ? (
                  <Flex 
                    direction="column" 
                    align="center" 
                    justify="center" 
                    py={10}
                    color="gray.500"
                  >
                    <Box fontSize="4xl" mb={4} aria-hidden="true">📭</Box>
                    <Text>Bildirim bulunamadı</Text>
                    {searchQuery && (
                      <Text fontSize="sm" mt={2}>
                        "{searchQuery}" için sonuç yok
                      </Text>
                    )}
                  </Flex>
                ) : (
                  <VStack spacing={6} align="stretch">
                    {groupedNotifications.map(([groupName, groupItems]) => (
                      <Box key={groupName}>
                        <Text 
                          fontWeight="medium" 
                          fontSize="sm" 
                          color="gray.500" 
                          mb={2}
                          id={`group-${groupName}`}
                        >
                          {groupName}
                        </Text>
                        <VStack 
                          spacing={2} 
                          align="stretch"
                          role="region"
                          aria-labelledby={`group-${groupName}`}
                        >
                          {groupItems.map(notification => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onDismiss={handleDismiss}
                              onMarkAsRead={handleMarkAsRead}
                              onSnooze={handleSnooze}
                              onActionClick={handleActionClick}
                            />
                          ))}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Display name for debugging
NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
