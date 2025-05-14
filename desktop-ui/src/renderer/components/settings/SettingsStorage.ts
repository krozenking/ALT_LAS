import { SettingsSchema, SettingsValues, SettingValue } from './types';

/**
 * Settings storage service
 */
class SettingsStorage {
  /**
   * Storage key
   */
  private readonly storageKey: string;
  
  /**
   * Constructor
   * @param storageKey Storage key
   */
  constructor(storageKey: string = 'app_settings') {
    this.storageKey = storageKey;
  }
  
  /**
   * Load settings schema
   * @returns Settings schema
   */
  async loadSchema(): Promise<SettingsSchema> {
    try {
      // In a real application, this might be loaded from a server or a local file
      // For this demo, we'll use a hardcoded schema
      const schema: SettingsSchema = {
        version: '1.0.0',
        groups: [
          {
            id: 'general',
            label: 'General',
            icon: '⚙️',
            order: 1,
            settings: [
              {
                id: 'language',
                label: 'Language',
                description: 'Application language',
                type: 'select',
                defaultValue: 'en',
                options: [
                  { label: 'English', value: 'en' },
                  { label: 'Turkish', value: 'tr' },
                  { label: 'German', value: 'de' },
                  { label: 'French', value: 'fr' },
                  { label: 'Spanish', value: 'es' },
                ],
                icon: '🌐',
                requiresReload: true,
              },
              {
                id: 'theme',
                label: 'Theme',
                description: 'Application theme',
                type: 'select',
                defaultValue: 'system',
                options: [
                  { label: 'System', value: 'system' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ],
                icon: '🎨',
              },
              {
                id: 'fontSize',
                label: 'Font Size',
                description: 'Application font size',
                type: 'select',
                defaultValue: 'medium',
                options: [
                  { label: 'Small', value: 'small' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'Large', value: 'large' },
                ],
                icon: '🔤',
              },
              {
                id: 'autoSave',
                label: 'Auto Save',
                description: 'Automatically save changes',
                type: 'boolean',
                defaultValue: true,
                icon: '💾',
              },
              {
                id: 'autoSaveInterval',
                label: 'Auto Save Interval',
                description: 'Interval in seconds for auto save',
                type: 'number',
                defaultValue: 60,
                min: 10,
                max: 3600,
                step: 10,
                unit: 'seconds',
                icon: '⏱️',
                dependsOn: {
                  settingId: 'autoSave',
                  value: true,
                },
              },
            ],
          },
          {
            id: 'appearance',
            label: 'Appearance',
            icon: '👁️',
            order: 2,
            settings: [
              {
                id: 'accentColor',
                label: 'Accent Color',
                description: 'Application accent color',
                type: 'color',
                defaultValue: '#3182ce',
                icon: '🎨',
              },
              {
                id: 'showToolbar',
                label: 'Show Toolbar',
                description: 'Show toolbar in the application',
                type: 'boolean',
                defaultValue: true,
                icon: '🧰',
              },
              {
                id: 'showStatusBar',
                label: 'Show Status Bar',
                description: 'Show status bar in the application',
                type: 'boolean',
                defaultValue: true,
                icon: '📊',
              },
              {
                id: 'showSidebar',
                label: 'Show Sidebar',
                description: 'Show sidebar in the application',
                type: 'boolean',
                defaultValue: true,
                icon: '📋',
              },
              {
                id: 'sidebarPosition',
                label: 'Sidebar Position',
                description: 'Position of the sidebar',
                type: 'select',
                defaultValue: 'left',
                options: [
                  { label: 'Left', value: 'left' },
                  { label: 'Right', value: 'right' },
                ],
                icon: '📏',
                dependsOn: {
                  settingId: 'showSidebar',
                  value: true,
                },
              },
            ],
          },
          {
            id: 'accessibility',
            label: 'Accessibility',
            icon: '♿',
            order: 3,
            settings: [
              {
                id: 'highContrast',
                label: 'High Contrast',
                description: 'Enable high contrast mode',
                type: 'boolean',
                defaultValue: false,
                icon: '👓',
              },
              {
                id: 'reducedMotion',
                label: 'Reduced Motion',
                description: 'Reduce motion in animations',
                type: 'boolean',
                defaultValue: false,
                icon: '🚶',
              },
              {
                id: 'screenReader',
                label: 'Screen Reader',
                description: 'Optimize for screen readers',
                type: 'boolean',
                defaultValue: false,
                icon: '🔊',
              },
              {
                id: 'textToSpeech',
                label: 'Text to Speech',
                description: 'Enable text to speech',
                type: 'boolean',
                defaultValue: false,
                icon: '🗣️',
              },
              {
                id: 'keyboardNavigation',
                label: 'Keyboard Navigation',
                description: 'Enable keyboard navigation',
                type: 'boolean',
                defaultValue: true,
                icon: '⌨️',
              },
            ],
          },
          {
            id: 'notifications',
            label: 'Notifications',
            icon: '🔔',
            order: 4,
            settings: [
              {
                id: 'enableNotifications',
                label: 'Enable Notifications',
                description: 'Enable application notifications',
                type: 'boolean',
                defaultValue: true,
                icon: '🔔',
              },
              {
                id: 'notificationPosition',
                label: 'Notification Position',
                description: 'Position of notifications',
                type: 'select',
                defaultValue: 'top-right',
                options: [
                  { label: 'Top Right', value: 'top-right' },
                  { label: 'Top Left', value: 'top-left' },
                  { label: 'Bottom Right', value: 'bottom-right' },
                  { label: 'Bottom Left', value: 'bottom-left' },
                  { label: 'Top Center', value: 'top-center' },
                  { label: 'Bottom Center', value: 'bottom-center' },
                ],
                icon: '📍',
                dependsOn: {
                  settingId: 'enableNotifications',
                  value: true,
                },
              },
              {
                id: 'notificationDuration',
                label: 'Notification Duration',
                description: 'Duration of notifications in seconds',
                type: 'number',
                defaultValue: 5,
                min: 1,
                max: 60,
                step: 1,
                unit: 'seconds',
                icon: '⏱️',
                dependsOn: {
                  settingId: 'enableNotifications',
                  value: true,
                },
              },
              {
                id: 'playSound',
                label: 'Play Sound',
                description: 'Play sound on notification',
                type: 'boolean',
                defaultValue: true,
                icon: '🔊',
                dependsOn: {
                  settingId: 'enableNotifications',
                  value: true,
                },
              },
              {
                id: 'showBadge',
                label: 'Show Badge',
                description: 'Show badge on notification icon',
                type: 'boolean',
                defaultValue: true,
                icon: '🔴',
                dependsOn: {
                  settingId: 'enableNotifications',
                  value: true,
                },
              },
            ],
          },
          {
            id: 'advanced',
            label: 'Advanced',
            icon: '🔧',
            order: 5,
            settings: [
              {
                id: 'developerMode',
                label: 'Developer Mode',
                description: 'Enable developer mode',
                type: 'boolean',
                defaultValue: false,
                icon: '👨‍💻',
                advanced: true,
              },
              {
                id: 'debugLogging',
                label: 'Debug Logging',
                description: 'Enable debug logging',
                type: 'boolean',
                defaultValue: false,
                icon: '📝',
                advanced: true,
                dependsOn: {
                  settingId: 'developerMode',
                  value: true,
                },
              },
              {
                id: 'experimentalFeatures',
                label: 'Experimental Features',
                description: 'Enable experimental features',
                type: 'boolean',
                defaultValue: false,
                icon: '🧪',
                experimental: true,
              },
              {
                id: 'dataCollection',
                label: 'Data Collection',
                description: 'Allow anonymous data collection',
                type: 'boolean',
                defaultValue: true,
                icon: '📊',
              },
              {
                id: 'crashReporting',
                label: 'Crash Reporting',
                description: 'Send crash reports',
                type: 'boolean',
                defaultValue: true,
                icon: '💥',
              },
            ],
          },
        ],
      };
      
      return schema;
    } catch (error) {
      console.error('Failed to load settings schema:', error);
      throw error;
    }
  }
  
  /**
   * Load settings values
   * @returns Settings values
   */
  async loadValues(): Promise<SettingsValues> {
    try {
      const storedValues = localStorage.getItem(this.storageKey);
      
      if (storedValues) {
        return JSON.parse(storedValues) as SettingsValues;
      }
      
      // Return default values
      return {
        version: '1.0.0',
        values: {},
      };
    } catch (error) {
      console.error('Failed to load settings values:', error);
      throw error;
    }
  }
  
  /**
   * Save settings values
   * @param values Settings values
   */
  async saveValues(values: SettingsValues): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(values));
    } catch (error) {
      console.error('Failed to save settings values:', error);
      throw error;
    }
  }
  
  /**
   * Get setting value
   * @param groupId Group ID
   * @param settingId Setting ID
   * @param defaultValue Default value
   * @returns Setting value
   */
  async getValue(groupId: string, settingId: string, defaultValue?: SettingValue): Promise<SettingValue> {
    try {
      const values = await this.loadValues();
      
      if (values.values[groupId] && values.values[groupId][settingId] !== undefined) {
        return values.values[groupId][settingId];
      }
      
      return defaultValue !== undefined ? defaultValue : null;
    } catch (error) {
      console.error(`Failed to get setting value for ${groupId}.${settingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Set setting value
   * @param groupId Group ID
   * @param settingId Setting ID
   * @param value Setting value
   */
  async setValue(groupId: string, settingId: string, value: SettingValue): Promise<void> {
    try {
      const values = await this.loadValues();
      
      if (!values.values[groupId]) {
        values.values[groupId] = {};
      }
      
      values.values[groupId][settingId] = value;
      
      await this.saveValues(values);
    } catch (error) {
      console.error(`Failed to set setting value for ${groupId}.${settingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reset setting value
   * @param groupId Group ID
   * @param settingId Setting ID
   */
  async resetValue(groupId: string, settingId: string): Promise<void> {
    try {
      const values = await this.loadValues();
      
      if (values.values[groupId] && values.values[groupId][settingId] !== undefined) {
        delete values.values[groupId][settingId];
        
        if (Object.keys(values.values[groupId]).length === 0) {
          delete values.values[groupId];
        }
        
        await this.saveValues(values);
      }
    } catch (error) {
      console.error(`Failed to reset setting value for ${groupId}.${settingId}:`, error);
      throw error;
    }
  }
  
  /**
   * Reset all settings
   */
  async resetAll(): Promise<void> {
    try {
      await this.saveValues({
        version: '1.0.0',
        values: {},
      });
    } catch (error) {
      console.error('Failed to reset all settings:', error);
      throw error;
    }
  }
  
  /**
   * Reset group settings
   * @param groupId Group ID
   */
  async resetGroup(groupId: string): Promise<void> {
    try {
      const values = await this.loadValues();
      
      if (values.values[groupId]) {
        delete values.values[groupId];
        await this.saveValues(values);
      }
    } catch (error) {
      console.error(`Failed to reset group settings for ${groupId}:`, error);
      throw error;
    }
  }
  
  /**
   * Import settings
   * @param values Settings values
   */
  async importSettings(values: SettingsValues): Promise<void> {
    try {
      await this.saveValues(values);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw error;
    }
  }
  
  /**
   * Export settings
   * @returns Settings values
   */
  async exportSettings(): Promise<SettingsValues> {
    try {
      return await this.loadValues();
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }
}

export default SettingsStorage;
