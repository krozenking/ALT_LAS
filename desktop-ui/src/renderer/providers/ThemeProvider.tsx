import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import useThemeManager, { UseThemeManagerResult } from '../hooks/useThemeManager';
import { ThemeSettings } from '../styles/themes/types';

// Create context
const ThemeContext = createContext<UseThemeManagerResult | undefined>(undefined);

export interface ThemeProviderProps {
  /**
   * Children components
   */
  children: React.ReactNode;
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
  /**
   * Reset color mode on reload
   */
  resetColorModeOnReload?: boolean;
}

/**
 * Theme provider component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  storageKey = 'alt_las_theme_settings',
  initialSettings = {},
  persistSettings = true,
  resetColorModeOnReload = false,
}) => {
  // Use theme manager hook
  const themeManager = useThemeManager({
    storageKey,
    initialSettings,
    persistSettings,
  });

  // Create theme
  const theme = useMemo(() => {
    return themeManager.createTheme();
  }, [themeManager.themeSettings]);

  return (
    <ThemeContext.Provider value={themeManager}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme} resetCSS>
        {children}
      </ChakraProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * @returns Theme context
 */
export const useThemeContext = (): UseThemeManagerResult => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
