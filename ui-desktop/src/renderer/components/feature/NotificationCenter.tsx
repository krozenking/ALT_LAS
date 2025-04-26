import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  Divider
} from '@chakra-ui/react';
import { animations } from '@/styles/animations';

// Notification types
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationCategory = 'system' | 'task' | 'alert' | 'info';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  category: NotificationCategory;
  actions?: NotificationAction[];
  autoClose?: number; // Time in ms after which notification should auto-close
}

interface NotificationCenterProps {
  initialNotifications?: Notification[];
  onNotificationAdd?: (notification: Notification) => void;
  onNotificationRemove?: (id: string) => void;
  onNotificationRead?: (id: string) => void;
  onNotificationClear?: () => void;
}

// Helper function to get priority color - Memoize edilebilir
const getPriorityColor = (priority: NotificationPriority, colorMode: string): string => {
  switch (priority) {
    case 'critical':
      return colorMode === 'light' ? 'red.500' : 'red.300';
    case 'high':
      return colorMode === 'light' ? 'orange.500' : 'orange.300';
    case 'medium':
      return colorMode === 'light' ? 'blue.500' : 'blue.300';
    case 'low':
    default:
      return colorMode === 'light' ? 'gray.500' : 'gray.300';
  }
};

// Helper function to get category icon - Memoize edilebilir
const getCategoryIcon = (category: NotificationCategory): string => {
  switch (category) {
    case 'system':
      return '⚙️';
    case 'task':
      return '📋';
    case 'alert':
      return '⚠️';
    case 'info':
    default:
      return 'ℹ️';
  }
};

// Format relative time - Memoize edilebilir
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Şimdi';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} dakika önce`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} saat önce`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} gün önce`;
  }
};

// Memoize edilmiş NotificationBell bileşeni
const NotificationBell = memo(({ unreadCount, onOpen }: { unreadCount: number, onOpen: () => void }) => {
  return (
    <Box position="relative" display="inline-block">
      <IconButton
        aria-label="Bildirimler"
        icon={<Box fontSize="xl">🔔</Box>}
        variant="glass"
        onClick={onOpen}
        {...animations.performanceUtils.forceGPU}
      />
      
      {/* Unread Badge */}
      {unreadCount > 0 && (
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          borderRadius="full"
          bg="red.500"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          p="1"
          minW="18px"
          textAlign="center"
          animation={`${animations.keyframes.pulse} 2s infinite`}
          {...animations.performanceUtils.forceGPU}
        >
          {unreadCount}
        </Badge>
      )}
    </Box>
  );
});

// Memoize edilmiş NotificationItem bileşeni
const NotificationItem = memo(({ 
  notification, 
  colorMode, 
  onMarkAsRead 
}: { 
  notification: Notification, 
  colorMode: string, 
  onMarkAsRead: (id: string) => void 
}) => {
  // Kategori ikonunu memoize et
  const categoryIcon = useMemo(() => getCategoryIcon(notification.category), [notification.category]);
  
  // Zaman formatını memoize et
  const formattedTime = useMemo(() => formatRelativeTime(notification.timestamp), [notification.timestamp]);
  
  // Renk şemasını memoize et
  const colorScheme = useMemo(() => {
    return notification.priority === 'critical' ? 'red' :
           notification.priority === 'high' ? 'orange' :
           notification.priority === 'medium' ? 'blue' : 'gray';
  }, [notification.priority]);
  
  // Olay işleyicilerini memoize et
  const handleClick = useCallback(() => {
    onMarkAsRead(notification.id);
  }, [notification.id, onMarkAsRead]);
  
  return (
    <Box
      key={notification.id}
      p={4}
      borderBottomWidth="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      bg={!notification.read ? (colorMode === 'light' ? 'blue.50' : 'blue.900') : 'transparent'}
      onClick={handleClick}
      cursor="pointer"
      transition="background-color 0.2s"
      _hover={{
        bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
      }}
      role="region"
      aria-label={`Bildirim: ${notification.title}`}
    >
      <Flex justifyContent="space-between" alignItems="flex-start">
        <Flex alignItems="center">
          <Box 
            mr={3} 
            fontSize="xl"
            aria-hidden="true"
          >
            {categoryIcon}
          </Box>
          <Box>
            <Flex alignItems="center">
              <Text fontWeight="bold" mr={2}>{notification.title}</Text>
              <Badge 
                colorScheme={colorScheme}
                fontSize="xs"
              >
                {notification.priority}
              </Badge>
            </Flex>
            <Text fontSize="sm" color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
              {notification.message}
            </Text>
          </Box>
        </Flex>
        <Text 
          fontSize="xs" 
          color={colorMode === 'light' ? 'gray.500' : 'gray.400'}
          ml={2}
        >
          {formattedTime}
        </Text>
      </Flex>
      
      {/* Notification Actions */}
      {notification.actions && notification.actions.length > 0 && (
        <NotificationActions actions={notification.actions} />
      )}
    </Box>
  );
});

// Memoize edilmiş NotificationActions bileşeni
const NotificationActions = memo(({ actions }: { actions: NotificationAction[] }) => {
  return (
    <Flex mt={3} justifyContent="flex-end">
      {actions.map((action, index) => (
        <Button
          key={index}
          size="sm"
          variant={index === 0 ? 'solid' : 'outline'}
          colorScheme={index === 0 ? 'blue' : 'gray'}
          ml={2}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
        >
          {action.label}
        </Button>
      ))}
    </Flex>
  );
});

// Memoize edilmiş NotificationFilters bileşeni
const NotificationFilters = memo(({ 
  onSetActiveFilter, 
  onSetActivePriorityFilter, 
  onMarkAllAsRead, 
  onClearAllNotifications 
}: { 
  onSetActiveFilter: (filter: NotificationCategory | 'all') => void, 
  onSetActivePriorityFilter: (priority: NotificationPriority | 'all') => void, 
  onMarkAllAsRead: () => void, 
  onClearAllNotifications: () => void 
}) => {
  // Kategori filtre işleyicilerini memoize et
  const handleFilterAll = useCallback(() => onSetActiveFilter('all'), [onSetActiveFilter]);
  const handleFilterSystem = useCallback(() => onSetActiveFilter('system'), [onSetActiveFilter]);
  const handleFilterTask = useCallback(() => onSetActiveFilter('task'), [onSetActiveFilter]);
  const handleFilterAlert = useCallback(() => onSetActiveFilter('alert'), [onSetActiveFilter]);
  const handleFilterInfo = useCallback(() => onSetActiveFilter('info'), [onSetActiveFilter]);
  
  // Öncelik filtre işleyicilerini memoize et
  const handlePriorityAll = useCallback(() => onSetActivePriorityFilter('all'), [onSetActivePriorityFilter]);
  const handlePriorityCritical = useCallback(() => onSetActivePriorityFilter('critical'), [onSetActivePriorityFilter]);
  const handlePriorityHigh = useCallback(() => onSetActivePriorityFilter('high'), [onSetActivePriorityFilter]);
  const handlePriorityMedium = useCallback(() => onSetActivePriorityFilter('medium'), [onSetActivePriorityFilter]);
  const handlePriorityLow = useCallback(() => onSetActivePriorityFilter('low'), [onSetActivePriorityFilter]);
  
  return (
    <Flex>
      <Menu>
        <MenuButton 
          as={Button} 
          variant="ghost" 
          size="sm" 
          mr={2}
          aria-label="Filtrele"
        >
          Filtrele
        </MenuButton>
        <MenuList>
          <MenuItem onClick={handleFilterAll}>
            Tüm Kategoriler
          </MenuItem>
          <MenuItem onClick={handleFilterSystem}>
            Sistem
          </MenuItem>
          <MenuItem onClick={handleFilterTask}>
            Görevler
          </MenuItem>
          <MenuItem onClick={handleFilterAlert}>
            Uyarılar
          </MenuItem>
          <MenuItem onClick={handleFilterInfo}>
            Bilgiler
          </MenuItem>
          <Divider my={2} />
          <MenuItem onClick={handlePriorityAll}>
            Tüm Öncelikler
          </MenuItem>
          <MenuItem onClick={handlePriorityCritical}>
            Kritik
          </MenuItem>
          <MenuItem onClick={handlePriorityHigh}>
            Yüksek
          </MenuItem>
          <MenuItem onClick={handlePriorityMedium}>
            Orta
          </MenuItem>
          <MenuItem onClick={handlePriorityLow}>
            Düşük
          </MenuItem>
        </MenuList>
      </Menu>
      <Menu>
        <MenuButton 
          as={Button} 
          variant="ghost" 
          size="sm"
          aria-label="İşlemler"
        >
          İşlemler
        </MenuButton>
        <MenuList>
          <MenuItem onClick={onMarkAllAsRead}>
            Tümünü Okundu İşaretle
          </MenuItem>
          <MenuItem onClick={onClearAllNotifications}>
            Tümünü Temizle
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
});

// Memoize edilmiş NotificationList bileşeni
const NotificationList = memo(({ 
  notifications, 
  colorMode, 
  onMarkAsRead, 
  showOnlyUnread = false 
}: { 
  notifications: Notification[], 
  colorMode: string, 
  onMarkAsRead: (id: string) => void, 
  showOnlyUnread?: boolean 
}) => {
  // Gösterilecek bildirimleri filtrele
  const displayedNotifications = useMemo(() => {
    return showOnlyUnread ? notifications.filter(n => !n.read) : notifications;
  }, [notifications, showOnlyUnread]);
  
  if (displayedNotifications.length === 0) {
    return (
      <Box p={8} textAlign="center">
        <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
          {showOnlyUnread ? 'Okunmamış bildirim bulunmuyor' : 'Bildirim bulunmuyor'}
        </Text>
      </Box>
    );
  }
  
  return (
    <>
      {displayedNotifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          colorMode={colorMode}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </>
  );
});

export const NotificationCenter: React.FC<NotificationCenterProps> = memo(({
  initialNotifications = [],
  onNotificationAdd,
  onNotificationRemove,
  onNotificationRead,
  onNotificationClear
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory | 'all'>('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState<NotificationPriority | 'all'>('all');
  
  // Count unread notifications - useMemo ile optimize edildi
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);
  
  // Add notification
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (onNotificationAdd) {
      onNotificationAdd(notification);
    }
    
    // Auto-close notification if specified
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.autoClose);
    }
  }, [onNotificationAdd]);
  
  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    if (onNotificationRemove) {
      onNotificationRemove(id);
    }
  }, [onNotificationRemove]);
  
  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
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
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);
  
  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    if (onNotificationClear) {
      onNotificationClear();
    }
  }, [onNotificationClear]);
  
  // Filter notifications - useMemo ile optimize edildi
  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const categoryMatch = activeFilter === 'all' || notification.category === activeFilter;
      const priorityMatch = activePriorityFilter === 'all' || notification.priority === activePriorityFilter;
      return categoryMatch && priorityMatch;
    });
  }, [notifications, activeFilter, activePriorityFilter]);
  
  // Demo notifications for testing
  useEffect(() => {
    if (notifications.length === 0) {
      // Add some demo notifications
      const demoNotifications: Notification[] = [
        {
          id: '1',
          title: 'Sistem Güncellemesi',
          message: 'Yeni bir sistem güncellemesi mevcut. Şimdi yüklemek ister misiniz?',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false,
          priority: 'high',
          category: 'system',
          actions: [
            { label: 'Şimdi Yükle', onClick: () => console.log('Update now clicked') },
            { label: 'Daha Sonra', onClick: () => console.log('Later clicked') }
          ]
        },
        {
          id: '2',
          title: 'Görev Tamamlandı',
          message: 'Ekran yakalama görevi başarıyla tamamlandı.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: true,
          priority: 'medium',
          category: 'task'
        },
        {
          id: '3',
          title: 'Disk Alanı Uyarısı',
          message: 'Disk alanı %90 doluluk seviyesine ulaştı. Bazı dosyaları temizlemeniz önerilir.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: false,
          priority: 'critical',
          category: 'alert'
        },
        {
          id: '4',
          title: 'Yeni Özellik',
          message: 'Yüksek kontrast tema artık kullanılabilir. Ayarlar menüsünden etkinleştirebilirsiniz.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: false,
          priority: 'low',
          category: 'info'
        }
      ];
      
      setNotifications(demoNotifications);
    }
  }, []);
  
  // Bileşen displayName'leri
  NotificationBell.displayName = 'NotificationBell';
  NotificationItem.displayName = 'NotificationItem';
  NotificationActions.displayName = 'NotificationActions';
  NotificationFilters.displayName = 'NotificationFilters';
  NotificationList.displayName = 'NotificationList';
  
  return (
    <>
      {/* Notification Bell Icon */}
      <NotificationBell unreadCount={unreadCount} onOpen={onOpen} />
      
      {/* Notification Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="md"
        aria-labelledby="notification-center-header"
      >
        <DrawerOverlay />
        <DrawerContent
          bg={colorMode === 'light' ? 'white' : 'gray.800'}
          borderLeftRadius="md"
        >
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" fontWeight="bold" id="notification-center-header">Bildirimler</Text>
              <NotificationFilters 
                onSetActiveFilter={setActiveFilter}
                onSetActivePriorityFilter={setActivePriorityFilter}
                onMarkAllAsRead={markAllAsRead}
                onClearAllNotifications={clearAllNotifications}
              />
            </Flex>
          </DrawerHeader>
          
          <DrawerBody p={0}>
            <Tabs isFitted variant="enclosed">
              <TabList>
                <Tab>Tümü ({notifications.length})</Tab>
                <Tab>Okunmamış ({unreadCount})</Tab>
              </TabList>
              
              <TabPanels>
                {/* All Notifications */}
                <TabPanel p={0}>
                  <NotificationList 
                    notifications={filteredNotifications}
                    colorMode={colorMode}
                    onMarkAsRead={markAsRead}
                  />
                </TabPanel>
                
                {/* Unread Notifications */}
                <TabPanel p={0}>
                  <NotificationList 
                    notifications={filteredNotifications}
                    colorMode={colorMode}
                    onMarkAsRead={markAsRead}
                    showOnlyUnread={true}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
});

// Ensure displayName is set for React DevTools
NotificationCenter.displayName = 'NotificationCenter';

export default NotificationCenter;
