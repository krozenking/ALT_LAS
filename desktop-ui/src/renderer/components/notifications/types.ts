/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification position
 */
export type NotificationPosition = 
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

/**
 * Notification status
 */
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted';

/**
 * Notification
 */
export interface Notification {
  /**
   * Notification ID
   */
  id: string;
  /**
   * Notification title
   */
  title: string;
  /**
   * Notification message
   */
  message: string;
  /**
   * Notification type
   */
  type: NotificationType;
  /**
   * Notification status
   */
  status: NotificationStatus;
  /**
   * Notification created at
   */
  createdAt: Date;
  /**
   * Notification read at
   */
  readAt?: Date;
  /**
   * Notification archived at
   */
  archivedAt?: Date;
  /**
   * Notification deleted at
   */
  deletedAt?: Date;
  /**
   * Notification icon
   */
  icon?: string;
  /**
   * Notification action
   */
  action?: {
    /**
     * Action label
     */
    label: string;
    /**
     * Action callback
     */
    onClick: () => void;
  };
  /**
   * Notification duration in milliseconds
   */
  duration?: number;
  /**
   * Whether notification is dismissible
   */
  dismissible?: boolean;
  /**
   * Whether notification is persistent
   */
  persistent?: boolean;
  /**
   * Notification source
   */
  source?: string;
  /**
   * Notification category
   */
  category?: string;
  /**
   * Notification priority
   */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /**
   * Notification data
   */
  data?: Record<string, any>;
}

/**
 * Notification options
 */
export interface NotificationOptions {
  /**
   * Notification type
   */
  type?: NotificationType;
  /**
   * Notification icon
   */
  icon?: string;
  /**
   * Notification action
   */
  action?: {
    /**
     * Action label
     */
    label: string;
    /**
     * Action callback
     */
    onClick: () => void;
  };
  /**
   * Notification duration in milliseconds
   */
  duration?: number;
  /**
   * Whether notification is dismissible
   */
  dismissible?: boolean;
  /**
   * Whether notification is persistent
   */
  persistent?: boolean;
  /**
   * Notification source
   */
  source?: string;
  /**
   * Notification category
   */
  category?: string;
  /**
   * Notification priority
   */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /**
   * Notification data
   */
  data?: Record<string, any>;
}

/**
 * Notification state
 */
export interface NotificationState {
  /**
   * Notifications
   */
  notifications: Notification[];
  /**
   * Notification position
   */
  position: NotificationPosition;
  /**
   * Default notification duration in milliseconds
   */
  defaultDuration: number;
  /**
   * Maximum number of notifications to show
   */
  maxNotifications: number;
  /**
   * Whether to pause notifications on hover
   */
  pauseOnHover: boolean;
  /**
   * Whether to close notifications on click
   */
  closeOnClick: boolean;
  /**
   * Whether to show notification icons
   */
  showIcons: boolean;
  /**
   * Whether to show notification close button
   */
  showCloseButton: boolean;
  /**
   * Whether to show notification progress bar
   */
  showProgressBar: boolean;
  /**
   * Whether to show notification timestamp
   */
  showTimestamp: boolean;
  /**
   * Whether to group similar notifications
   */
  groupSimilar: boolean;
  /**
   * Whether to play sound on notification
   */
  playSound: boolean;
  /**
   * Notification sound
   */
  sound?: string;
  /**
   * Whether to show desktop notifications
   */
  showDesktopNotifications: boolean;
  /**
   * Whether to show notification badge
   */
  showBadge: boolean;
  /**
   * Whether to show notification center
   */
  showNotificationCenter: boolean;
  /**
   * Whether notification center is open
   */
  isNotificationCenterOpen: boolean;
  /**
   * Notification filter
   */
  filter: {
    /**
     * Filter by status
     */
    status?: NotificationStatus[];
    /**
     * Filter by type
     */
    type?: NotificationType[];
    /**
     * Filter by source
     */
    source?: string[];
    /**
     * Filter by category
     */
    category?: string[];
    /**
     * Filter by priority
     */
    priority?: ('low' | 'normal' | 'high' | 'urgent')[];
    /**
     * Filter by search term
     */
    searchTerm?: string;
  };
  /**
   * Notification sort
   */
  sort: {
    /**
     * Sort by field
     */
    by: 'createdAt' | 'readAt' | 'priority';
    /**
     * Sort direction
     */
    direction: 'asc' | 'desc';
  };
}

/**
 * Notification action types
 */
export enum NotificationActionTypes {
  ADD_NOTIFICATION = 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION',
  MARK_AS_READ = 'MARK_AS_READ',
  MARK_AS_UNREAD = 'MARK_AS_UNREAD',
  ARCHIVE_NOTIFICATION = 'ARCHIVE_NOTIFICATION',
  DELETE_NOTIFICATION = 'DELETE_NOTIFICATION',
  CLEAR_NOTIFICATIONS = 'CLEAR_NOTIFICATIONS',
  CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS',
  SET_POSITION = 'SET_POSITION',
  SET_DEFAULT_DURATION = 'SET_DEFAULT_DURATION',
  SET_MAX_NOTIFICATIONS = 'SET_MAX_NOTIFICATIONS',
  SET_PAUSE_ON_HOVER = 'SET_PAUSE_ON_HOVER',
  SET_CLOSE_ON_CLICK = 'SET_CLOSE_ON_CLICK',
  SET_SHOW_ICONS = 'SET_SHOW_ICONS',
  SET_SHOW_CLOSE_BUTTON = 'SET_SHOW_CLOSE_BUTTON',
  SET_SHOW_PROGRESS_BAR = 'SET_SHOW_PROGRESS_BAR',
  SET_SHOW_TIMESTAMP = 'SET_SHOW_TIMESTAMP',
  SET_GROUP_SIMILAR = 'SET_GROUP_SIMILAR',
  SET_PLAY_SOUND = 'SET_PLAY_SOUND',
  SET_SOUND = 'SET_SOUND',
  SET_SHOW_DESKTOP_NOTIFICATIONS = 'SET_SHOW_DESKTOP_NOTIFICATIONS',
  SET_SHOW_BADGE = 'SET_SHOW_BADGE',
  SET_SHOW_NOTIFICATION_CENTER = 'SET_SHOW_NOTIFICATION_CENTER',
  TOGGLE_NOTIFICATION_CENTER = 'TOGGLE_NOTIFICATION_CENTER',
  SET_FILTER = 'SET_FILTER',
  SET_SORT = 'SET_SORT',
}

/**
 * Notification action
 */
export interface NotificationAction {
  type: NotificationActionTypes;
  payload?: any;
}
