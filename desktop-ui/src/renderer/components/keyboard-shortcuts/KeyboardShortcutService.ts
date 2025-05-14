import {
  KeyboardShortcut,
  KeyboardShortcutSchema,
  KeyboardShortcutValues,
  KeyboardKey,
  KeyboardModifier,
  KeyboardEvent,
  KeyboardShortcutCombination,
  KeyboardShortcutDisplayOptions,
} from './types';

/**
 * Keyboard shortcut service
 */
class KeyboardShortcutService {
  /**
   * Storage key
   */
  private readonly storageKey: string;
  
  /**
   * Constructor
   * @param storageKey Storage key
   */
  constructor(storageKey: string = 'app_keyboard_shortcuts') {
    this.storageKey = storageKey;
  }
  
  /**
   * Load shortcut schema
   * @returns Shortcut schema
   */
  async loadSchema(): Promise<KeyboardShortcutSchema> {
    try {
      // In a real application, this might be loaded from a server or a local file
      // For this demo, we'll use a hardcoded schema
      const schema: KeyboardShortcutSchema = {
        version: '1.0.0',
        groups: [
          {
            id: 'general',
            label: 'General',
            icon: '⚙️',
            order: 1,
          },
          {
            id: 'navigation',
            label: 'Navigation',
            icon: '🧭',
            order: 2,
          },
          {
            id: 'editing',
            label: 'Editing',
            icon: '✏️',
            order: 3,
          },
          {
            id: 'view',
            label: 'View',
            icon: '👁️',
            order: 4,
          },
          {
            id: 'tools',
            label: 'Tools',
            icon: '🔧',
            order: 5,
          },
          {
            id: 'help',
            label: 'Help',
            icon: '❓',
            order: 6,
          },
        ],
        scopes: [
          {
            id: 'global',
            label: 'Global',
            icon: '🌐',
            order: 1,
          },
          {
            id: 'editor',
            label: 'Editor',
            icon: '📝',
            order: 2,
          },
          {
            id: 'fileManager',
            label: 'File Manager',
            icon: '📁',
            order: 3,
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            order: 4,
          },
        ],
        shortcuts: [
          // General shortcuts
          {
            id: 'newFile',
            key: 'n',
            modifiers: ['ctrl'],
            description: 'Create a new file',
            group: 'general',
            action: () => console.log('New file'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'openFile',
            key: 'o',
            modifiers: ['ctrl'],
            description: 'Open a file',
            group: 'general',
            action: () => console.log('Open file'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'saveFile',
            key: 's',
            modifiers: ['ctrl'],
            description: 'Save the current file',
            group: 'general',
            action: () => console.log('Save file'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'saveFileAs',
            key: 's',
            modifiers: ['ctrl', 'shift'],
            description: 'Save the current file as',
            group: 'general',
            action: () => console.log('Save file as'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'closeFile',
            key: 'w',
            modifiers: ['ctrl'],
            description: 'Close the current file',
            group: 'general',
            action: () => console.log('Close file'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'exit',
            key: 'q',
            modifiers: ['ctrl'],
            description: 'Exit the application',
            group: 'general',
            action: () => console.log('Exit'),
            scope: 'global',
            isDefault: true,
          },
          
          // Navigation shortcuts
          {
            id: 'goToLine',
            key: 'g',
            modifiers: ['ctrl'],
            description: 'Go to line',
            group: 'navigation',
            action: () => console.log('Go to line'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'goToFile',
            key: 'p',
            modifiers: ['ctrl'],
            description: 'Go to file',
            group: 'navigation',
            action: () => console.log('Go to file'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'goToSymbol',
            key: 'o',
            modifiers: ['ctrl', 'shift'],
            description: 'Go to symbol',
            group: 'navigation',
            action: () => console.log('Go to symbol'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'goBack',
            key: 'arrowleft',
            modifiers: ['alt'],
            description: 'Go back',
            group: 'navigation',
            action: () => console.log('Go back'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'goForward',
            key: 'arrowright',
            modifiers: ['alt'],
            description: 'Go forward',
            group: 'navigation',
            action: () => console.log('Go forward'),
            scope: 'global',
            isDefault: true,
          },
          
          // Editing shortcuts
          {
            id: 'undo',
            key: 'z',
            modifiers: ['ctrl'],
            description: 'Undo',
            group: 'editing',
            action: () => console.log('Undo'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'redo',
            key: 'y',
            modifiers: ['ctrl'],
            description: 'Redo',
            group: 'editing',
            action: () => console.log('Redo'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'cut',
            key: 'x',
            modifiers: ['ctrl'],
            description: 'Cut',
            group: 'editing',
            action: () => console.log('Cut'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'copy',
            key: 'c',
            modifiers: ['ctrl'],
            description: 'Copy',
            group: 'editing',
            action: () => console.log('Copy'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'paste',
            key: 'v',
            modifiers: ['ctrl'],
            description: 'Paste',
            group: 'editing',
            action: () => console.log('Paste'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'selectAll',
            key: 'a',
            modifiers: ['ctrl'],
            description: 'Select all',
            group: 'editing',
            action: () => console.log('Select all'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'find',
            key: 'f',
            modifiers: ['ctrl'],
            description: 'Find',
            group: 'editing',
            action: () => console.log('Find'),
            scope: 'editor',
            isDefault: true,
          },
          {
            id: 'replace',
            key: 'h',
            modifiers: ['ctrl'],
            description: 'Replace',
            group: 'editing',
            action: () => console.log('Replace'),
            scope: 'editor',
            isDefault: true,
          },
          
          // View shortcuts
          {
            id: 'toggleSidebar',
            key: 'b',
            modifiers: ['ctrl'],
            description: 'Toggle sidebar',
            group: 'view',
            action: () => console.log('Toggle sidebar'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'toggleTerminal',
            key: 'backquote',
            modifiers: ['ctrl'],
            description: 'Toggle terminal',
            group: 'view',
            action: () => console.log('Toggle terminal'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'toggleFullScreen',
            key: 'f11',
            modifiers: [],
            description: 'Toggle full screen',
            group: 'view',
            action: () => console.log('Toggle full screen'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'zoomIn',
            key: 'equal',
            modifiers: ['ctrl'],
            description: 'Zoom in',
            group: 'view',
            action: () => console.log('Zoom in'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'zoomOut',
            key: 'minus',
            modifiers: ['ctrl'],
            description: 'Zoom out',
            group: 'view',
            action: () => console.log('Zoom out'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'resetZoom',
            key: '0',
            modifiers: ['ctrl'],
            description: 'Reset zoom',
            group: 'view',
            action: () => console.log('Reset zoom'),
            scope: 'global',
            isDefault: true,
          },
          
          // Tools shortcuts
          {
            id: 'openSettings',
            key: 'comma',
            modifiers: ['ctrl'],
            description: 'Open settings',
            group: 'tools',
            action: () => console.log('Open settings'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'openKeyboardShortcuts',
            key: 'k',
            modifiers: ['ctrl', 'shift'],
            description: 'Open keyboard shortcuts',
            group: 'tools',
            action: () => console.log('Open keyboard shortcuts'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'openExtensions',
            key: 'x',
            modifiers: ['ctrl', 'shift'],
            description: 'Open extensions',
            group: 'tools',
            action: () => console.log('Open extensions'),
            scope: 'global',
            isDefault: true,
          },
          
          // Help shortcuts
          {
            id: 'openDocumentation',
            key: 'f1',
            modifiers: [],
            description: 'Open documentation',
            group: 'help',
            action: () => console.log('Open documentation'),
            scope: 'global',
            isDefault: true,
          },
          {
            id: 'openAbout',
            key: 'f1',
            modifiers: ['shift'],
            description: 'Open about',
            group: 'help',
            action: () => console.log('Open about'),
            scope: 'global',
            isDefault: true,
          },
        ],
      };
      
      return schema;
    } catch (error) {
      console.error('Failed to load keyboard shortcut schema:', error);
      throw error;
    }
  }
  
  /**
   * Load shortcut values
   * @returns Shortcut values
   */
  async loadValues(): Promise<KeyboardShortcutValues> {
    try {
      const storedValues = localStorage.getItem(this.storageKey);
      
      if (storedValues) {
        return JSON.parse(storedValues) as KeyboardShortcutValues;
      }
      
      // Return default values
      return {
        version: '1.0.0',
        shortcuts: {},
      };
    } catch (error) {
      console.error('Failed to load keyboard shortcut values:', error);
      throw error;
    }
  }
  
  /**
   * Save shortcut values
   * @param values Shortcut values
   */
  async saveValues(values: KeyboardShortcutValues): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(values));
    } catch (error) {
      console.error('Failed to save keyboard shortcut values:', error);
      throw error;
    }
  }
  
  /**
   * Get shortcut
   * @param shortcutId Shortcut ID
   * @param schema Shortcut schema
   * @param values Shortcut values
   * @returns Shortcut
   */
  getShortcut(
    shortcutId: string,
    schema: KeyboardShortcutSchema,
    values: KeyboardShortcutValues
  ): KeyboardShortcut | undefined {
    // Find shortcut in schema
    const shortcutSchema = schema.shortcuts.find(shortcut => shortcut.id === shortcutId);
    
    if (!shortcutSchema) {
      return undefined;
    }
    
    // Get custom shortcut values
    const customShortcut = values.shortcuts[shortcutId];
    
    // Return shortcut with custom values if available
    return {
      ...shortcutSchema,
      key: customShortcut?.key || shortcutSchema.key,
      modifiers: customShortcut?.modifiers || shortcutSchema.modifiers,
      disabled: customShortcut?.disabled || shortcutSchema.disabled,
      isCustom: !!customShortcut,
    };
  }
  
  /**
   * Get active shortcuts
   * @param schema Shortcut schema
   * @param values Shortcut values
   * @param scope Active scope
   * @returns Active shortcuts
   */
  getActiveShortcuts(
    schema: KeyboardShortcutSchema,
    values: KeyboardShortcutValues,
    scope: string | null
  ): KeyboardShortcut[] {
    return schema.shortcuts
      .filter(shortcut => {
        // Filter by scope
        if (scope && shortcut.scope !== scope && shortcut.scope !== 'global') {
          return false;
        }
        
        // Get custom shortcut values
        const customShortcut = values.shortcuts[shortcut.id];
        
        // Check if shortcut is disabled
        if (customShortcut?.disabled || shortcut.disabled) {
          return false;
        }
        
        return true;
      })
      .map(shortcut => {
        // Get custom shortcut values
        const customShortcut = values.shortcuts[shortcut.id];
        
        // Return shortcut with custom values if available
        return {
          ...shortcut,
          key: customShortcut?.key || shortcut.key,
          modifiers: customShortcut?.modifiers || shortcut.modifiers,
          isCustom: !!customShortcut,
        };
      });
  }
  
  /**
   * Match keyboard event
   * @param event Keyboard event
   * @param shortcut Keyboard shortcut
   * @returns Whether event matches shortcut
   */
  matchKeyboardEvent(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    // Get key from event
    const key = this.normalizeKey(event.key);
    
    // Check if key matches
    if (key !== shortcut.key) {
      return false;
    }
    
    // Check if modifiers match
    const eventModifiers: KeyboardModifier[] = [];
    
    if (event.ctrlKey) eventModifiers.push('ctrl');
    if (event.altKey) eventModifiers.push('alt');
    if (event.shiftKey) eventModifiers.push('shift');
    if (event.metaKey) eventModifiers.push('meta');
    
    // Check if modifiers match
    if (eventModifiers.length !== shortcut.modifiers.length) {
      return false;
    }
    
    // Check if all modifiers are present
    return shortcut.modifiers.every(modifier => eventModifiers.includes(modifier));
  }
  
  /**
   * Normalize key
   * @param key Key
   * @returns Normalized key
   */
  normalizeKey(key: string): KeyboardKey {
    // Convert key to lowercase
    key = key.toLowerCase();
    
    // Map special keys
    switch (key) {
      case 'control':
        return 'control';
      case 'shift':
        return 'shift';
      case 'alt':
        return 'alt';
      case 'meta':
      case 'command':
      case 'cmd':
      case 'super':
      case 'win':
      case 'windows':
        return 'meta';
      case 'escape':
      case 'esc':
        return 'escape';
      case 'enter':
      case 'return':
        return 'enter';
      case ' ':
      case 'spacebar':
        return 'space';
      case 'arrowup':
      case 'up':
        return 'arrowup';
      case 'arrowdown':
      case 'down':
        return 'arrowdown';
      case 'arrowleft':
      case 'left':
        return 'arrowleft';
      case 'arrowright':
      case 'right':
        return 'arrowright';
      case 'pageup':
      case 'pgup':
        return 'pageup';
      case 'pagedown':
      case 'pgdown':
        return 'pagedown';
      case 'backspace':
      case 'back':
        return 'backspace';
      case 'delete':
      case 'del':
        return 'delete';
      case 'insert':
      case 'ins':
        return 'insert';
      case 'home':
        return 'home';
      case 'end':
        return 'end';
      case 'tab':
        return 'tab';
      case 'capslock':
      case 'caps':
        return 'capslock';
      case 'numlock':
      case 'num':
        return 'numlock';
      case 'scrolllock':
      case 'scroll':
        return 'scrolllock';
      case 'pause':
      case 'break':
        return 'pause';
      case 'printscreen':
      case 'prtscn':
        return 'printscreen';
      case 'contextmenu':
      case 'menu':
        return 'contextmenu';
      case 'f1':
      case 'f2':
      case 'f3':
      case 'f4':
      case 'f5':
      case 'f6':
      case 'f7':
      case 'f8':
      case 'f9':
      case 'f10':
      case 'f11':
      case 'f12':
        return key as KeyboardKey;
      default:
        return key as KeyboardKey;
    }
  }
  
  /**
   * Format shortcut
   * @param shortcut Shortcut
   * @param options Display options
   * @returns Formatted shortcut
   */
  formatShortcut(
    shortcut: KeyboardShortcut | KeyboardShortcutCombination,
    options: KeyboardShortcutDisplayOptions = {}
  ): string {
    const {
      separator = '+',
      useSymbols = true,
      usePlatformSpecificSymbols = true,
      capitalize = false,
      uppercase = false,
    } = options;
    
    // Get modifiers and key
    const { modifiers, key } = shortcut;
    
    // Format modifiers
    const formattedModifiers = modifiers.map(modifier => {
      if (useSymbols) {
        if (usePlatformSpecificSymbols) {
          // Use platform specific symbols
          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          
          if (isMac) {
            switch (modifier) {
              case 'ctrl':
                return '⌃';
              case 'alt':
                return '⌥';
              case 'shift':
                return '⇧';
              case 'meta':
                return '⌘';
              default:
                return modifier;
            }
          } else {
            switch (modifier) {
              case 'ctrl':
                return 'Ctrl';
              case 'alt':
                return 'Alt';
              case 'shift':
                return 'Shift';
              case 'meta':
                return 'Win';
              default:
                return modifier;
            }
          }
        } else {
          // Use generic symbols
          switch (modifier) {
            case 'ctrl':
              return 'Ctrl';
            case 'alt':
              return 'Alt';
            case 'shift':
              return 'Shift';
            case 'meta':
              return 'Meta';
            default:
              return modifier;
          }
        }
      } else {
        // Use text
        return capitalize
          ? modifier.charAt(0).toUpperCase() + modifier.slice(1)
          : uppercase
            ? modifier.toUpperCase()
            : modifier;
      }
    });
    
    // Format key
    let formattedKey = key;
    
    if (useSymbols) {
      switch (key) {
        case 'arrowup':
          formattedKey = '↑';
          break;
        case 'arrowdown':
          formattedKey = '↓';
          break;
        case 'arrowleft':
          formattedKey = '←';
          break;
        case 'arrowright':
          formattedKey = '→';
          break;
        case 'enter':
          formattedKey = '↵';
          break;
        case 'space':
          formattedKey = 'Space';
          break;
        case 'backspace':
          formattedKey = '⌫';
          break;
        case 'delete':
          formattedKey = '⌦';
          break;
        case 'escape':
          formattedKey = 'Esc';
          break;
        case 'tab':
          formattedKey = '⇥';
          break;
        case 'capslock':
          formattedKey = '⇪';
          break;
        case 'home':
          formattedKey = '⇱';
          break;
        case 'end':
          formattedKey = '⇲';
          break;
        case 'pageup':
          formattedKey = '⇞';
          break;
        case 'pagedown':
          formattedKey = '⇟';
          break;
        default:
          formattedKey = capitalize
            ? key.charAt(0).toUpperCase() + key.slice(1)
            : uppercase
              ? key.toUpperCase()
              : key;
      }
    } else {
      formattedKey = capitalize
        ? key.charAt(0).toUpperCase() + key.slice(1)
        : uppercase
          ? key.toUpperCase()
          : key;
    }
    
    // Join modifiers and key
    return [...formattedModifiers, formattedKey].join(separator);
  }
}

export default KeyboardShortcutService;
