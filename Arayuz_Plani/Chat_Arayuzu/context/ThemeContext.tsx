import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themeManager, ThemeMode, Theme } from '../services/themeManager';

// Theme context interface
interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
  theme: Theme;
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component for providing theme context to the application
 * 
 * @param children - Child components
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(themeManager.getThemeMode());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(themeManager.isDarkModeActive());
  const [theme, setTheme] = useState<Theme>(themeManager.getTheme());
  
  // Update theme state when it changes
  useEffect(() => {
    const handleThemeChange = (newTheme: Theme) => {
      setTheme(newTheme);
      setIsDarkMode(themeManager.isDarkModeActive());
      setThemeModeState(themeManager.getThemeMode());
    };
    
    themeManager.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      themeManager.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);
  
  // Set theme mode
  const setThemeMode = (mode: ThemeMode) => {
    themeManager.setThemeMode(mode);
  };
  
  // Context value
  const value: ThemeContextType = {
    themeMode,
    setThemeMode,
    isDarkMode,
    theme,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme hook for accessing theme context
 * 
 * @returns Theme context
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
