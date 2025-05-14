import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Progress,
  useColorMode,
  BoxProps,
} from '@chakra-ui/react';
import { useNotification } from './NotificationContext';
import { Notification } from './types';
import { glassmorphism } from '../../styles/themes/creator';

// Notification item props
export interface NotificationItemProps extends BoxProps {
  /**
   * Notification
   */
  notification: Notification;
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
 * Notification item component
 */
const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  showCloseButton = true,
  showProgressBar = true,
  showIcon = true,
  showTimestamp = true,
  pauseOnHover = true,
  closeOnClick = true,
  onClose,
  onClick,
  ...rest
}) => {
  const { remove, markAsRead } = useNotification();
  const { colorMode } = useColorMode();
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(notification.duration || 5000);
  
  // Apply glassmorphism effect based on color mode
  const glassStyle = colorMode === 'light'
    ? glassmorphism.create(0.7, 10, 1)
    : glassmorphism.createDark(0.7, 10, 1);
  
  // Get notification type color
  const getTypeColor = () => {
    switch (notification.type) {
      case 'info':
        return colorMode === 'light' ? 'blue.500' : 'blue.300';
      case 'success':
        return colorMode === 'light' ? 'green.500' : 'green.300';
      case 'warning':
        return colorMode === 'light' ? 'orange.500' : 'orange.300';
      case 'error':
        return colorMode === 'light' ? 'red.500' : 'red.300';
      default:
        return colorMode === 'light' ? 'gray.500' : 'gray.300';
    }
  };
  
  // Get notification icon
  const getTypeIcon = () => {
    if (notification.icon) {
      return notification.icon;
    }
    
    switch (notification.type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Less than a minute
    if (diff < 60 * 1000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than a week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Format date
    return date.toLocaleDateString();
  };
  
  // Handle close
  const handleClose = () => {
    if (onClose) {
      onClose(notification.id);
    } else {
      remove(notification.id);
    }
  };
  
  // Handle click
  const handleClick = () => {
    // Mark as read
    markAsRead(notification.id);
    
    // Execute notification action if exists
    if (notification.action) {
      notification.action.onClick();
    }
    
    // Execute onClick callback if exists
    if (onClick) {
      onClick(notification);
    }
    
    // Close notification if closeOnClick is true
    if (closeOnClick) {
      handleClose();
    }
  };
  
  // Handle mouse enter
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
      
      // Store remaining time
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        
        const elapsedTime = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, (notification.duration || 5000) - elapsedTime);
      }
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
      
      // Resume progress
      if (!notification.persistent && remainingTimeRef.current > 0) {
        startTimeRef.current = Date.now();
        startProgress(remainingTimeRef.current);
      }
    }
  };
  
  // Start progress
  const startProgress = (duration: number) => {
    if (notification.persistent || !showProgressBar) return;
    
    const interval = 10; // Update every 10ms
    const steps = duration / interval;
    const decrement = 100 / steps;
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress - decrement;
        
        if (newProgress <= 0) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          handleClose();
          return 0;
        }
        
        return newProgress;
      });
    }, interval);
  };
  
  // Initialize progress
  useEffect(() => {
    if (!notification.persistent && notification.duration && !isPaused) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = notification.duration;
      startProgress(notification.duration);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [notification.id, isPaused]);
  
  return (
    <Box
      position="relative"
      overflow="hidden"
      borderRadius="md"
      borderLeft="4px solid"
      borderLeftColor={getTypeColor()}
      mb={2}
      width="100%"
      maxWidth="400px"
      cursor={onClick || notification.action ? 'pointer' : 'default'}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...glassStyle}
      {...rest}
    >
      {/* Progress bar */}
      {showProgressBar && !notification.persistent && (
        <Progress
          value={progress}
          size="xs"
          colorScheme={notification.type === 'info' ? 'blue' : notification.type === 'success' ? 'green' : notification.type === 'warning' ? 'orange' : 'red'}
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          borderRadius={0}
        />
      )}
      
      <Flex p={4}>
        {/* Icon */}
        {showIcon && (
          <Box
            fontSize="xl"
            mr={3}
            mt={0.5}
          >
            {getTypeIcon()}
          </Box>
        )}
        
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
                colorScheme={notification.type === 'info' ? 'blue' : notification.type === 'success' ? 'green' : notification.type === 'warning' ? 'orange' : 'red'}
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action?.onClick();
                  handleClose();
                }}
              >
                {notification.action.label}
              </Button>
            </Box>
          )}
          
          {/* Timestamp */}
          {showTimestamp && (
            <Text fontSize="xs" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} mt={1}>
              {formatTimestamp(notification.createdAt)}
            </Text>
          )}
        </Box>
        
        {/* Close button */}
        {showCloseButton && notification.dismissible !== false && (
          <IconButton
            aria-label="Close notification"
            icon={'✖️'}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          />
        )}
      </Flex>
    </Box>
  );
};

export default NotificationItem;
