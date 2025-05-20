import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  Box,
  Flex,
  Text,
  CloseButton,
  useColorModeValue,
  SlideFade,
  VStack,
  Icon,
  useToast,
  ToastId,
  UseToastOptions
} from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  InfoIcon, 
  WarningIcon, 
  WarningTwoIcon 
} from '@chakra-ui/icons';
import { FiBell } from 'react-icons/fi';
import useTranslation from '../../hooks/useTranslation';

// Bildirim tipi
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  isRead?: boolean;
  timestamp: string;
  link?: string;
  data?: any;
}

// Bildirim bağlamı
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: number;
}

// Varsayılan bağlam değeri
const defaultContext: NotificationContextType = {
  notifications: [],
  addNotification: () => '',
  removeNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
  unreadCount: 0
};

// Bildirim bağlamı oluştur
const NotificationContext = createContext<NotificationContextType>(defaultContext);

// Bildirim hook'u
export const useNotifications = () => useContext(NotificationContext);

// Bildirim sağlayıcı bileşeni
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const toast = useToast();
  const toastRefs = React.useRef<{ [key: string]: ToastId }>({});
  const { t } = useTranslation();
  
  // Okunmamış bildirim sayısı
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Bildirim ekle
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Toast bildirimi göster
    const toastOptions: UseToastOptions = {
      title: notification.title,
      description: notification.message,
      status: notification.type,
      duration: notification.duration || 5000,
      isClosable: true,
      position: 'top-right'
    };
    
    const toastId = toast(toastOptions);
    toastRefs.current[id] = toastId;
    
    return id;
  }, [toast]);
  
  // Bildirim kaldır
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Toast'ı kapat
    if (toastRefs.current[id]) {
      toast.close(toastRefs.current[id]);
      delete toastRefs.current[id];
    }
  }, [toast]);
  
  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);
  
  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);
  
  // Tüm bildirimleri temizle
  const clearAll = useCallback(() => {
    setNotifications([]);
    
    // Tüm toast'ları kapat
    Object.values(toastRefs.current).forEach(id => {
      toast.close(id);
    });
    toastRefs.current = {};
  }, [toast]);
  
  // Yerel depolamadan bildirimleri yükle
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
    }
  }, []);
  
  // Bildirimleri yerel depolamaya kaydet
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Bildirimler kaydedilirken hata:', error);
    }
  }, [notifications]);
  
  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Bildirim öğesi bileşeni
export const NotificationItem: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onRemove, onMarkAsRead }) => {
  const { id, title, message, type, timestamp, isRead } = notification;
  
  // Renk değişkenleri
  const bgColor = useColorModeValue(
    isRead ? 'gray.50' : 'blue.50',
    isRead ? 'gray.700' : 'blue.900'
  );
  const borderColor = useColorModeValue(
    isRead ? 'gray.200' : 'blue.200',
    isRead ? 'gray.600' : 'blue.700'
  );
  
  // Bildirim tipi simgesi
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="green.500" />;
      case 'warning':
        return <WarningIcon color="orange.500" />;
      case 'error':
        return <WarningTwoIcon color="red.500" />;
      default:
        return <InfoIcon color="blue.500" />;
    }
  };
  
  // Zaman formatla
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat önce`;
    
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString();
  };
  
  // Bildirime tıklandığında
  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(id);
    }
  };
  
  return (
    <Box
      p={3}
      mb={2}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bgColor}
      onClick={handleClick}
      cursor="pointer"
      position="relative"
      _hover={{ boxShadow: 'sm' }}
      transition="all 0.2s"
    >
      <Flex align="center" mb={1}>
        <Box mr={2}>{getIcon()}</Box>
        <Text fontWeight="bold" flex="1" noOfLines={1}>
          {title}
        </Text>
        <CloseButton size="sm" onClick={() => onRemove(id)} />
      </Flex>
      
      <Text fontSize="sm" mb={2} noOfLines={2}>
        {message}
      </Text>
      
      <Text fontSize="xs" color="gray.500">
        {formatTime(timestamp)}
      </Text>
      
      {!isRead && (
        <Box
          position="absolute"
          top={2}
          right={2}
          w={2}
          h={2}
          borderRadius="full"
          bg="blue.500"
        />
      )}
    </Box>
  );
};

// Bildirim listesi bileşeni
export const NotificationList: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { notifications, removeNotification, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { t } = useTranslation();
  
  // Renk değişkenleri
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <SlideFade in={isOpen} offsetY="-20px">
      <Box
        position="absolute"
        top="100%"
        right={0}
        mt={2}
        w="300px"
        maxH="400px"
        overflowY="auto"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="lg"
        zIndex={10}
      >
        <Flex justify="space-between" align="center" p={3} borderBottomWidth="1px" borderColor={borderColor}>
          <Text fontWeight="bold">{t('notifications.title')}</Text>
          <Flex>
            <Text 
              fontSize="xs" 
              color="blue.500" 
              mr={2} 
              cursor="pointer" 
              onClick={markAllAsRead}
            >
              {t('notifications.markAllRead')}
            </Text>
            <Text 
              fontSize="xs" 
              color="red.500" 
              cursor="pointer" 
              onClick={clearAll}
            >
              {t('notifications.clearAll')}
            </Text>
          </Flex>
        </Flex>
        
        {notifications.length === 0 ? (
          <Box p={4} textAlign="center">
            <Icon as={FiBell} boxSize={6} color="gray.400" mb={2} />
            <Text color="gray.500">{t('notifications.empty')}</Text>
          </Box>
        ) : (
          <VStack spacing={0} align="stretch" p={2}>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRemove={removeNotification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </VStack>
        )}
      </Box>
    </SlideFade>
  );
};

export default NotificationProvider;
