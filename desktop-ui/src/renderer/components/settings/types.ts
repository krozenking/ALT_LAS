/**
 * Setting value type
 */
export type SettingValueType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'object'
  | 'array';

/**
 * Setting value
 */
export type SettingValue = 
  | string
  | number
  | boolean
  | string[]
  | Record<string, any>
  | any[];

/**
 * Setting option
 */
export interface SettingOption {
  /**
   * Option label
   */
  label: string;
  /**
   * Option value
   */
  value: string | number | boolean;
  /**
   * Option description
   */
  description?: string;
  /**
   * Option icon
   */
  icon?: string;
  /**
   * Option disabled
   */
  disabled?: boolean;
}

/**
 * Setting validation
 */
export interface SettingValidation {
  /**
   * Required
   */
  required?: boolean;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Minimum length
   */
  minLength?: number;
  /**
   * Maximum length
   */
  maxLength?: number;
  /**
   * Pattern
   */
  pattern?: string;
  /**
   * Custom validator
   */
  validator?: (value: SettingValue) => boolean | string;
}

/**
 * Setting definition
 */
export interface SettingDefinition {
  /**
   * Setting ID
   */
  id: string;
  /**
   * Setting label
   */
  label: string;
  /**
   * Setting description
   */
  description?: string;
  /**
   * Setting type
   */
  type: SettingValueType;
  /**
   * Setting default value
   */
  defaultValue: SettingValue;
  /**
   * Setting options (for select and multiselect)
   */
  options?: SettingOption[];
  /**
   * Setting validation
   */
  validation?: SettingValidation;
  /**
   * Setting disabled
   */
  disabled?: boolean;
  /**
   * Setting hidden
   */
  hidden?: boolean;
  /**
   * Setting icon
   */
  icon?: string;
  /**
   * Setting placeholder
   */
  placeholder?: string;
  /**
   * Setting help text
   */
  helpText?: string;
  /**
   * Setting unit
   */
  unit?: string;
  /**
   * Setting step (for number)
   */
  step?: number;
  /**
   * Setting min (for number)
   */
  min?: number;
  /**
   * Setting max (for number)
   */
  max?: number;
  /**
   * Setting format (for date, time, etc.)
   */
  format?: string;
  /**
   * Setting depends on
   */
  dependsOn?: {
    /**
     * Setting ID
     */
    settingId: string;
    /**
     * Setting value
     */
    value: SettingValue;
  };
  /**
   * Setting onChange callback
   */
  onChange?: (value: SettingValue, prevValue: SettingValue) => void;
  /**
   * Setting requires restart
   */
  requiresRestart?: boolean;
  /**
   * Setting requires reload
   */
  requiresReload?: boolean;
  /**
   * Setting advanced
   */
  advanced?: boolean;
  /**
   * Setting experimental
   */
  experimental?: boolean;
  /**
   * Setting deprecated
   */
  deprecated?: boolean;
  /**
   * Setting tags
   */
  tags?: string[];
  /**
   * Setting metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Setting group
 */
export interface SettingGroup {
  /**
   * Group ID
   */
  id: string;
  /**
   * Group label
   */
  label: string;
  /**
   * Group description
   */
  description?: string;
  /**
   * Group icon
   */
  icon?: string;
  /**
   * Group settings
   */
  settings: SettingDefinition[];
  /**
   * Group disabled
   */
  disabled?: boolean;
  /**
   * Group hidden
   */
  hidden?: boolean;
  /**
   * Group order
   */
  order?: number;
  /**
   * Group tags
   */
  tags?: string[];
  /**
   * Group metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Settings schema
 */
export interface SettingsSchema {
  /**
   * Schema version
   */
  version: string;
  /**
   * Schema groups
   */
  groups: SettingGroup[];
}

/**
 * Settings values
 */
export interface SettingsValues {
  /**
   * Settings version
   */
  version: string;
  /**
   * Settings values
   */
  values: Record<string, Record<string, SettingValue>>;
}

/**
 * Settings state
 */
export interface SettingsState {
  /**
   * Settings schema
   */
  schema: SettingsSchema;
  /**
   * Settings values
   */
  values: SettingsValues;
  /**
   * Settings loading
   */
  loading: boolean;
  /**
   * Settings error
   */
  error: string | null;
  /**
   * Settings modified
   */
  modified: boolean;
  /**
   * Settings requires restart
   */
  requiresRestart: boolean;
  /**
   * Settings requires reload
   */
  requiresReload: boolean;
  /**
   * Settings filter
   */
  filter: {
    /**
     * Search term
     */
    searchTerm?: string;
    /**
     * Show advanced
     */
    showAdvanced?: boolean;
    /**
     * Show experimental
     */
    showExperimental?: boolean;
    /**
     * Show deprecated
     */
    showDeprecated?: boolean;
    /**
     * Filter by tags
     */
    tags?: string[];
  };
}

/**
 * Settings action types
 */
export enum SettingsActionTypes {
  SET_SCHEMA = 'SET_SCHEMA',
  SET_VALUES = 'SET_VALUES',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_SETTING_VALUE = 'SET_SETTING_VALUE',
  RESET_SETTING_VALUE = 'RESET_SETTING_VALUE',
  RESET_ALL_SETTINGS = 'RESET_ALL_SETTINGS',
  RESET_GROUP_SETTINGS = 'RESET_GROUP_SETTINGS',
  IMPORT_SETTINGS = 'IMPORT_SETTINGS',
  SET_FILTER = 'SET_FILTER',
}

/**
 * Settings action
 */
export interface SettingsAction {
  type: SettingsActionTypes;
  payload?: any;
}
