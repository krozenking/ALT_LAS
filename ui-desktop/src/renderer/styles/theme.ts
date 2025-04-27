import { extendTheme } from '@chakra-ui/react';

// Glassmorphism effect utility
const createGlassmorphism = (opacity = 0.8, blur = 10, border = 1) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  borderRadius: '12px',
  border: `${border}px solid rgba(255, 255, 255, 0.18)`,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
});

// Dark glassmorphism effect
const createDarkGlassmorphism = (opacity = 0.7, blur = 10, border = 1) => ({
  background: `rgba(26, 32, 44, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  borderRadius: '12px',
  border: `${border}px solid rgba(26, 32, 44, 0.18)`,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
});

// Color palette
const colors = {
  primary: {
    50: '#E6F0F9',
    100: '#C2D9EF',
    200: '#9BC2E4',
    300: '#74ABD9',
    400: '#4D94CE',
    500: '#3E5C76', // Primary color
    600: '#2A3B4C', // Darker primary
    700: '#1F2D3D',
    800: '#172635',
    900: '#0F1A24',
  },
  secondary: {
    50: '#FDF8F3',
    100: '#F9EBE0',
    200: '#F3D9C3',
    300: '#ECC7A6',
    400: '#E5B589',
    500: '#C79060', // Secondary color (amber)
    600: '#A56336', // Darker secondary
    700: '#7E4A29',
    800: '#57321C',
    900: '#2F1A0E',
  },
  neutral: {
    50: '#F5F5F5',
    100: '#EBEBEB',
    200: '#D6D6D6',
    300: '#C2C2C2',
    400: '#ADADAD',
    500: '#999999',
    600: '#666666',
    700: '#333333',
    800: '#1A1A1A',
    900: '#0A0A0A',
  },
  success: {
    500: '#4CAF50',
    highContrast: '#00FF00', // Added for High Contrast
  },
  warning: {
    500: '#FF9800',
    highContrast: '#FFA500', // Added for High Contrast
  },
  error: {
    500: '#F44336',
    highContrast: '#FF0000', // Added for High Contrast
  },
  info: {
    500: '#2196F3',
    highContrast: '#00FFFF', // Added for High Contrast
  },
  text: { // Added for High Contrast
    highContrast: '#FFFFFF',
  },
  primaryHc: { // Added for High Contrast Primary
    500: '#FFFF00',
  },
  secondaryHc: { // Added for High Contrast Secondary
    500: '#00FFFF',
  },
  borderHc: { // Added for High Contrast Borders
    500: '#FFFFFF',
  },
  background: {
    light: '#F0EEE5',
    dark: '#1A202C',
    highContrast: '#000000', // Added for High Contrast
  }
};

// Typography
const typography = {
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
    '3': '.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing
const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border radius
const radii = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadows
const shadows = {
  xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  none: 'none',
  'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
};

// Component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
    },
    variants: {
      glass: (props) => ({
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'transparent',
              color: 'text.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
              _hover: {
                bg: 'secondaryHc.500',
                color: 'background.highContrast',
              },
              _active: {
                bg: 'primaryHc.500',
                color: 'background.highContrast',
              },
            }
          : props.colorMode === 'light'
            ? createGlassmorphism(0.7, 8, 1)
            : createDarkGlassmorphism(0.7, 8, 1)),
        color: props.colorMode === 'highContrast'
          ? 'text.highContrast'
          : props.colorMode === 'light' ? 'primary.600' : 'white',
        _hover: props.colorMode === 'highContrast'
          ? {
              bg: 'secondaryHc.500',
              color: 'background.highContrast',
            }
          : {
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            },
        _active: props.colorMode === 'highContrast'
          ? {
              bg: 'primaryHc.500',
              color: 'background.highContrast',
            }
          : {
              transform: 'translateY(0)',
            },
      }),
      'glass-primary': (props) => ({
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'primaryHc.500',
              color: 'background.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
              _hover: {
                bg: 'text.highContrast',
                color: 'background.highContrast',
                borderColor: 'primaryHc.500',
              },
              _active: {
                bg: 'secondaryHc.500',
                color: 'background.highContrast',
              },
            }
          : props.colorMode === 'light'
            ? createGlassmorphism(0.7, 8, 1)
            : createDarkGlassmorphism(0.7, 8, 1)),
        bg: props.colorMode === 'highContrast'
          ? 'primaryHc.500'
          : props.colorMode === 'light'
            ? 'rgba(62, 92, 118, 0.8)'
            : 'rgba(62, 92, 118, 0.6)',
        color: props.colorMode === 'highContrast'
          ? 'background.highContrast'
          : 'white',
        _hover: props.colorMode === 'highContrast'
          ? {
              bg: 'text.highContrast',
              color: 'background.highContrast',
              borderColor: 'primaryHc.500',
            }
          : {
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: props.colorMode === 'light'
                ? 'rgba(62, 92, 118, 0.9)'
                : 'rgba(62, 92, 118, 0.7)',
            },
        _active: props.colorMode === 'highContrast'
          ? {
              bg: 'secondaryHc.500',
              color: 'background.highContrast',
            }
          : {
              transform: 'translateY(0)',
            },
      }),
      'glass-secondary': (props) => ({
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'secondaryHc.500',
              color: 'background.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
              _hover: {
                bg: 'text.highContrast',
                color: 'background.highContrast',
                borderColor: 'secondaryHc.500',
              },
              _active: {
                bg: 'primaryHc.500',
                color: 'background.highContrast',
              },
            }
          : props.colorMode === 'light'
            ? createGlassmorphism(0.7, 8, 1)
            : createDarkGlassmorphism(0.7, 8, 1)),
        bg: props.colorMode === 'highContrast'
          ? 'secondaryHc.500'
          : props.colorMode === 'light'
            ? 'rgba(199, 144, 96, 0.8)'
            : 'rgba(199, 144, 96, 0.6)',
        color: props.colorMode === 'highContrast'
          ? 'background.highContrast'
          : 'white',
        _hover: props.colorMode === 'highContrast'
          ? {
              bg: 'text.highContrast',
              color: 'background.highContrast',
              borderColor: 'secondaryHc.500',
            }
          : {
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: props.colorMode === 'light'
                ? 'rgba(199, 144, 96, 0.9)'
                : 'rgba(199, 144, 96, 0.7)',
            },
        _active: props.colorMode === 'highContrast'
          ? {
              bg: 'primaryHc.500',
              color: 'background.highContrast',
            }
          : {
              transform: 'translateY(0)',
            },
      }),
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: props.colorMode === 'highContrast'
        ? {
            bg: 'background.highContrast',
            color: 'text.highContrast',
            border: '1px solid',
            borderColor: 'borderHc.500',
            borderRadius: 'lg', // Keep consistent radius or remove for sharper contrast
          }
        : props.colorMode === 'light'
          ? createGlassmorphism(0.7, 10, 1)
          : createDarkGlassmorphism(0.7, 10, 1),
      body: {
        padding: '6',
      },
      header: {
        padding: '6',
        // Add high contrast border if header exists and needs separation
        borderBottom: props.colorMode === 'highContrast' ? '1px solid' : 'none',
        borderColor: props.colorMode === 'highContrast' ? 'borderHc.500' : 'transparent',
      },
      footer: {
        padding: '6',
        // Add high contrast border if footer exists and needs separation
        borderTop: props.colorMode === 'highContrast' ? '1px solid' : 'none',
        borderColor: props.colorMode === 'highContrast' ? 'borderHc.500' : 'transparent',
      },
    }),
  },
  Panel: {
    baseStyle: (props) => ({
      container: {
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'background.highContrast',
              color: 'text.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
              borderRadius: 'lg', // Keep consistent radius or remove for sharper contrast
            }
          : props.colorMode === 'light'
            ? createGlassmorphism(0.75, 15, 1)
            : createDarkGlassmorphism(0.75, 15, 1)),
        padding: '4',
        transition: 'all 0.2s ease-in-out',
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2',
        borderBottom: '1px solid',
        borderColor: props.colorMode === 'highContrast'
          ? 'borderHc.500'
          : props.colorMode === 'light'
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(255, 255, 255, 0.1)',
        cursor: 'grab',
        userSelect: 'none',
        // Ensure header text is high contrast
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
      },
      body: {
        padding: '4',
        height: '100%',
        overflow: 'auto',
        // Ensure body text is high contrast
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
      },
    }),
  },
};

// Global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'highContrast' 
        ? 'background.highContrast' 
        : props.colorMode === 'light' 
          ? 'background.light' 
          : 'background.dark',
      color: props.colorMode === 'highContrast' 
        ? 'text.highContrast' 
        : props.colorMode === 'light' 
          ? 'neutral.800' 
          : 'neutral.100',
      transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out', // Added color transition
    },
  }),
};

// Theme config
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: true,
};

// Export theme
export const theme = extendTheme({
  colors,
  ...typography,
  space,
  radii,
  shadows,
  components,
  styles,
  config,
});

// Export glassmorphism utilities
export const glassmorphism = {
  create: createGlassmorphism,
  createDark: createDarkGlassmorphism,
};
