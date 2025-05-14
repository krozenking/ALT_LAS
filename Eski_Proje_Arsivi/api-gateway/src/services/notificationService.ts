import logger from '../utils/logger';

/**
 * Notification Service
 * 
 * Handles sending alerts and notifications based on system events.
 */

interface AlertDetails {
  serviceName?: string;
  status: string;
  message: string;
  timestamp: string;
  details?: any;
}

class NotificationService {
  /**
   * Sends an alert notification.
   * Currently logs the alert to the console/log file.
   * Can be extended to send emails, Slack messages, etc.
   * 
   * @param level Alert level (e.g., 'error', 'warn', 'info')
   * @param alert Details of the alert
   */
  sendAlert(level: 'error' | 'warn' | 'info', alert: AlertDetails): void {
    const logMessage = `ALERT [${level.toUpperCase()}] - ${alert.message} - Status: ${alert.status}${alert.serviceName ? ' - Service: ' + alert.serviceName : ''}`;
    
    if (level === 'error') {
      logger.error(logMessage, { alertDetails: alert });
    } else if (level === 'warn') {
      logger.warn(logMessage, { alertDetails: alert });
    } else {
      logger.info(logMessage, { alertDetails: alert });
    }
    
    // TODO: Implement other notification channels (email, Slack, etc.) if needed
  }
}

export default new NotificationService();

