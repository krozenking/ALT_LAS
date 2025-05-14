/**
 * Keyboard key
 */
export type KeyboardKey =
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm'
  | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
  | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8' | 'f9' | 'f10' | 'f11' | 'f12'
  | 'escape' | 'tab' | 'capslock' | 'shift' | 'control' | 'alt' | 'meta' | 'space'
  | 'pageup' | 'pagedown' | 'end' | 'home' | 'arrowleft' | 'arrowup' | 'arrowright' | 'arrowdown'
  | 'insert' | 'delete' | 'backspace' | 'enter' | 'return'
  | 'comma' | 'period' | 'slash' | 'backslash' | 'semicolon' | 'quote' | 'backquote'
  | 'minus' | 'equal' | 'bracketleft' | 'bracketright'
  | 'numpad0' | 'numpad1' | 'numpad2' | 'numpad3' | 'numpad4'
  | 'numpad5' | 'numpad6' | 'numpad7' | 'numpad8' | 'numpad9'
  | 'numpadmultiply' | 'numpadadd' | 'numpadsubtract' | 'numpaddivide' | 'numpaddecimal' | 'numpadenter';

/**
 * Keyboard modifier
 */
export type KeyboardModifier = 'ctrl' | 'alt' | 'shift' | 'meta';

/**
 * Keyboard shortcut
 */
export interface KeyboardShortcut {
  /**
   * Shortcut ID
   */
  id: string;
  /**
   * Shortcut key
   */
  key: KeyboardKey;
  /**
   * Shortcut modifiers
   */
  modifiers: KeyboardModifier[];
  /**
   * Shortcut description
   */
  description: string;
  /**
   * Shortcut group
   */
  group: string;
  /**
   * Shortcut action
   */
  action: () => void;
  /**
   * Whether shortcut is disabled
   */
  disabled?: boolean;
  /**
   * Whether shortcut is global
   */
  global?: boolean;
  /**
   * Shortcut scope
   */
  scope?: string;
  /**
   * Whether shortcut is default
   */
  isDefault?: boolean;
  /**
   * Whether shortcut is custom
   */
  isCustom?: boolean;
  /**
   * Whether shortcut is hidden
   */
  hidden?: boolean;
  /**
   * Shortcut order
   */
  order?: number;
  /**
   * Shortcut tags
   */
  tags?: string[];
  /**
   * Shortcut metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Keyboard shortcut group
 */
export interface KeyboardShortcutGroup {
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
   * Group order
   */
  order?: number;
  /**
   * Group disabled
   */
  disabled?: boolean;
  /**
   * Group hidden
   */
  hidden?: boolean;
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
 * Keyboard shortcut scope
 */
export interface KeyboardShortcutScope {
  /**
   * Scope ID
   */
  id: string;
  /**
   * Scope label
   */
  label: string;
  /**
   * Scope description
   */
  description?: string;
  /**
   * Scope icon
   */
  icon?: string;
  /**
   * Scope order
   */
  order?: number;
  /**
   * Scope disabled
   */
  disabled?: boolean;
  /**
   * Scope hidden
   */
  hidden?: boolean;
  /**
   * Scope tags
   */
  tags?: string[];
  /**
   * Scope metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Keyboard shortcut schema
 */
export interface KeyboardShortcutSchema {
  /**
   * Schema version
   */
  version: string;
  /**
   * Schema groups
   */
  groups: KeyboardShortcutGroup[];
  /**
   * Schema scopes
   */
  scopes: KeyboardShortcutScope[];
  /**
   * Schema shortcuts
   */
  shortcuts: KeyboardShortcut[];
}

/**
 * Keyboard shortcut values
 */
export interface KeyboardShortcutValues {
  /**
   * Values version
   */
  version: string;
  /**
   * Values shortcuts
   */
  shortcuts: Record<string, {
    key: KeyboardKey;
    modifiers: KeyboardModifier[];
    disabled?: boolean;
  }>;
}

/**
 * Keyboard shortcut state
 */
export interface KeyboardShortcutState {
  /**
   * Shortcut schema
   */
  schema: KeyboardShortcutSchema;
  /**
   * Shortcut values
   */
  values: KeyboardShortcutValues;
  /**
   * Active shortcuts
   */
  activeShortcuts: KeyboardShortcut[];
  /**
   * Active scope
   */
  activeScope: string | null;
  /**
   * Recording shortcut
   */
  recordingShortcut: string | null;
  /**
   * Loading
   */
  loading: boolean;
  /**
   * Error
   */
  error: string | null;
  /**
   * Modified
   */
  modified: boolean;
  /**
   * Filter
   */
  filter: {
    /**
     * Search term
     */
    searchTerm?: string;
    /**
     * Group
     */
    group?: string;
    /**
     * Scope
     */
    scope?: string;
    /**
     * Show disabled
     */
    showDisabled?: boolean;
    /**
     * Show hidden
     */
    showHidden?: boolean;
    /**
     * Show custom
     */
    showCustom?: boolean;
    /**
     * Show default
     */
    showDefault?: boolean;
    /**
     * Tags
     */
    tags?: string[];
  };
}

/**
 * Keyboard shortcut action types
 */
export enum KeyboardShortcutActionTypes {
  SET_SCHEMA = 'SET_SCHEMA',
  SET_VALUES = 'SET_VALUES',
  SET_ACTIVE_SHORTCUTS = 'SET_ACTIVE_SHORTCUTS',
  SET_ACTIVE_SCOPE = 'SET_ACTIVE_SCOPE',
  SET_RECORDING_SHORTCUT = 'SET_RECORDING_SHORTCUT',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_SHORTCUT = 'SET_SHORTCUT',
  RESET_SHORTCUT = 'RESET_SHORTCUT',
  RESET_ALL_SHORTCUTS = 'RESET_ALL_SHORTCUTS',
  RESET_GROUP_SHORTCUTS = 'RESET_GROUP_SHORTCUTS',
  IMPORT_SHORTCUTS = 'IMPORT_SHORTCUTS',
  SET_FILTER = 'SET_FILTER',
}

/**
 * Keyboard shortcut action
 */
export interface KeyboardShortcutAction {
  type: KeyboardShortcutActionTypes;
  payload?: any;
}

/**
 * Keyboard event
 */
export interface KeyboardEvent {
  /**
   * Event key
   */
  key: string;
  /**
   * Event code
   */
  code: string;
  /**
   * Whether ctrl key is pressed
   */
  ctrlKey: boolean;
  /**
   * Whether alt key is pressed
   */
  altKey: boolean;
  /**
   * Whether shift key is pressed
   */
  shiftKey: boolean;
  /**
   * Whether meta key is pressed
   */
  metaKey: boolean;
  /**
   * Whether event is repeated
   */
  repeat: boolean;
  /**
   * Prevent default
   */
  preventDefault: () => void;
  /**
   * Stop propagation
   */
  stopPropagation: () => void;
}

/**
 * Keyboard shortcut combination
 */
export interface KeyboardShortcutCombination {
  /**
   * Shortcut key
   */
  key: KeyboardKey;
  /**
   * Shortcut modifiers
   */
  modifiers: KeyboardModifier[];
}

/**
 * Keyboard shortcut display options
 */
export interface KeyboardShortcutDisplayOptions {
  /**
   * Separator
   */
  separator?: string;
  /**
   * Use symbols
   */
  useSymbols?: boolean;
  /**
   * Use platform specific symbols
   */
  usePlatformSpecificSymbols?: boolean;
  /**
   * Capitalize
   */
  capitalize?: boolean;
  /**
   * Uppercase
   */
  uppercase?: boolean;
}
