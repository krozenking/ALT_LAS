import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { useNotification } from './NotificationContext';
import NotificationItem from './NotificationItem';
import { Notification, NotificationPosition } from './types';

// Notification list props
export interface NotificationListProps extends BoxProps {
  /**
   * Notifications
   */
  notifications?: Notification[];
  /**
   * Maximum number of notifications to show
   */
  maxNotifications?: number;
  /**
   * Notification position
   */
  position?: NotificationPosition;
  /**
   * Whether to show close button
   */
  showCloseButton?: boolean;
  /**
   * Whether to show progress bar
   */
  showProgressBar?: boolean;
  /**
   * Whether to show icon
   */
  showIcon?: boolean;
  /**
   * Whether to show timestamp
   */
  showTimestamp?: boolean;
  /**
   * Whether to pause on hover
   */
  pauseOnHover?: boolean;
  /**
   * Whether to close on click
   */
  closeOnClick?: boolean;
  /**
   * On close callback
   */
  onClose?: (id: string) => void;
  /**
   * On click callback
   */
  onClick?: (notification: Notification) => void;
}

/**
 * Notification list component
 */
const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  maxNotifications,
  position,
  showCloseButton,
  showProgressBar,
  showIcon,
  showTimestamp,
  pauseOnHover,
  closeOnClick,
  onClose,
  onClick,
  ...rest
}) => {
  const { state, remove } = useNotification();
  const { colorMode } = useColorMode();
  
  // Use provided notifications or get from context
  const notificationList = notifications || state.notifications;
  
  // Use provided maxNotifications or get from context
  const maxNotificationsCount = maxNotifications || state.maxNotifications;
  
  // Use provided position or get from context
  const notificationPosition = position || state.position;
  
  // Filter notifications
  const filteredNotifications = notificationList
    .filter(notification => notification.status === 'unread')
    .slice(0, maxNotificationsCount);
  
  // Get position styles
  const getPositionStyles = () => {
    switch (notificationPosition) {
      case 'top-right':
        return {
          top: '20px',
          right: '20px',
          alignItems: 'flex-end',
        };
      case 'top-left':
        return {
          top: '20px',
          left: '20px',
          alignItems: 'flex-start',
        };
      case 'bottom-right':
        return {
          bottom: '20px',
          right: '20px',
          alignItems: 'flex-end',
        };
      case 'bottom-left':
        return {
          bottom: '20px',
          left: '20px',
          alignItems: 'flex-start',
        };
      case 'top-center':
        return {
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
        };
      case 'bottom-center':
        return {
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          alignItems: 'center',
        };
      default:
        return {
          top: '20px',
          right: '20px',
          alignItems: 'flex-end',
        };
    }
  };
  
  // Handle close
  const handleClose = (id: string) => {
    if (onClose) {
      onClose(id);
    } else {
      remove(id);
    }
  };
  
  // If no notifications, return null
  if (filteredNotifications.length === 0) {
    return null;
  }
  
  return (
    <Box
      position="fixed"
      zIndex={9999}
      {...getPositionStyles()}
      {...rest}
    >
      <VStack spacing={2} width="100%">
        {filteredNotifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            showCloseButton={showCloseButton !== undefined ? showCloseButton : state.showCloseButton}
            showProgressBar={showProgressBar !== undefined ? showProgressBar : state.showProgressBar}
            showIcon={showIcon !== undefined ? showIcon : state.showIcons}
            showTimestamp={showTimestamp !== undefined ? showTimestamp : state.showTimestamp}
            pauseOnHover={pauseOnHover !== undefined ? pauseOnHover : state.pauseOnHover}
            closeOnClick={closeOnClick !== undefined ? closeOnClick : state.closeOnClick}
            onClose={handleClose}
            onClick={onClick}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default NotificationList;
