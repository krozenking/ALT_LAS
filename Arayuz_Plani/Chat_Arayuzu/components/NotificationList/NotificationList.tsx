import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Notification from '../Notification/Notification';
import { Notification as NotificationType, notificationService } from '../../services/notification';
import { useChat } from '../../context/ChatContext';

interface NotificationListProps {
  maxNotifications?: number;
}

const NotificationList: React.FC<NotificationListProps> = ({ maxNotifications = 5 }) => {
  const { selectConversation } = useChat();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const notificationsRef = useRef<NotificationType[]>([]);
  
  // Update ref when notifications change
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  
  // Handle notification click
  const handleNotificationClick = (notification: NotificationType) => {
    if (notification.data?.conversationId) {
      selectConversation(notification.data.conversationId);
    }
  };
  
  // Handle notification close
  const handleNotificationClose = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };
  
  // Register notification callback
  useEffect(() => {
    const handleNotification = (notification: NotificationType) => {
      // Add notification to the list
      setNotifications(prev => {
        // Limit the number of notifications
        const newNotifications = [notification, ...prev].slice(0, maxNotifications);
        return newNotifications;
      });
    };
    
    // Register callback
    notificationService.onNotificationClick(handleNotification);
    
    // Cleanup
    return () => {
      notificationService.removeCallback(handleNotification);
    };
  }, [maxNotifications]);
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <Container>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => handleNotificationClose(notification.id)}
          onClick={() => handleNotificationClick(notification)}
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  max-width: calc(100% - 40px);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

export default NotificationList;
