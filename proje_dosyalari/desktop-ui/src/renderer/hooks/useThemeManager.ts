import { useState, useEffect, useCallback } from 'react';
import { useColorMode, useTheme, Theme } from '@chakra-ui/react';
import { createThemeFromSettings } from '../styles/themes/creator';
import { 
  ThemeSettings, 
  ThemeType, 
  ThemeVariant, 
  DEFAULT_THEME_SETTINGS,
  THEME_VARIANT_SETTINGS,
  THEME_TYPE_SETTINGS,
} from '../styles/themes/types';

/**
 * Theme manager hook result
 */
export interface UseThemeManagerResult {
  /**
   * Current theme settings
   */
  themeSettings: ThemeSettings;
  /**
   * Update theme settings
   */
  updateThemeSettings: (settings: Partial<ThemeSettings>) => void;
  /**
   * Reset theme settings to defaults
   */
  resetThemeSettings: () => void;
  /**
   * Set theme type
   */
  setThemeType: (type: ThemeType) => void;
  /**
   * Set theme variant
   */
  setThemeVariant: (variant: ThemeVariant) => void;
  /**
   * Toggle color mode
   */
  toggleColorMode: () => void;
  /**
   * Current color mode
   */
  colorMode: 'light' | 'dark';
  /**
   * Current theme
   */
  theme: Theme;
  /**
   * Available theme types
   */
  availableThemeTypes: ThemeType[];
  /**
   * Available theme variants
   */
  availableThemeVariants: ThemeVariant[];
  /**
   * Export theme settings
   */
  exportThemeSettings: () => string;
  /**
   * Import theme settings
   */
  importThemeSettings: (json: string) => boolean;
  /**
   * Create theme from settings
   */
  createTheme: (settings?: Partial<ThemeSettings>) => Theme;
}

/**
 * Theme manager hook options
 */
export interface UseThemeManagerOptions {
  /**
   * Storage key
   */
  storageKey?: string;
  /**
   * Initial settings
   */
  initialSettings?: Partial<ThemeSettings>;
  /**
   * Whether to persist settings
   */
  persistSettings?: boolean;
}

/**
 * Available theme types
 */
export const AVAILABLE_THEME_TYPES: ThemeType[] = ['light', 'dark', 'system', 'custom'];

/**
 * Available theme variants
 */
export const AVAILABLE_THEME_VARIANTS: ThemeVariant[] = [
  'default',
  'blue',
  'green',
  'purple',
  'orange',
  'red',
  'teal',
  'gray',
  'custom',
];

/**
 * Theme manager hook
 * @param options Hook options
 * @returns Theme manager hook result
 */
export const useThemeManager = (
  options: UseThemeManagerOptions = {}
): UseThemeManagerResult => {
  const { 
    storageKey = 'alt_las_theme_settings',
    initialSettings = {},
    persistSettings = true,
  } = options;

  const { colorMode, toggleColorMode, setColorMode } = useColorMode();
  const theme = useTheme();

  // Load settings from storage or use defaults
  const loadSettings = useCallback((): ThemeSettings => {
    if (persistSettings) {
      try {
        const storedSettings = localStorage.getItem(storageKey);
        if (storedSettings) {
          return {
            ...DEFAULT_THEME_SETTINGS,
            ...JSON.parse(storedSettings),
          };
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    }

    return {
      ...DEFAULT_THEME_SETTINGS,
      ...initialSettings,
    };
  }, [storageKey, persistSettings, initialSettings]);

  // State for theme settings
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(loadSettings);

  // Save settings to storage
  const saveSettings = useCallback(
    (settings: ThemeSettings) => {
      if (persistSettings) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(settings));
        } catch (error) {
          console.error('Failed to save theme settings:', error);
        }
      }
    },
    [storageKey, persistSettings]
  );

  // Update theme settings
  const updateThemeSettings = useCallback(
    (settings: Partial<ThemeSettings>) => {
      const newSettings = {
        ...themeSettings,
        ...settings,
      };
      setThemeSettings(newSettings);
      saveSettings(newSettings);

      // Update color mode if theme type changed
      if (settings.type && settings.type !== themeSettings.type) {
        if (settings.type === 'light' || settings.type === 'dark') {
          setColorMode(settings.type);
        } else if (settings.type === 'system') {
          // Reset to system preference
          const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          setColorMode(systemPreference);
        }
      }
    },
    [themeSettings, saveSettings, setColorMode]
  );

  // Reset theme settings to defaults
  const resetThemeSettings = useCallback(() => {
    setThemeSettings(DEFAULT_THEME_SETTINGS);
    saveSettings(DEFAULT_THEME_SETTINGS);
    
    // Reset color mode
    if (DEFAULT_THEME_SETTINGS.type === 'light' || DEFAULT_THEME_SETTINGS.type === 'dark') {
      setColorMode(DEFAULT_THEME_SETTINGS.type);
    } else if (DEFAULT_THEME_SETTINGS.type === 'system') {
      // Reset to system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      setColorMode(systemPreference);
    }
  }, [saveSettings, setColorMode]);

  // Set theme type
  const setThemeType = useCallback(
    (type: ThemeType) => {
      updateThemeSettings({ type });
    },
    [updateThemeSettings]
  );

  // Set theme variant
  const setThemeVariant = useCallback(
    (variant: ThemeVariant) => {
      updateThemeSettings({ variant });
    },
    [updateThemeSettings]
  );

  // Export theme settings
  const exportThemeSettings = useCallback((): string => {
    return JSON.stringify(themeSettings, null, 2);
  }, [themeSettings]);

  // Import theme settings
  const importThemeSettings = useCallback(
    (json: string): boolean => {
      try {
        const settings = JSON.parse(json);
        updateThemeSettings(settings);
        return true;
      } catch (error) {
        console.error('Failed to import theme settings:', error);
        return false;
      }
    },
    [updateThemeSettings]
  );

  // Create theme from settings
  const createTheme = useCallback(
    (settings?: Partial<ThemeSettings>): Theme => {
      return createThemeFromSettings({
        ...themeSettings,
        ...settings,
      });
    },
    [themeSettings]
  );

  // Sync with system color scheme changes
  useEffect(() => {
    if (themeSettings.type === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setColorMode(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }, [themeSettings.type, setColorMode]);

  // Load settings on mount
  useEffect(() => {
    setThemeSettings(loadSettings());
  }, [loadSettings]);

  return {
    themeSettings,
    updateThemeSettings,
    resetThemeSettings,
    setThemeType,
    setThemeVariant,
    toggleColorMode,
    colorMode,
    theme,
    availableThemeTypes: AVAILABLE_THEME_TYPES,
    availableThemeVariants: AVAILABLE_THEME_VARIANTS,
    exportThemeSettings,
    importThemeSettings,
    createTheme,
  };
};

export default useThemeManager;
