import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import {
  KeyboardShortcutSchema,
  KeyboardShortcutValues,
  KeyboardShortcutState,
  KeyboardShortcutAction,
  KeyboardShortcutActionTypes,
  KeyboardShortcut,
  KeyboardKey,
  KeyboardModifier,
  KeyboardEvent,
  KeyboardShortcutCombination,
  KeyboardShortcutDisplayOptions,
} from './types';
import KeyboardShortcutService from './KeyboardShortcutService';

// Initial keyboard shortcut state
const initialKeyboardShortcutState: KeyboardShortcutState = {
  schema: {
    version: '1.0.0',
    groups: [],
    scopes: [],
    shortcuts: [],
  },
  values: {
    version: '1.0.0',
    shortcuts: {},
  },
  activeShortcuts: [],
  activeScope: null,
  recordingShortcut: null,
  loading: true,
  error: null,
  modified: false,
  filter: {
    showDisabled: false,
    showHidden: false,
    showCustom: true,
    showDefault: true,
  },
};

// Keyboard shortcut reducer
const keyboardShortcutReducer = (state: KeyboardShortcutState, action: KeyboardShortcutAction): KeyboardShortcutState => {
  switch (action.type) {
    case KeyboardShortcutActionTypes.SET_SCHEMA:
      return {
        ...state,
        schema: action.payload,
      };
    
    case KeyboardShortcutActionTypes.SET_VALUES:
      return {
        ...state,
        values: action.payload,
        modified: false,
      };
    
    case KeyboardShortcutActionTypes.SET_ACTIVE_SHORTCUTS:
      return {
        ...state,
        activeShortcuts: action.payload,
      };
    
    case KeyboardShortcutActionTypes.SET_ACTIVE_SCOPE:
      return {
        ...state,
        activeScope: action.payload,
      };
    
    case KeyboardShortcutActionTypes.SET_RECORDING_SHORTCUT:
      return {
        ...state,
        recordingShortcut: action.payload,
      };
    
    case KeyboardShortcutActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    
    case KeyboardShortcutActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    
    case KeyboardShortcutActionTypes.SET_SHORTCUT: {
      const { shortcutId, key, modifiers, disabled } = action.payload;
      
      // Create a new values object
      const newValues = { ...state.values };
      
      // Set the shortcut
      newValues.shortcuts[shortcutId] = {
        key,
        modifiers,
        disabled,
      };
      
      return {
        ...state,
        values: newValues,
        modified: true,
      };
    }
    
    case KeyboardShortcutActionTypes.RESET_SHORTCUT: {
      const { shortcutId } = action.payload;
      
      // Create a new values object
      const newValues = { ...state.values };
      
      // Remove the shortcut
      if (newValues.shortcuts[shortcutId]) {
        delete newValues.shortcuts[shortcutId];
      }
      
      return {
        ...state,
        values: newValues,
        modified: true,
      };
    }
    
    case KeyboardShortcutActionTypes.RESET_ALL_SHORTCUTS:
      return {
        ...state,
        values: {
          version: state.values.version,
          shortcuts: {},
        },
        modified: true,
      };
    
    case KeyboardShortcutActionTypes.RESET_GROUP_SHORTCUTS: {
      const { groupId } = action.payload;
      
      // Create a new values object
      const newValues = { ...state.values };
      
      // Get shortcuts in the group
      const groupShortcuts = state.schema.shortcuts.filter(shortcut => shortcut.group === groupId);
      
      // Remove shortcuts in the group
      groupShortcuts.forEach(shortcut => {
        if (newValues.shortcuts[shortcut.id]) {
          delete newValues.shortcuts[shortcut.id];
        }
      });
      
      return {
        ...state,
        values: newValues,
        modified: true,
      };
    }
    
    case KeyboardShortcutActionTypes.IMPORT_SHORTCUTS:
      return {
        ...state,
        values: action.payload,
        modified: true,
      };
    
    case KeyboardShortcutActionTypes.SET_FILTER:
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

// Keyboard shortcut context
export interface KeyboardShortcutContextType {
  state: KeyboardShortcutState;
  dispatch: React.Dispatch<KeyboardShortcutAction>;
  getShortcut: (shortcutId: string) => KeyboardShortcut | undefined;
  setShortcut: (shortcutId: string, key: KeyboardKey, modifiers: KeyboardModifier[], disabled?: boolean) => void;
  resetShortcut: (shortcutId: string) => void;
  resetAllShortcuts: () => void;
  resetGroupShortcuts: (groupId: string) => void;
  saveShortcuts: () => Promise<void>;
  importShortcuts: (values: KeyboardShortcutValues) => Promise<void>;
  exportShortcuts: () => Promise<KeyboardShortcutValues>;
  setActiveScope: (scope: string | null) => void;
  startRecording: (shortcutId: string) => void;
  stopRecording: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  formatShortcut: (shortcut: KeyboardShortcut | KeyboardShortcutCombination, options?: KeyboardShortcutDisplayOptions) => string;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined);

// Keyboard shortcut provider props
export interface KeyboardShortcutProviderProps {
  children: ReactNode;
  storageKey?: string;
}

// Keyboard shortcut provider
export const KeyboardShortcutProvider: React.FC<KeyboardShortcutProviderProps> = ({
  children,
  storageKey = 'app_keyboard_shortcuts',
}) => {
  const [state, dispatch] = useReducer(keyboardShortcutReducer, initialKeyboardShortcutState);
  const keyboardShortcutService = new KeyboardShortcutService(storageKey);
  
  // Load shortcuts
  useEffect(() => {
    const loadShortcuts = async () => {
      try {
        dispatch({ type: KeyboardShortcutActionTypes.SET_LOADING, payload: true });
        
        // Load schema
        const schema = await keyboardShortcutService.loadSchema();
        dispatch({ type: KeyboardShortcutActionTypes.SET_SCHEMA, payload: schema });
        
        // Load values
        const values = await keyboardShortcutService.loadValues();
        dispatch({ type: KeyboardShortcutActionTypes.SET_VALUES, payload: values });
        
        // Set active shortcuts
        const activeShortcuts = keyboardShortcutService.getActiveShortcuts(schema, values, null);
        dispatch({ type: KeyboardShortcutActionTypes.SET_ACTIVE_SHORTCUTS, payload: activeShortcuts });
        
        dispatch({ type: KeyboardShortcutActionTypes.SET_LOADING, payload: false });
      } catch (error) {
        console.error('Failed to load keyboard shortcuts:', error);
        dispatch({ type: KeyboardShortcutActionTypes.SET_ERROR, payload: 'Failed to load keyboard shortcuts' });
        dispatch({ type: KeyboardShortcutActionTypes.SET_LOADING, payload: false });
      }
    };
    
    loadShortcuts();
  }, []);
  
  // Update active shortcuts when active scope changes
  useEffect(() => {
    const activeShortcuts = keyboardShortcutService.getActiveShortcuts(
      state.schema,
      state.values,
      state.activeScope
    );
    
    dispatch({ type: KeyboardShortcutActionTypes.SET_ACTIVE_SHORTCUTS, payload: activeShortcuts });
  }, [state.activeScope, state.schema, state.values]);
  
  // Get shortcut
  const getShortcut = (shortcutId: string): KeyboardShortcut | undefined => {
    return keyboardShortcutService.getShortcut(shortcutId, state.schema, state.values);
  };
  
  // Set shortcut
  const setShortcut = (
    shortcutId: string,
    key: KeyboardKey,
    modifiers: KeyboardModifier[],
    disabled?: boolean
  ): void => {
    dispatch({
      type: KeyboardShortcutActionTypes.SET_SHORTCUT,
      payload: { shortcutId, key, modifiers, disabled },
    });
  };
  
  // Reset shortcut
  const resetShortcut = (shortcutId: string): void => {
    dispatch({
      type: KeyboardShortcutActionTypes.RESET_SHORTCUT,
      payload: { shortcutId },
    });
  };
  
  // Reset all shortcuts
  const resetAllShortcuts = (): void => {
    dispatch({ type: KeyboardShortcutActionTypes.RESET_ALL_SHORTCUTS });
  };
  
  // Reset group shortcuts
  const resetGroupShortcuts = (groupId: string): void => {
    dispatch({
      type: KeyboardShortcutActionTypes.RESET_GROUP_SHORTCUTS,
      payload: { groupId },
    });
  };
  
  // Save shortcuts
  const saveShortcuts = async (): Promise<void> => {
    try {
      await keyboardShortcutService.saveValues(state.values);
      dispatch({ type: KeyboardShortcutActionTypes.SET_VALUES, payload: state.values });
    } catch (error) {
      console.error('Failed to save keyboard shortcuts:', error);
      dispatch({ type: KeyboardShortcutActionTypes.SET_ERROR, payload: 'Failed to save keyboard shortcuts' });
    }
  };
  
  // Import shortcuts
  const importShortcuts = async (values: KeyboardShortcutValues): Promise<void> => {
    try {
      await keyboardShortcutService.saveValues(values);
      dispatch({ type: KeyboardShortcutActionTypes.IMPORT_SHORTCUTS, payload: values });
    } catch (error) {
      console.error('Failed to import keyboard shortcuts:', error);
      dispatch({ type: KeyboardShortcutActionTypes.SET_ERROR, payload: 'Failed to import keyboard shortcuts' });
    }
  };
  
  // Export shortcuts
  const exportShortcuts = async (): Promise<KeyboardShortcutValues> => {
    try {
      return await keyboardShortcutService.loadValues();
    } catch (error) {
      console.error('Failed to export keyboard shortcuts:', error);
      dispatch({ type: KeyboardShortcutActionTypes.SET_ERROR, payload: 'Failed to export keyboard shortcuts' });
      throw error;
    }
  };
  
  // Set active scope
  const setActiveScope = (scope: string | null): void => {
    dispatch({ type: KeyboardShortcutActionTypes.SET_ACTIVE_SCOPE, payload: scope });
  };
  
  // Start recording
  const startRecording = (shortcutId: string): void => {
    dispatch({ type: KeyboardShortcutActionTypes.SET_RECORDING_SHORTCUT, payload: shortcutId });
  };
  
  // Stop recording
  const stopRecording = (): void => {
    dispatch({ type: KeyboardShortcutActionTypes.SET_RECORDING_SHORTCUT, payload: null });
  };
  
  // Handle key down
  const handleKeyDown = useCallback((event: KeyboardEvent): void => {
    // If recording, set the shortcut
    if (state.recordingShortcut) {
      // Prevent default
      event.preventDefault();
      
      // Get key and modifiers
      const key = keyboardShortcutService.normalizeKey(event.key);
      const modifiers: KeyboardModifier[] = [];
      
      if (event.ctrlKey) modifiers.push('ctrl');
      if (event.altKey) modifiers.push('alt');
      if (event.shiftKey) modifiers.push('shift');
      if (event.metaKey) modifiers.push('meta');
      
      // Ignore modifier keys
      if (['control', 'alt', 'shift', 'meta'].includes(key)) {
        return;
      }
      
      // Set the shortcut
      setShortcut(state.recordingShortcut, key as KeyboardKey, modifiers);
      
      // Stop recording
      stopRecording();
      
      return;
    }
    
    // If not recording, check if the event matches any active shortcut
    for (const shortcut of state.activeShortcuts) {
      if (keyboardShortcutService.matchKeyboardEvent(event, shortcut)) {
        // Prevent default
        event.preventDefault();
        
        // Execute the shortcut action
        shortcut.action();
        
        return;
      }
    }
  }, [state.recordingShortcut, state.activeShortcuts]);
  
  // Format shortcut
  const formatShortcut = (
    shortcut: KeyboardShortcut | KeyboardShortcutCombination,
    options?: KeyboardShortcutDisplayOptions
  ): string => {
    return keyboardShortcutService.formatShortcut(shortcut, options);
  };
  
  // Add global event listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent): void => {
      handleKeyDown(event as unknown as KeyboardEvent);
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [handleKeyDown]);
  
  return (
    <KeyboardShortcutContext.Provider
      value={{
        state,
        dispatch,
        getShortcut,
        setShortcut,
        resetShortcut,
        resetAllShortcuts,
        resetGroupShortcuts,
        saveShortcuts,
        importShortcuts,
        exportShortcuts,
        setActiveScope,
        startRecording,
        stopRecording,
        handleKeyDown,
        formatShortcut,
      }}
    >
      {children}
    </KeyboardShortcutContext.Provider>
  );
};

// Hook to use keyboard shortcut context
export const useKeyboardShortcuts = (): KeyboardShortcutContextType => {
  const context = useContext(KeyboardShortcutContext);
  
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutProvider');
  }
  
  return context;
};

export default KeyboardShortcutContext;
