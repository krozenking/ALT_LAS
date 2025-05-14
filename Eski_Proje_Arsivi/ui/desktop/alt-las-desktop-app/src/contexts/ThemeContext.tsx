import React, { createContext, useState, useContext, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark' | 'glassmorphism-dark' | 'glassmorphism-light';
export type OperatingMode = 'Normal' | 'Dream' | 'Explore' | 'Chaos';

interface ThemeContextProps {
  themeMode: ThemeMode;
  operatingMode: OperatingMode;
  setThemeMode: (mode: ThemeMode) => void;
  setOperatingMode: (mode: OperatingMode) => void;
  toggleThemeMode: () => void; // Example utility
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultThemeMode?: ThemeMode;
  defaultOperatingMode?: OperatingMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  defaultThemeMode = 'glassmorphism-dark', 
  defaultOperatingMode = 'Normal' 
}) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultThemeMode);
  const [operatingMode, setOperatingModeState] = useState<OperatingMode>(defaultOperatingMode);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    // You might want to persist this to localStorage or similar
  };

  const setOperatingMode = (mode: OperatingMode) => {
    setOperatingModeState(mode);
    // Persist if needed
  };

  const toggleThemeMode = () => {
    setThemeModeState(prevMode => 
      prevMode === 'light' ? 'dark' : 
      prevMode === 'dark' ? 'glassmorphism-dark' :
      prevMode === 'glassmorphism-dark' ? 'glassmorphism-light' :
      'light'
    );
  };

  // Apply a class to the body element to reflect the current theme
  // This allows global CSS rules to target themes easily
  React.useEffect(() => {
    document.body.className = ''; // Clear previous theme classes
    document.body.classList.add(`theme-${themeMode}`);
    document.body.classList.add(`opmode-${operatingMode.toLowerCase()}`);
  }, [themeMode, operatingMode]);

  const value = useMemo(() => ({
    themeMode,
    operatingMode,
    setThemeMode,
    setOperatingMode,
    toggleThemeMode
  }), [themeMode, operatingMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

