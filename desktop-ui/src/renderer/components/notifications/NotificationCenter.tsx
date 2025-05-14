import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { useNotification } from './NotificationContext';
import NotificationItem from './NotificationItem';
import { Notification, NotificationStatus, NotificationType } from './types';
import { glassmorphism } from '../../styles/themes/creator';

// Notification center props
export interface NotificationCenterProps extends BoxProps {
  /**
   * Whether notification center is open
   */
  isOpen?: boolean;
  /**
   * On close callback
   */
  onClose?: () => void;
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  /**
   * Whether to show clear all button
   */
  showClearAllButton?: boolean;
  /**
   * Whether to show filter
   */
  showFilter?: boolean;
  /**
   * Whether to show search
   */
  showSearch?: boolean;
  /**
   * Whether to show sort
   */
  showSort?: boolean;
  /**
   * Whether to show tabs
   */
  showTabs?: boolean;
  /**
   * Whether to show empty state
   */
  showEmptyState?: boolean;
  /**
   * Whether to show notification count
   */
  showNotificationCount?: boolean;
  /**
   * On notification click callback
   */
  onNotificationClick?: (notification: Notification) => void;
}

/**
 * Notification center component
 */
const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  showCloseButton = true,
  showClearAllButton = true,
  showFilter = true,
  showSearch = true,
  showSort = true,
  showTabs = true,
  showEmptyState = true,
  showNotificationCount = true,
  onNotificationClick,
  ...rest
}) => {
  const {
    state,
    dispatch,
    toggleNotificationCenter,
    markAsRead,
    markAsUnread,
    archive,
    delete: deleteNotification,
    clearAll,
  } = useNotification();
  const { colorMode } = useColorMode();
  
  // Local state
  const [activeTab, setActiveTab] = useState<NotificationStatus>('unread');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Use provided isOpen or get from context
  const isNotificationCenterOpen = isOpen !== undefined ? isOpen : state.isNotificationCenterOpen;
  
  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      toggleNotificationCenter();
    }
  };
  
  // Filter notifications
  const filterNotifications = (notifications: Notification[]) => {
    return notifications
      .filter(notification => {
        // Filter by status
        if (notification.status !== activeTab) {
          return false;
        }
        
        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            notification.title.toLowerCase().includes(searchLower) ||
            notification.message.toLowerCase().includes(searchLower)
          );
        }
        
        // Filter by type
        if (selectedType !== 'all' && notification.type !== selectedType) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by field
        if (sortBy === 'createdAt') {
          return sortDirection === 'asc'
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime();
        } else if (sortBy === 'priority') {
          const priorityOrder = { urgent: 3, high: 2, normal: 1, low: 0 };
          const aPriority = priorityOrder[a.priority || 'normal'] || 1;
          const bPriority = priorityOrder[b.priority || 'normal'] || 1;
          
          return sortDirection === 'asc'
            ? aPriority - bPriority
            : bPriority - aPriority;
        }
        
        return 0;
      });
  };
  
  // Get filtered notifications
  const filteredNotifications = filterNotifications(state.notifications);
  
  // Get notification counts
  const getNotificationCount = (status: NotificationStatus) => {
    return state.notifications.filter(notification => notification.status === status).length;
  };
  
  // Get notification type counts
  const getNotificationTypeCount = (type: NotificationType) => {
    return filteredNotifications.filter(notification => notification.type === type).length;
  };
  
  // Handle tab change
  const handleTabChange = (status: NotificationStatus) => {
    setActiveTab(status);
  };
  
  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // Handle type filter change
  const handleTypeFilterChange = (type: NotificationType | 'all') => {
    setSelectedType(type);
  };
  
  // Handle sort change
  const handleSortChange = (by: 'createdAt' | 'priority', direction: 'asc' | 'desc') => {
    setSortBy(by);
    setSortDirection(direction);
  };
  
  // Handle notification action
  const handleNotificationAction = (action: 'read' | 'unread' | 'archive' | 'delete', notification: Notification) => {
    switch (action) {
      case 'read':
        markAsRead(notification.id);
        break;
      case 'unread':
        markAsUnread(notification.id);
        break;
      case 'archive':
        archive(notification.id);
        break;
      case 'delete':
        deleteNotification(notification.id);
        break;
    }
  };
  
  // Handle clear all
  const handleClearAll = () => {
    clearAll();
  };
  
  // If notification center is not open, return null
  if (!isNotificationCenterOpen) {
    return null;
  }
  
  return (
    <Box
      position="fixed"
      top={0}
      right={0}
      bottom={0}
      width="400px"
      zIndex={9999}
      boxShadow="lg"
      display="flex"
      flexDirection="column"
      {...glassStyle}
      {...rest}
    >
      {/* Header */}
      <Flex
        p={4}
        borderBottomWidth="1px"
        borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="lg" fontWeight="bold">
          Notifications
          {showNotificationCount && (
            <Badge ml={2} colorScheme="blue" borderRadius="full">
              {getNotificationCount('unread')}
            </Badge>
          )}
        </Text>
        
        <HStack spacing={2}>
          {showClearAllButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
          
          {showCloseButton && (
            <IconButton
              aria-label="Close notification center"
              icon={'✖️'}
              size="sm"
              variant="ghost"
              onClick={handleClose}
            />
          )}
        </HStack>
      </Flex>
      
      {/* Tabs */}
      {showTabs && (
        <Tabs
          isFitted
          variant="enclosed"
          onChange={(index) => {
            const statuses: NotificationStatus[] = ['unread', 'read', 'archived'];
            handleTabChange(statuses[index]);
          }}
        >
          <TabList>
            <Tab>
              Unread
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {getNotificationCount('unread')}
              </Badge>
            </Tab>
            <Tab>
              Read
              <Badge ml={2} colorScheme="gray" borderRadius="full">
                {getNotificationCount('read')}
              </Badge>
            </Tab>
            <Tab>
              Archived
              <Badge ml={2} colorScheme="gray" borderRadius="full">
                {getNotificationCount('archived')}
              </Badge>
            </Tab>
          </TabList>
        </Tabs>
      )}
      
      {/* Filters */}
      {(showSearch || showFilter || showSort) && (
        <Box p={4} borderBottomWidth="1px" borderBottomColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}>
          <VStack spacing={3} align="stretch">
            {/* Search */}
            {showSearch && (
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  🔍
                </InputLeftElement>
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            )}
            
            <Flex justifyContent="space-between">
              {/* Type filter */}
              {showFilter && (
                <Menu>
                  <MenuButton as={Button} size="sm" rightIcon={'▼'}>
                    Type: {selectedType === 'all' ? 'All' : selectedType}
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleTypeFilterChange('all')}>
                      All ({filteredNotifications.length})
                    </MenuItem>
                    <MenuItem onClick={() => handleTypeFilterChange('info')}>
                      Info ({getNotificationTypeCount('info')})
                    </MenuItem>
                    <MenuItem onClick={() => handleTypeFilterChange('success')}>
                      Success ({getNotificationTypeCount('success')})
                    </MenuItem>
                    <MenuItem onClick={() => handleTypeFilterChange('warning')}>
                      Warning ({getNotificationTypeCount('warning')})
                    </MenuItem>
                    <MenuItem onClick={() => handleTypeFilterChange('error')}>
                      Error ({getNotificationTypeCount('error')})
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
              
              {/* Sort */}
              {showSort && (
                <Menu>
                  <MenuButton as={Button} size="sm" rightIcon={'▼'}>
                    Sort: {sortBy === 'createdAt' ? 'Date' : 'Priority'} ({sortDirection === 'asc' ? 'Asc' : 'Desc'})
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleSortChange('createdAt', 'desc')}>
                      Date (Newest first)
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('createdAt', 'asc')}>
                      Date (Oldest first)
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('priority', 'desc')}>
                      Priority (High to Low)
                    </MenuItem>
                    <MenuItem onClick={() => handleSortChange('priority', 'asc')}>
                      Priority (Low to High)
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </Flex>
          </VStack>
        </Box>
      )}
      
      {/* Notification list */}
      <Box flex="1" overflowY="auto" p={4}>
        {filteredNotifications.length === 0 ? (
          showEmptyState && (
            <Flex
              height="100%"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              p={4}
            >
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                No notifications
              </Text>
              <Text color={colorMode === 'light' ? 'gray.500' : 'gray.400'} textAlign="center">
                {activeTab === 'unread'
                  ? "You don't have any unread notifications."
                  : activeTab === 'read'
                    ? "You don't have any read notifications."
                    : "You don't have any archived notifications."}
              </Text>
            </Flex>
          )
        ) : (
          <VStack spacing={2} align="stretch">
            {filteredNotifications.map(notification => (
              <Box
                key={notification.id}
                position="relative"
                borderRadius="md"
                borderLeftWidth="4px"
                borderLeftColor={
                  notification.type === 'info'
                    ? colorMode === 'light' ? 'blue.500' : 'blue.300'
                    : notification.type === 'success'
                      ? colorMode === 'light' ? 'green.500' : 'green.300'
                      : notification.type === 'warning'
                        ? colorMode === 'light' ? 'orange.500' : 'orange.300'
                        : colorMode === 'light' ? 'red.500' : 'red.300'
                }
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                boxShadow="sm"
                _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700' }}
                cursor="pointer"
                onClick={() => onNotificationClick && onNotificationClick(notification)}
              >
                <Flex p={4}>
                  {/* Icon */}
                  <Box
                    fontSize="xl"
                    mr={3}
                    mt={0.5}
                  >
                    {notification.icon || (
                      notification.type === 'info'
                        ? 'ℹ️'
                        : notification.type === 'success'
                          ? '✅'
                          : notification.type === 'warning'
                            ? '⚠️'
                            : '❌'
                    )}
                  </Box>
                  
                  {/* Content */}
                  <Box flex="1">
                    {/* Title */}
                    <Text fontWeight="bold" mb={1}>
                      {notification.title}
                    </Text>
                    
                    {/* Message */}
                    <Text fontSize="sm" mb={notification.action ? 2 : 0}>
                      {notification.message}
                    </Text>
                    
                    {/* Action button */}
                    {notification.action && (
                      <Box mt={2}>
                        <Button
                          size="sm"
                          colorScheme={
                            notification.type === 'info'
                              ? 'blue'
                              : notification.type === 'success'
                                ? 'green'
                                : notification.type === 'warning'
                                  ? 'orange'
                                  : 'red'
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                          }}
                        >
                          {notification.action.label}
                        </Button>
                      </Box>
                    )}
                    
                    {/* Timestamp */}
                    <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
                      {notification.createdAt.toLocaleString()}
                    </Text>
                  </Box>
                  
                  {/* Actions */}
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Notification actions"
                      icon={'⋮'}
                      size="sm"
                      variant="ghost"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <MenuList onClick={(e) => e.stopPropagation()}>
                      {activeTab === 'unread' && (
                        <MenuItem onClick={() => handleNotificationAction('read', notification)}>
                          Mark as read
                        </MenuItem>
                      )}
                      {activeTab === 'read' && (
                        <MenuItem onClick={() => handleNotificationAction('unread', notification)}>
                          Mark as unread
                        </MenuItem>
                      )}
                      {(activeTab === 'unread' || activeTab === 'read') && (
                        <MenuItem onClick={() => handleNotificationAction('archive', notification)}>
                          Archive
                        </MenuItem>
                      )}
                      <MenuItem onClick={() => handleNotificationAction('delete', notification)}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default NotificationCenter;
