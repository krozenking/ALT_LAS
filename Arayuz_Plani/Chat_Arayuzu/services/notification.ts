// Notification types
export enum NotificationType {
  MESSAGE = 'message',
  GROUP_INVITATION = 'group_invitation',
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  ADMIN_PROMOTION = 'admin_promotion',
  ADMIN_DEMOTION = 'admin_demotion',
  GROUP_UPDATE = 'group_update',
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    conversationId?: string;
    userId?: string;
    messageId?: string;
    [key: string]: any;
  };
}

// Notification service
class NotificationService {
  private static instance: NotificationService;
  private notificationPermission: NotificationPermission = 'default';
  private notificationSound: HTMLAudioElement | null = null;
  private notificationEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private callbacks: ((notification: Notification) => void)[] = [];

  private constructor() {
    // Initialize notification sound
    this.notificationSound = new Audio('/notification.mp3');
    
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }
    
    // Get notification permission
    this.notificationPermission = Notification.permission;
    
    // Request permission if not granted
    if (this.notificationPermission !== 'granted') {
      this.requestPermission();
    }
    
    // Load notification settings from local storage
    this.loadSettings();
  }

  // Get instance (singleton)
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Request notification permission
  public requestPermission(): Promise<NotificationPermission> {
    return new Promise((resolve) => {
      if (!('Notification' in window)) {
        resolve('denied');
        return;
      }
      
      Notification.requestPermission().then((permission) => {
        this.notificationPermission = permission;
        resolve(permission);
      });
    });
  }

  // Show browser notification
  public showBrowserNotification(notification: Notification): void {
    if (!this.notificationEnabled || this.notificationPermission !== 'granted') {
      return;
    }
    
    const browserNotification = new window.Notification(notification.title, {
      body: notification.message,
      icon: '/logo.png',
      tag: notification.id,
    });
    
    // Play sound if enabled
    if (this.soundEnabled && this.notificationSound) {
      this.notificationSound.play().catch((error) => {
        console.error('Error playing notification sound:', error);
      });
    }
    
    // Handle click
    browserNotification.onclick = () => {
      window.focus();
      browserNotification.close();
      
      // Trigger callbacks
      this.callbacks.forEach((callback) => {
        callback(notification);
      });
    };
  }

  // Show in-app notification
  public showInAppNotification(notification: Notification): void {
    if (!this.notificationEnabled) {
      return;
    }
    
    // Play sound if enabled
    if (this.soundEnabled && this.notificationSound) {
      this.notificationSound.play().catch((error) => {
        console.error('Error playing notification sound:', error);
      });
    }
    
    // Trigger callbacks
    this.callbacks.forEach((callback) => {
      callback(notification);
    });
  }

  // Register callback for notification click
  public onNotificationClick(callback: (notification: Notification) => void): void {
    this.callbacks.push(callback);
  }

  // Remove callback
  public removeCallback(callback: (notification: Notification) => void): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  // Enable/disable notifications
  public setNotificationEnabled(enabled: boolean): void {
    this.notificationEnabled = enabled;
    this.saveSettings();
  }

  // Enable/disable sound
  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.saveSettings();
  }

  // Get notification settings
  public getSettings(): { notificationEnabled: boolean; soundEnabled: boolean } {
    return {
      notificationEnabled: this.notificationEnabled,
      soundEnabled: this.soundEnabled,
    };
  }

  // Save settings to local storage
  private saveSettings(): void {
    try {
      localStorage.setItem('notification_settings', JSON.stringify({
        notificationEnabled: this.notificationEnabled,
        soundEnabled: this.soundEnabled,
      }));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Load settings from local storage
  private loadSettings(): void {
    try {
      const settings = localStorage.getItem('notification_settings');
      if (settings) {
        const { notificationEnabled, soundEnabled } = JSON.parse(settings);
        this.notificationEnabled = notificationEnabled;
        this.soundEnabled = soundEnabled;
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
