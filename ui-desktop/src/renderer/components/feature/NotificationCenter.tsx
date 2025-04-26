import React, { useState, useEffect, useCallback } from 'react';
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

// Helper function to get priority color
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

// Helper function to get category icon
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

// Format relative time
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

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
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
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
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
  
  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const categoryMatch = activeFilter === 'all' || notification.category === activeFilter;
    const priorityMatch = activePriorityFilter === 'all' || notification.priority === activePriorityFilter;
    return categoryMatch && priorityMatch;
  });
  
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
  
  return (
    <>
      {/* Notification Bell Icon */}
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
                    <MenuItem onClick={() => setActiveFilter('all')}>
                      Tüm Kategoriler
                    </MenuItem>
                    <MenuItem onClick={() => setActiveFilter('system')}>
                      Sistem
                    </MenuItem>
                    <MenuItem onClick={() => setActiveFilter('task')}>
                      Görevler
                    </MenuItem>
                    <MenuItem onClick={() => setActiveFilter('alert')}>
                      Uyarılar
                    </MenuItem>
                    <MenuItem onClick={() => setActiveFilter('info')}>
                      Bilgiler
                    </MenuItem>
                    <Divider my={2} />
                    <MenuItem onClick={() => setActivePriorityFilter('all')}>
                      Tüm Öncelikler
                    </MenuItem>
                    <MenuItem onClick={() => setActivePriorityFilter('critical')}>
                      Kritik
                    </MenuItem>
                    <MenuItem onClick={() => setActivePriorityFilter('high')}>
                      Yüksek
                    </MenuItem>
                    <MenuItem onClick={() => setActivePriorityFilter('medium')}>
                      Orta
                    </MenuItem>
                    <MenuItem onClick={() => setActivePriorityFilter('low')}>
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
                    <MenuItem onClick={markAllAsRead}>
                      Tümünü Okundu İşaretle
                    </MenuItem>
                    <MenuItem onClick={clearAllNotifications}>
                      Tümünü Temizle
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
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
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => (
                      <Box
                        key={notification.id}
                        p={4}
                        borderBottomWidth="1px"
                        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
                        bg={!notification.read ? (colorMode === 'light' ? 'blue.50' : 'blue.900') : 'transparent'}
                        onClick={() => markAsRead(notification.id)}
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
                              {getCategoryIcon(notification.category)}
                            </Box>
                            <Box>
                              <Flex alignItems="center">
                                <Text fontWeight="bold" mr={2}>{notification.title}</Text>
                                <Badge 
                                  colorScheme={
                                    notification.priority === 'critical' ? 'red' :
                                    notification.priority === 'high' ? 'orange' :
                                    notification.priority === 'medium' ? 'blue' : 'gray'
                                  }
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
                            {formatRelativeTime(notification.timestamp)}
                          </Text>
                        </Flex>
                        
                        {/* Notification Actions */}
                        {notification.actions && notification.actions.length > 0 && (
                          <Flex mt={3} justifyContent="flex-end">
                            {notification.actions.map((action, index) => (
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
                        )}
                      </Box>
                    ))
                  ) : (
                    <Box p={8} textAlign="center">
                      <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                        Bildirim bulunmuyor
                      </Text>
                    </Box>
                  )}
                </TabPanel>
                
                {/* Unread Notifications */}
                <TabPanel p={0}>
                  {filteredNotifications.filter(n => !n.read).length > 0 ? (
                    filteredNotifications
                      .filter(notification => !notification.read)
                      .map(notification => (
                        <Box
                          key={notification.id}
                          p={4}
                          borderBottomWidth="1px"
                          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
                          bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
                          onClick={() => markAsRead(notification.id)}
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
                                {getCategoryIcon(notification.category)}
                              </Box>
                              <Box>
                                <Flex alignItems="center">
                                  <Text fontWeight="bold" mr={2}>{notification.title}</Text>
                                  <Badge 
                                    colorScheme={
                                      notification.priority === 'critical' ? 'red' :
                                      notification.priority === 'high' ? 'orange' :
                                      notification.priority === 'medium' ? 'blue' : 'gray'
                                    }
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
                              {formatRelativeTime(notification.timestamp)}
                            </Text>
                          </Flex>
                          
                          {/* Notification Actions */}
                          {notification.actions && notification.actions.length > 0 && (
                            <Flex mt={3} justifyContent="flex-end">
                              {notification.actions.map((action, index) => (
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
                          )}
                        </Box>
                      ))
                  ) : (
                    <Box p={8} textAlign="center">
                      <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                        Okunmamış bildirim bulunmuyor
                      </Text>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default NotificationCenter;
