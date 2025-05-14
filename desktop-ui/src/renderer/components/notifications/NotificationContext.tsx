import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Notification,
  NotificationOptions,
  NotificationState,
  NotificationAction,
  NotificationActionTypes,
  NotificationType,
  NotificationPosition,
  NotificationStatus,
} from './types';

// Initial notification state
const initialNotificationState: NotificationState = {
  notifications: [],
  position: 'top-right',
  defaultDuration: 5000,
  maxNotifications: 5,
  pauseOnHover: true,
  closeOnClick: true,
  showIcons: true,
  showCloseButton: true,
  showProgressBar: true,
  showTimestamp: true,
  groupSimilar: true,
  playSound: false,
  showDesktopNotifications: false,
  showBadge: true,
  showNotificationCenter: true,
  isNotificationCenterOpen: false,
  filter: {},
  sort: {
    by: 'createdAt',
    direction: 'desc',
  },
};

// Notification reducer
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case NotificationActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          action.payload,
          ...state.notifications,
        ],
      };
    
    case NotificationActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };
    
    case NotificationActionTypes.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? {
                ...notification,
                status: 'read' as NotificationStatus,
                readAt: new Date(),
              }
            : notification
        ),
      };
    
    case NotificationActionTypes.MARK_AS_UNREAD:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? {
                ...notification,
                status: 'unread' as NotificationStatus,
                readAt: undefined,
              }
            : notification
        ),
      };
    
    case NotificationActionTypes.ARCHIVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? {
                ...notification,
                status: 'archived' as NotificationStatus,
                archivedAt: new Date(),
              }
            : notification
        ),
      };
    
    case NotificationActionTypes.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? {
                ...notification,
                status: 'deleted' as NotificationStatus,
                deletedAt: new Date(),
              }
            : notification
        ),
      };
    
    case NotificationActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.status !== action.payload
        ),
      };
    
    case NotificationActionTypes.CLEAR_ALL_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };
    
    case NotificationActionTypes.SET_POSITION:
      return {
        ...state,
        position: action.payload,
      };
    
    case NotificationActionTypes.SET_DEFAULT_DURATION:
      return {
        ...state,
        defaultDuration: action.payload,
      };
    
    case NotificationActionTypes.SET_MAX_NOTIFICATIONS:
      return {
        ...state,
        maxNotifications: action.payload,
      };
    
    case NotificationActionTypes.SET_PAUSE_ON_HOVER:
      return {
        ...state,
        pauseOnHover: action.payload,
      };
    
    case NotificationActionTypes.SET_CLOSE_ON_CLICK:
      return {
        ...state,
        closeOnClick: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_ICONS:
      return {
        ...state,
        showIcons: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_CLOSE_BUTTON:
      return {
        ...state,
        showCloseButton: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_PROGRESS_BAR:
      return {
        ...state,
        showProgressBar: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_TIMESTAMP:
      return {
        ...state,
        showTimestamp: action.payload,
      };
    
    case NotificationActionTypes.SET_GROUP_SIMILAR:
      return {
        ...state,
        groupSimilar: action.payload,
      };
    
    case NotificationActionTypes.SET_PLAY_SOUND:
      return {
        ...state,
        playSound: action.payload,
      };
    
    case NotificationActionTypes.SET_SOUND:
      return {
        ...state,
        sound: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_DESKTOP_NOTIFICATIONS:
      return {
        ...state,
        showDesktopNotifications: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_BADGE:
      return {
        ...state,
        showBadge: action.payload,
      };
    
    case NotificationActionTypes.SET_SHOW_NOTIFICATION_CENTER:
      return {
        ...state,
        showNotificationCenter: action.payload,
      };
    
    case NotificationActionTypes.TOGGLE_NOTIFICATION_CENTER:
      return {
        ...state,
        isNotificationCenterOpen: !state.isNotificationCenterOpen,
      };
    
    case NotificationActionTypes.SET_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };
    
    case NotificationActionTypes.SET_SORT:
      return {
        ...state,
        sort: action.payload,
      };
    
    default:
      return state;
  }
};

// Notification context
export interface NotificationContextType {
  state: NotificationState;
  dispatch: React.Dispatch<NotificationAction>;
  notify: (title: string, message: string, options?: NotificationOptions) => string;
  info: (title: string, message: string, options?: NotificationOptions) => string;
  success: (title: string, message: string, options?: NotificationOptions) => string;
  warning: (title: string, message: string, options?: NotificationOptions) => string;
  error: (title: string, message: string, options?: NotificationOptions) => string;
  remove: (id: string) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  archive: (id: string) => void;
  delete: (id: string) => void;
  clearAll: () => void;
  toggleNotificationCenter: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider props
export interface NotificationProviderProps {
  children: ReactNode;
  initialState?: Partial<NotificationState>;
}

// Notification provider
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  initialState = {},
}) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    ...initialNotificationState,
    ...initialState,
  });
  
  // Create notification
  const createNotification = (
    title: string,
    message: string,
    type: NotificationType,
    options?: NotificationOptions
  ): string => {
    const id = uuidv4();
    
    const notification: Notification = {
      id,
      title,
      message,
      type,
      status: 'unread',
      createdAt: new Date(),
      icon: options?.icon,
      action: options?.action,
      duration: options?.duration || state.defaultDuration,
      dismissible: options?.dismissible !== undefined ? options.dismissible : true,
      persistent: options?.persistent || false,
      source: options?.source,
      category: options?.category,
      priority: options?.priority || 'normal',
      data: options?.data,
    };
    
    dispatch({
      type: NotificationActionTypes.ADD_NOTIFICATION,
      payload: notification,
    });
    
    // Play sound if enabled
    if (state.playSound && state.sound) {
      const audio = new Audio(state.sound);
      audio.play().catch(error => console.error('Failed to play notification sound:', error));
    }
    
    // Show desktop notification if enabled
    if (state.showDesktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: options?.icon,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: options?.icon,
            });
          }
        });
      }
    }
    
    // Auto remove notification after duration if not persistent
    if (!notification.persistent && notification.duration) {
      setTimeout(() => {
        dispatch({
          type: NotificationActionTypes.REMOVE_NOTIFICATION,
          payload: id,
        });
      }, notification.duration);
    }
    
    return id;
  };
  
  // Notification methods
  const notify = (title: string, message: string, options?: NotificationOptions): string => {
    return createNotification(title, message, options?.type || 'info', options);
  };
  
  const info = (title: string, message: string, options?: NotificationOptions): string => {
    return createNotification(title, message, 'info', options);
  };
  
  const success = (title: string, message: string, options?: NotificationOptions): string => {
    return createNotification(title, message, 'success', options);
  };
  
  const warning = (title: string, message: string, options?: NotificationOptions): string => {
    return createNotification(title, message, 'warning', options);
  };
  
  const error = (title: string, message: string, options?: NotificationOptions): string => {
    return createNotification(title, message, 'error', options);
  };
  
  // Remove notification
  const remove = (id: string): void => {
    dispatch({
      type: NotificationActionTypes.REMOVE_NOTIFICATION,
      payload: id,
    });
  };
  
  // Mark notification as read
  const markAsRead = (id: string): void => {
    dispatch({
      type: NotificationActionTypes.MARK_AS_READ,
      payload: id,
    });
  };
  
  // Mark notification as unread
  const markAsUnread = (id: string): void => {
    dispatch({
      type: NotificationActionTypes.MARK_AS_UNREAD,
      payload: id,
    });
  };
  
  // Archive notification
  const archive = (id: string): void => {
    dispatch({
      type: NotificationActionTypes.ARCHIVE_NOTIFICATION,
      payload: id,
    });
  };
  
  // Delete notification
  const deleteNotification = (id: string): void => {
    dispatch({
      type: NotificationActionTypes.DELETE_NOTIFICATION,
      payload: id,
    });
  };
  
  // Clear all notifications
  const clearAll = (): void => {
    dispatch({
      type: NotificationActionTypes.CLEAR_ALL_NOTIFICATIONS,
    });
  };
  
  // Toggle notification center
  const toggleNotificationCenter = (): void => {
    dispatch({
      type: NotificationActionTypes.TOGGLE_NOTIFICATION_CENTER,
    });
  };
  
  return (
    <NotificationContext.Provider
      value={{
        state,
        dispatch,
        notify,
        info,
        success,
        warning,
        error,
        remove,
        markAsRead,
        markAsUnread,
        archive,
        delete: deleteNotification,
        clearAll,
        toggleNotificationCenter,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
