import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
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
  useToast
} from '@chakra-ui/react';
import { NotificationItem, Notification, NotificationType } from './NotificationItem';
import { animations } from '@/styles/animations';

// NotificationCenter properties
interface NotificationCenterProps {
  initialNotifications?: Notification[];
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
  
  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Filter notifications based on active filter and search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      // Apply type/status filter
      const matchesFilter = 
        activeFilter === 'all' || 
        (activeFilter === 'unread' && !notification.read) ||
        notification.type === activeFilter;
      
      // Apply search filter
      const matchesSearch = 
        searchQuery === '' ||
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [notifications, activeFilter, searchQuery]);
  
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
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    
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
  }, [onNotificationDismiss, toast]);
  
  // Handle marking notification as read
  const handleMarkAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    if (onNotificationRead) {
      onNotificationRead(id);
    }
  }, [onNotificationRead]);
  
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
    setNotifications([]);
    
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
  }, [onClearAll, toast]);
  
  // Handle clear read notifications
  const handleClearRead = useCallback(() => {
    setNotifications(prev => prev.filter(notification => !notification.read));
    
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
  }, [onClearRead, toast]);
  
  // Handle filter change
  const handleFilterChange = useCallback((filter: NotificationFilter) => {
    setActiveFilter(filter);
  }, []);
  
  // Handle search change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);
  
  // Mark all as read
  const handleMarkAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
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
  }, [notifications, onNotificationRead, toast]);
  
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
              
              <Divider />
              
              {/* Notification List */}
              {filteredNotifications.length > 0 ? (
                <Box role="list" aria-label="Bildirimler">
                  {groupedNotifications.map(([groupName, groupNotifications]) => (
                    <Box key={groupName} mb={4}>
                      <Text fontWeight="medium" mb={2} color="gray.500">{groupName}</Text>
                      {groupNotifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onDismiss={handleDismiss}
                          onMarkAsRead={handleMarkAsRead}
                          onActionClick={handleActionClick}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Flex 
                  height="200px" 
                  alignItems="center" 
                  justifyContent="center" 
                  flexDirection="column"
                  p={8}
                >
                  <Box fontSize="4xl" mb={4} aria-hidden="true">📭</Box>
                  <Text color="gray.500">
                    {searchQuery 
                      ? 'Arama kriterlerine uygun bildirim bulunamadı' 
                      : activeFilter !== 'all' 
                        ? `${activeFilter === 'unread' ? 'Okunmamış' : activeFilter} bildirim bulunamadı` 
                        : 'Bildirim bulunmuyor'}
                  </Text>
                </Flex>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
