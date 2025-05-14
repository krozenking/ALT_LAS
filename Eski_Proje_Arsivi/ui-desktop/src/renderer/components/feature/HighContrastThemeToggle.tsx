import React, { useState, useEffect } from 'react';
import { Box, useColorMode, useToken } from '@chakra-ui/react';
import { Button } from '@/components/core/Button';

// High contrast theme styles
const getHighContrastStyles = (colorMode: string) => {
  return {
    background: colorMode === 'light' ? '#ffffff' : '#000000',
    text: colorMode === 'light' ? '#000000' : '#ffffff',
    primary: colorMode === 'light' ? '#0000cc' : '#ffff00',
    secondary: colorMode === 'light' ? '#990000' : '#00ffff',
    border: colorMode === 'light' ? '#000000' : '#ffffff',
    focus: colorMode === 'light' ? '#0000ff' : '#ffff00',
    error: colorMode === 'light' ? '#cc0000' : '#ff6666',
    success: colorMode === 'light' ? '#006600' : '#66ff66',
  };
};

// Regular theme styles for comparison
const getRegularStyles = (colorMode: string, colors: any) => {
  return {
    background: colorMode === 'light' ? colors.white : colors.gray[800],
    text: colorMode === 'light' ? colors.gray[800] : colors.gray[100],
    primary: colorMode === 'light' ? colors.primary[500] : colors.primary[300],
    secondary: colorMode === 'light' ? colors.secondary[500] : colors.secondary[300],
    border: colorMode === 'light' ? colors.gray[200] : colors.gray[600],
    focus: colorMode === 'light' ? colors.blue[500] : colors.blue[300],
    error: colorMode === 'light' ? colors.red[500] : colors.red[300],
    success: colorMode === 'light' ? colors.green[500] : colors.green[300],
  };
};

export const HighContrastThemeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [systemPreference, setSystemPreference] = useState(false);
  
  // Get color tokens for comparison
  const colors = {
    white: useToken('colors', 'white'),
    gray: {
      100: useToken('colors', 'gray.100'),
      200: useToken('colors', 'gray.200'),
      600: useToken('colors', 'gray.600'),
      800: useToken('colors', 'gray.800'),
    },
    primary: {
      300: useToken('colors', 'primary.300'),
      500: useToken('colors', 'primary.500'),
    },
    secondary: {
      300: useToken('colors', 'secondary.300'),
      500: useToken('colors', 'secondary.500'),
    },
    blue: {
      300: useToken('colors', 'blue.300'),
      500: useToken('colors', 'blue.500'),
    },
    red: {
      300: useToken('colors', 'red.300'),
      500: useToken('colors', 'red.500'),
    },
    green: {
      300: useToken('colors', 'green.300'),
      500: useToken('colors', 'green.500'),
    },
  };

  // Detect system high contrast preference
  useEffect(() => {
    // Check if the browser supports the high contrast media query
    const highContrastQuery = window.matchMedia('(forced-colors: active)');
    
    // Set initial value
    setSystemPreference(highContrastQuery.matches);
    
    // Add listener for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches);
      // Automatically enable high contrast mode if system preference changes to high contrast
      if (e.matches) {
        setIsHighContrast(true);
      }
    };
    
    // Modern browsers
    if (typeof highContrastQuery.addEventListener === 'function') {
      highContrastQuery.addEventListener('change', handleChange);
      return () => highContrastQuery.removeEventListener('change', handleChange);
    }
    
    // Older browsers
    highContrastQuery.addListener(handleChange);
    return () => highContrastQuery.removeListener(handleChange);
  }, []);

  // Apply high contrast theme
  useEffect(() => {
    const root = document.documentElement;
    
    // Get appropriate styles based on current mode
    const styles = isHighContrast 
      ? getHighContrastStyles(colorMode)
      : getRegularStyles(colorMode, colors);
    
    // Apply styles to CSS variables
    Object.entries(styles).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value as string);
    });
    
    // Set data attribute for CSS selectors
    root.setAttribute('data-high-contrast', isHighContrast ? 'true' : 'false');
    
    // Announce theme change to screen readers
    const announcement = document.getElementById('theme-announcement');
    if (announcement) {
      announcement.textContent = `${isHighContrast ? 'High contrast' : 'Standard contrast'} theme ${isHighContrast && systemPreference ? '(matching system preference)' : ''} is now active`;
    }
  }, [isHighContrast, colorMode, colors]);

  return (
    <Box>
      {/* Visually hidden announcement for screen readers */}
      <div 
        id="theme-announcement" 
        role="status" 
        aria-live="polite" 
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          padding: '0', 
          margin: '-1px', 
          overflow: 'hidden', 
          clip: 'rect(0, 0, 0, 0)', 
          whiteSpace: 'nowrap', 
          borderWidth: '0' 
        }}
      />
      
      <Button
        variant={isHighContrast ? 'solid' : 'glass'}
        onClick={() => setIsHighContrast(!isHighContrast)}
        aria-pressed={isHighContrast}
        aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
      >
        {isHighContrast ? 'Standard Contrast' : 'High Contrast'}
      </Button>
      
      {systemPreference && (
        <Box 
          mt={2} 
          fontSize="sm" 
          fontWeight="medium"
          color={isHighContrast ? 'var(--theme-text)' : undefined}
        >
          System high contrast detected
        </Box>
      )}
    </Box>
  );
};

export default HighContrastThemeToggle;
