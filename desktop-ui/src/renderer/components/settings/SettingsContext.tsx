import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  SettingsSchema,
  SettingsValues,
  SettingsState,
  SettingsAction,
  SettingsActionTypes,
  SettingValue,
  SettingGroup,
  SettingDefinition,
} from './types';
import SettingsStorage from './SettingsStorage';

// Initial settings state
const initialSettingsState: SettingsState = {
  schema: {
    version: '1.0.0',
    groups: [],
  },
  values: {
    version: '1.0.0',
    values: {},
  },
  loading: true,
  error: null,
  modified: false,
  requiresRestart: false,
  requiresReload: false,
  filter: {
    showAdvanced: false,
    showExperimental: false,
    showDeprecated: false,
  },
};

// Settings reducer
const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case SettingsActionTypes.SET_SCHEMA:
      return {
        ...state,
        schema: action.payload,
      };
    
    case SettingsActionTypes.SET_VALUES:
      return {
        ...state,
        values: action.payload,
        modified: false,
      };
    
    case SettingsActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case SettingsActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    
    case SettingsActionTypes.SET_SETTING_VALUE: {
      const { groupId, settingId, value } = action.payload;
      const settingDefinition = state.schema.groups
        .find(group => group.id === groupId)
        ?.settings.find(setting => setting.id === settingId);
      
      // Check if setting requires restart or reload
      const requiresRestart = settingDefinition?.requiresRestart || state.requiresRestart;
      const requiresReload = settingDefinition?.requiresReload || state.requiresReload;
      
      // Create a new values object
      const newValues = { ...state.values };
      
      // Ensure group exists
      if (!newValues.values[groupId]) {
        newValues.values[groupId] = {};
      }
      
      // Set the value
      newValues.values[groupId][settingId] = value;
      
      return {
        ...state,
        values: newValues,
        modified: true,
        requiresRestart,
        requiresReload,
      };
    }
    
    case SettingsActionTypes.RESET_SETTING_VALUE: {
      const { groupId, settingId } = action.payload;
      const settingDefinition = state.schema.groups
        .find(group => group.id === groupId)
        ?.settings.find(setting => setting.id === settingId);
      
      // Check if setting requires restart or reload
      const requiresRestart = settingDefinition?.requiresRestart || state.requiresRestart;
      const requiresReload = settingDefinition?.requiresReload || state.requiresReload;
      
      // Create a new values object
      const newValues = { ...state.values };
      
      // Ensure group exists
      if (newValues.values[groupId] && newValues.values[groupId][settingId] !== undefined) {
        delete newValues.values[groupId][settingId];
        
        // Remove group if empty
        if (Object.keys(newValues.values[groupId]).length === 0) {
          delete newValues.values[groupId];
        }
      }
      
      return {
        ...state,
        values: newValues,
        modified: true,
        requiresRestart,
        requiresReload,
      };
    }
    
    case SettingsActionTypes.RESET_ALL_SETTINGS:
      return {
        ...state,
        values: {
          version: state.values.version,
          values: {},
        },
        modified: true,
        requiresRestart: true,
        requiresReload: true,
      };
    
    case SettingsActionTypes.RESET_GROUP_SETTINGS: {
      const { groupId } = action.payload;
      const groupDefinition = state.schema.groups.find(group => group.id === groupId);
      
      // Check if any setting in the group requires restart or reload
      const requiresRestart = groupDefinition?.settings.some(setting => setting.requiresRestart) || state.requiresRestart;
      const requiresReload = groupDefinition?.settings.some(setting => setting.requiresReload) || state.requiresReload;
      
      // Create a new values object
      const newValues = { ...state.values };
      
      // Remove group
      if (newValues.values[groupId]) {
        delete newValues.values[groupId];
      }
      
      return {
        ...state,
        values: newValues,
        modified: true,
        requiresRestart,
        requiresReload,
      };
    }
    
    case SettingsActionTypes.IMPORT_SETTINGS:
      return {
        ...state,
        values: action.payload,
        modified: true,
        requiresRestart: true,
        requiresReload: true,
      };
    
    case SettingsActionTypes.SET_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload,
        },
      };
    
    default:
      return state;
  }
};

// Settings context
export interface SettingsContextType {
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;
  getSettingValue: <T extends SettingValue>(groupId: string, settingId: string, defaultValue?: T) => T;
  setSettingValue: (groupId: string, settingId: string, value: SettingValue) => void;
  resetSettingValue: (groupId: string, settingId: string) => void;
  resetAllSettings: () => void;
  resetGroupSettings: (groupId: string) => void;
  saveSettings: () => Promise<void>;
  importSettings: (values: SettingsValues) => Promise<void>;
  exportSettings: () => Promise<SettingsValues>;
  getSettingDefinition: (groupId: string, settingId: string) => SettingDefinition | undefined;
  getGroupDefinition: (groupId: string) => SettingGroup | undefined;
  isSettingVisible: (groupId: string, settingId: string) => boolean;
  isGroupVisible: (groupId: string) => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings provider props
export interface SettingsProviderProps {
  children: ReactNode;
  storageKey?: string;
}

// Settings provider
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  storageKey = 'app_settings',
}) => {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);
  const settingsStorage = new SettingsStorage(storageKey);
  
  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        dispatch({ type: SettingsActionTypes.SET_LOADING, payload: true });
        
        // Load schema
        const schema = await settingsStorage.loadSchema();
        dispatch({ type: SettingsActionTypes.SET_SCHEMA, payload: schema });
        
        // Load values
        const values = await settingsStorage.loadValues();
        dispatch({ type: SettingsActionTypes.SET_VALUES, payload: values });
        
        dispatch({ type: SettingsActionTypes.SET_LOADING, payload: false });
      } catch (error) {
        console.error('Failed to load settings:', error);
        dispatch({ type: SettingsActionTypes.SET_ERROR, payload: 'Failed to load settings' });
        dispatch({ type: SettingsActionTypes.SET_LOADING, payload: false });
      }
    };
    
    loadSettings();
  }, []);
  
  // Get setting value
  const getSettingValue = <T extends SettingValue>(groupId: string, settingId: string, defaultValue?: T): T => {
    // Get setting definition
    const settingDefinition = state.schema.groups
      .find(group => group.id === groupId)
      ?.settings.find(setting => setting.id === settingId);
    
    // Get value from state
    const value = state.values.values[groupId]?.[settingId];
    
    // Return value or default value
    if (value !== undefined) {
      return value as T;
    }
    
    // Return provided default value or setting default value
    return (defaultValue !== undefined ? defaultValue : settingDefinition?.defaultValue) as T;
  };
  
  // Set setting value
  const setSettingValue = (groupId: string, settingId: string, value: SettingValue) => {
    dispatch({
      type: SettingsActionTypes.SET_SETTING_VALUE,
      payload: { groupId, settingId, value },
    });
  };
  
  // Reset setting value
  const resetSettingValue = (groupId: string, settingId: string) => {
    dispatch({
      type: SettingsActionTypes.RESET_SETTING_VALUE,
      payload: { groupId, settingId },
    });
  };
  
  // Reset all settings
  const resetAllSettings = () => {
    dispatch({ type: SettingsActionTypes.RESET_ALL_SETTINGS });
  };
  
  // Reset group settings
  const resetGroupSettings = (groupId: string) => {
    dispatch({
      type: SettingsActionTypes.RESET_GROUP_SETTINGS,
      payload: { groupId },
    });
  };
  
  // Save settings
  const saveSettings = async () => {
    try {
      await settingsStorage.saveValues(state.values);
      dispatch({ type: SettingsActionTypes.SET_VALUES, payload: state.values });
    } catch (error) {
      console.error('Failed to save settings:', error);
      dispatch({ type: SettingsActionTypes.SET_ERROR, payload: 'Failed to save settings' });
    }
  };
  
  // Import settings
  const importSettings = async (values: SettingsValues) => {
    try {
      await settingsStorage.importSettings(values);
      dispatch({ type: SettingsActionTypes.IMPORT_SETTINGS, payload: values });
    } catch (error) {
      console.error('Failed to import settings:', error);
      dispatch({ type: SettingsActionTypes.SET_ERROR, payload: 'Failed to import settings' });
    }
  };
  
  // Export settings
  const exportSettings = async () => {
    try {
      return await settingsStorage.exportSettings();
    } catch (error) {
      console.error('Failed to export settings:', error);
      dispatch({ type: SettingsActionTypes.SET_ERROR, payload: 'Failed to export settings' });
      throw error;
    }
  };
  
  // Get setting definition
  const getSettingDefinition = (groupId: string, settingId: string) => {
    return state.schema.groups
      .find(group => group.id === groupId)
      ?.settings.find(setting => setting.id === settingId);
  };
  
  // Get group definition
  const getGroupDefinition = (groupId: string) => {
    return state.schema.groups.find(group => group.id === groupId);
  };
  
  // Check if setting is visible
  const isSettingVisible = (groupId: string, settingId: string) => {
    const settingDefinition = getSettingDefinition(groupId, settingId);
    
    if (!settingDefinition) {
      return false;
    }
    
    // Check if setting is hidden
    if (settingDefinition.hidden) {
      return false;
    }
    
    // Check if setting is advanced
    if (settingDefinition.advanced && !state.filter.showAdvanced) {
      return false;
    }
    
    // Check if setting is experimental
    if (settingDefinition.experimental && !state.filter.showExperimental) {
      return false;
    }
    
    // Check if setting is deprecated
    if (settingDefinition.deprecated && !state.filter.showDeprecated) {
      return false;
    }
    
    // Check if setting depends on another setting
    if (settingDefinition.dependsOn) {
      const { settingId: dependsOnSettingId, value: dependsOnValue } = settingDefinition.dependsOn;
      const dependsOnGroupId = groupId; // Assuming dependency is in the same group
      
      const dependsOnSettingValue = getSettingValue(dependsOnGroupId, dependsOnSettingId);
      
      return dependsOnSettingValue === dependsOnValue;
    }
    
    // Check if setting matches search term
    if (state.filter.searchTerm) {
      const searchTerm = state.filter.searchTerm.toLowerCase();
      
      return (
        settingDefinition.label.toLowerCase().includes(searchTerm) ||
        (settingDefinition.description && settingDefinition.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Check if setting matches tags
    if (state.filter.tags && state.filter.tags.length > 0) {
      if (!settingDefinition.tags || settingDefinition.tags.length === 0) {
        return false;
      }
      
      return state.filter.tags.some(tag => settingDefinition.tags?.includes(tag));
    }
    
    return true;
  };
  
  // Check if group is visible
  const isGroupVisible = (groupId: string) => {
    const groupDefinition = getGroupDefinition(groupId);
    
    if (!groupDefinition) {
      return false;
    }
    
    // Check if group is hidden
    if (groupDefinition.hidden) {
      return false;
    }
    
    // Check if group has visible settings
    const hasVisibleSettings = groupDefinition.settings.some(setting =>
      isSettingVisible(groupId, setting.id)
    );
    
    if (!hasVisibleSettings) {
      return false;
    }
    
    // Check if group matches search term
    if (state.filter.searchTerm) {
      const searchTerm = state.filter.searchTerm.toLowerCase();
      
      return (
        groupDefinition.label.toLowerCase().includes(searchTerm) ||
        (groupDefinition.description && groupDefinition.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Check if group matches tags
    if (state.filter.tags && state.filter.tags.length > 0) {
      if (!groupDefinition.tags || groupDefinition.tags.length === 0) {
        return false;
      }
      
      return state.filter.tags.some(tag => groupDefinition.tags?.includes(tag));
    }
    
    return true;
  };
  
  return (
    <SettingsContext.Provider
      value={{
        state,
        dispatch,
        getSettingValue,
        setSettingValue,
        resetSettingValue,
        resetAllSettings,
        resetGroupSettings,
        saveSettings,
        importSettings,
        exportSettings,
        getSettingDefinition,
        getGroupDefinition,
        isSettingVisible,
        isGroupVisible,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};

export default SettingsContext;
