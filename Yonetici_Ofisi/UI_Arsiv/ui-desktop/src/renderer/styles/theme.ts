import { extendTheme, ThemeConfig, ThemeOverride } from '@chakra-ui/react';

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

// High contrast glassmorphism effect
const createHighContrastGlassmorphism = (opacity = 0.9, blur = 5, border = 2) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  borderRadius: '12px',
  border: `${border}px solid rgba(0, 0, 0, 0.8)`,
  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)'
});

// High contrast dark glassmorphism effect
const createHighContrastDarkGlassmorphism = (opacity = 0.9, blur = 5, border = 2) => ({
  background: `rgba(0, 0, 0, ${opacity})`,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  borderRadius: '12px',
  border: `${border}px solid rgba(255, 255, 255, 0.8)`,
  boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.4)'
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
    highContrast: '#00FF00', // High Contrast Green
  },
  warning: {
    500: '#FF9800',
    highContrast: '#FFA500', // High Contrast Orange
  },
  error: {
    500: '#F44336',
    highContrast: '#FF0000', // High Contrast Red
  },
  info: {
    500: '#2196F3',
    highContrast: '#00FFFF', // High Contrast Cyan
  },
  text: {
    highContrast: '#FFFFFF', // High Contrast White Text
  },
  primaryHc: { // High Contrast Primary (Yellow)
    500: '#FFFF00',
  },
  secondaryHc: { // High Contrast Secondary (Cyan)
    500: '#00FFFF',
  },
  borderHc: { // High Contrast Borders (White)
    500: '#FFFFFF',
  },
  background: {
    light: '#F0EEE5',
    dark: '#1A202C',
<<<<<<< HEAD
    highContrastLight: '#FFFFFF',
    highContrastDark: '#000000',
  },
  // High contrast colors
  highContrast: {
    light: {
      text: '#000000',
      background: '#FFFFFF',
      primary: '#000080', // Navy blue
      secondary: '#800000', // Maroon
      border: '#000000',
      focus: '#FF8000', // Orange
      link: '#0000FF', // Blue
      visited: '#800080', // Purple
      success: '#008000', // Green
      error: '#FF0000', // Red
      warning: '#FF8000', // Orange
      info: '#0000FF', // Blue
    },
    dark: {
      text: '#FFFFFF',
      background: '#000000',
      primary: '#00FFFF', // Cyan
      secondary: '#FFFF00', // Yellow
      border: '#FFFFFF',
      focus: '#FF8000', // Orange
      link: '#00FFFF', // Cyan
      visited: '#FF00FF', // Magenta
      success: '#00FF00', // Green
      error: '#FF0000', // Red
      warning: '#FFFF00', // Yellow
      info: '#00FFFF', // Cyan
    }
=======
    highContrast: '#000000', // High Contrast Black Background
>>>>>>> main
  }
};

// Typography
const typography = {
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  // ... other typography settings remain the same
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
  // Use high contrast outline for focus
  outline: `0 0 0 3px ${colors.primaryHc[500]}`, // Yellow outline
  inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  none: 'none',
  'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.25)',
<<<<<<< HEAD
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  'high-contrast-focus': '0 0 0 4px rgba(255, 128, 0, 0.8)', // Orange focus ring for high contrast
=======
  // Remove glass shadows in high contrast
  glass: 'none',
  'glass-dark': 'none',
>>>>>>> main
};

// Component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
      _focus: {
        boxShadow: 'outline', // Use high contrast outline
        zIndex: 1,
      },
    },
    variants: {
      glass: (props) => ({
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'transparent',
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
      // Add solid and outline variants for high contrast
      solid: (props) => ({
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
          : {
              bg: 'primary.500',
              color: 'white',
              _hover: { bg: 'primary.600' },
              _active: { bg: 'primary.700' },
            }),
      }),
      outline: (props) => ({
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
          : {
              bg: 'transparent',
              border: '1px solid',
              borderColor: 'primary.500',
              color: 'primary.500',
              _hover: { bg: 'primary.50' },
              _active: { bg: 'primary.100' },
            }),
      }),
      // High contrast variants
      'high-contrast': (props) => ({
        bg: props.colorMode === 'light' 
          ? 'highContrast.light.primary' 
          : 'highContrast.dark.primary',
        color: props.colorMode === 'light' 
          ? 'white' 
          : 'black',
        border: '2px solid',
        borderColor: props.colorMode === 'light' 
          ? 'black' 
          : 'white',
        borderRadius: 'md',
        fontWeight: 'bold',
        _hover: {
          bg: props.colorMode === 'light' 
            ? 'blue.800' 
            : 'cyan.300',
          transform: 'scale(1.05)',
        },
        _active: {
          bg: props.colorMode === 'light' 
            ? 'blue.900' 
            : 'cyan.400',
          transform: 'scale(1)',
        },
        _focus: {
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        },
      }),
      'high-contrast-secondary': (props) => ({
        bg: props.colorMode === 'light' 
          ? 'highContrast.light.secondary' 
          : 'highContrast.dark.secondary',
        color: props.colorMode === 'light' 
          ? 'white' 
          : 'black',
        border: '2px solid',
        borderColor: props.colorMode === 'light' 
          ? 'black' 
          : 'white',
        borderRadius: 'md',
        fontWeight: 'bold',
        _hover: {
          bg: props.colorMode === 'light' 
            ? 'red.800' 
            : 'yellow.300',
          transform: 'scale(1.05)',
        },
        _active: {
          bg: props.colorMode === 'light' 
            ? 'red.900' 
            : 'yellow.400',
          transform: 'scale(1)',
        },
        _focus: {
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        },
      }),
      'high-contrast-outline': (props) => ({
        bg: 'transparent',
        color: props.colorMode === 'light' 
          ? 'highContrast.light.text' 
          : 'highContrast.dark.text',
        border: '3px solid',
        borderColor: props.colorMode === 'light' 
          ? 'highContrast.light.primary' 
          : 'highContrast.dark.primary',
        borderRadius: 'md',
        fontWeight: 'bold',
        _hover: {
          bg: props.colorMode === 'light' 
            ? 'rgba(0, 0, 128, 0.1)' 
            : 'rgba(0, 255, 255, 0.2)',
          transform: 'scale(1.05)',
        },
        _active: {
          bg: props.colorMode === 'light' 
            ? 'rgba(0, 0, 128, 0.2)' 
            : 'rgba(0, 255, 255, 0.3)',
          transform: 'scale(1)',
        },
        _focus: {
          boxShadow: 'high-contrast-focus',
          outline: 'none',
        },
      }),
    },
  },
  Card: {
<<<<<<< HEAD
    baseStyle: (props) => {
      // Check if high contrast mode is active
      const isHighContrast = props.colorScheme === 'highContrast';
      
      if (isHighContrast) {
        return {
          container: {
            bg: props.colorMode === 'light' 
              ? 'highContrast.light.background' 
              : 'highContrast.dark.background',
            border: '3px solid',
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.border' 
              : 'highContrast.dark.border',
            borderRadius: 'md',
            boxShadow: 'xl',
          },
          body: {
            padding: '6',
            color: props.colorMode === 'light' 
              ? 'highContrast.light.text' 
              : 'highContrast.dark.text',
          },
          header: {
            padding: '6',
            borderBottom: '2px solid',
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.border' 
              : 'highContrast.dark.border',
            fontWeight: 'bold',
            color: props.colorMode === 'light' 
              ? 'highContrast.light.text' 
              : 'highContrast.dark.text',
          },
          footer: {
            padding: '6',
            borderTop: '2px solid',
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.border' 
              : 'highContrast.dark.border',
            color: props.colorMode === 'light' 
              ? 'highContrast.light.text' 
              : 'highContrast.dark.text',
          },
        };
      }
      
      // Default glassmorphism style
      return {
        container: props.colorMode === 'light' 
          ? createGlassmorphism(0.7, 10, 1) 
          : createDarkGlassmorphism(0.7, 10, 1),
        body: {
          padding: '6',
        },
        header: {
          padding: '6',
        },
        footer: {
          padding: '6',
        },
      };
    },
  },
  Panel: {
    baseStyle: (props) => {
      // Check if high contrast mode is active
      const isHighContrast = props.colorScheme === 'highContrast';
      
      if (isHighContrast) {
        return {
          container: {
            bg: props.colorMode === 'light' 
              ? 'highContrast.light.background' 
              : 'highContrast.dark.background',
            border: '3px solid',
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.border' 
              : 'highContrast.dark.border',
            borderRadius: 'md',
            boxShadow: 'xl',
            transition: 'all 0.2s ease-in-out',
          },
          header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '2',
            borderBottom: '2px solid',
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.border' 
              : 'highContrast.dark.border',
            cursor: 'grab',
            userSelect: 'none',
            fontWeight: 'bold',
            color: props.colorMode === 'light' 
              ? 'highContrast.light.text' 
              : 'highContrast.dark.text',
            bg: props.colorMode === 'light' 
              ? 'highContrast.light.primary' 
              : 'highContrast.dark.primary',
          },
          body: {
            padding: '4',
            height: '100%',
            overflow: 'auto',
            color: props.colorMode === 'light' 
              ? 'highContrast.light.text' 
              : 'highContrast.dark.text',
          },
        };
      }
      
      // Default glassmorphism style
      return {
        container: {
          ...(props.colorMode === 'light' 
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
          borderColor: props.colorMode === 'light' 
            ? 'rgba(255, 255, 255, 0.3)' 
            : 'rgba(255, 255, 255, 0.1)',
          cursor: 'grab',
          userSelect: 'none',
        },
        body: {
          padding: '4',
          height: '100%',
          overflow: 'auto',
        },
      };
    },
  },
  Input: {
    baseStyle: (props) => {
      // Check if high contrast mode is active
      const isHighContrast = props.colorScheme === 'highContrast';
      
      if (isHighContrast) {
        return {
          field: {
            border: '2px solid',
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.border' 
              : 'highContrast.dark.border',
            bg: props.colorMode === 'light' 
              ? 'white' 
              : 'black',
            color: props.colorMode === 'light' 
              ? 'black' 
              : 'white',
            _hover: {
              borderColor: props.colorMode === 'light' 
                ? 'highContrast.light.primary' 
                : 'highContrast.dark.primary',
            },
            _focus: {
              borderColor: props.colorMode === 'light' 
                ? 'highContrast.light.focus' 
                : 'highContrast.dark.focus',
              boxShadow: 'high-contrast-focus',
              outline: 'none',
            },
            _disabled: {
              opacity: 0.6,
              cursor: 'not-allowed',
              borderColor: props.colorMode === 'light' 
                ? 'gray.300' 
                : 'gray.600',
              bg: props.colorMode === 'light' 
                ? 'gray.100' 
                : 'gray.800',
            },
            _invalid: {
              borderColor: props.colorMode === 'light' 
                ? 'highContrast.light.error' 
                : 'highContrast.dark.error',
              boxShadow: `0 0 0 1px ${props.colorMode === 'light' 
                ? 'red' 
                : 'red'}`,
            },
          },
        };
      }
      
      // Default style
      return {};
    },
    variants: {
      'high-contrast': (props) => ({
        field: {
          border: '2px solid',
          borderColor: props.colorMode === 'light' 
            ? 'highContrast.light.border' 
            : 'highContrast.dark.border',
          bg: props.colorMode === 'light' 
            ? 'white' 
            : 'black',
          color: props.colorMode === 'light' 
            ? 'black' 
            : 'white',
          _hover: {
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.primary' 
              : 'highContrast.dark.primary',
          },
          _focus: {
            borderColor: props.colorMode === 'light' 
              ? 'highContrast.light.focus' 
              : 'highContrast.dark.focus',
            boxShadow: 'high-contrast-focus',
            outline: 'none',
          },
        },
      }),
    },
  },
  Link: {
    baseStyle: (props) => {
      // Check if high contrast mode is active
      const isHighContrast = props.colorScheme === 'highContrast';
      
      if (isHighContrast) {
        return {
          color: props.colorMode === 'light' 
            ? 'highContrast.light.link' 
            : 'highContrast.dark.link',
          textDecoration: 'underline',
          fontWeight: 'medium',
          _hover: {
            textDecoration: 'none',
            bg: props.colorMode === 'light' 
              ? 'rgba(0, 0, 255, 0.1)' 
              : 'rgba(0, 255, 255, 0.2)',
          },
          _focus: {
            boxShadow: 'high-contrast-focus',
            outline: 'none',
          },
          _visited: {
            color: props.colorMode === 'light' 
              ? 'highContrast.light.visited' 
              : 'highContrast.dark.visited',
          },
        };
      }
      
      // Default style
      return {};
    },
=======
    baseStyle: (props) => ({
      container: {
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'background.highContrast',
              color: 'text.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
              borderRadius: 'lg', // Keep consistent radius or remove for sharper contrast
              boxShadow: 'none', // Remove shadow in high contrast
            }
          : props.colorMode === 'light'
            ? createGlassmorphism(0.7, 10, 1)
            : createDarkGlassmorphism(0.7, 10, 1)),
        transition: 'none', // Disable transitions in high contrast
        _hover: props.colorMode === 'highContrast' ? {} : { transform: 'translateY(-4px)', boxShadow: 'lg' },
      },
      body: {
        padding: '6',
      },
      header: {
        padding: '6',
        borderBottom: props.colorMode === 'highContrast' ? '1px solid' : 'none',
        borderColor: props.colorMode === 'highContrast' ? 'borderHc.500' : 'transparent',
      },
      footer: {
        padding: '6',
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
              borderRadius: 'lg',
              boxShadow: 'none',
            }
          : props.colorMode === 'light'
            ? createGlassmorphism(0.75, 15, 1)
            : createDarkGlassmorphism(0.75, 15, 1)),
        padding: '0', // Remove base padding, apply to header/body
        transition: 'none', // Disable transitions in high contrast
        _hover: props.colorMode === 'highContrast' ? {} : { boxShadow: 'lg' },
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
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
        _focus: {
          boxShadow: 'outline',
          zIndex: 1,
        },
      },
      body: {
        padding: '4',
        height: '100%',
        overflow: 'auto',
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
      },
    }),
>>>>>>> main
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'md',
        transition: 'none', // Disable transitions in high contrast
      },
    },
    variants: {
      glass: (props) => ({
        field: {
          ...(props.colorMode === 'highContrast'
            ? {
                bg: 'background.highContrast',
                color: 'text.highContrast',
                border: '1px solid',
                borderColor: 'borderHc.500',
                _hover: {
                  borderColor: 'primaryHc.500',
                },
                _focus: {
                  borderColor: 'primaryHc.500',
                  boxShadow: `0 0 0 1px ${colors.primaryHc[500]}`,
                  zIndex: 1,
                },
                _invalid: {
                  borderColor: 'error.highContrast',
                  boxShadow: `0 0 0 1px ${colors.error.highContrast}`,
                },
              }
            : props.colorMode === 'light'
              ? createGlassmorphism(0.5, 8, 1)
              : createDarkGlassmorphism(0.5, 8, 1)),
          _focus: props.colorMode !== 'highContrast' ? {
            borderColor: 'primary.500',
            boxShadow: `0 0 0 1px ${props.colorMode === 'light' ? 'rgba(62, 92, 118, 0.6)' : 'rgba(62, 92, 118, 0.4)'}`,
            zIndex: 1,
          } : {},
          _invalid: props.colorMode !== 'highContrast' ? {
            borderColor: 'error.500',
            boxShadow: `0 0 0 1px ${props.colorMode === 'light' ? 'rgba(244, 67, 54, 0.6)' : 'rgba(244, 67, 54, 0.4)'}`,
          } : {},
        },
      }),
      solid: (props) => ({
        field: {
          ...(props.colorMode === 'highContrast'
            ? {
                bg: 'background.highContrast',
                color: 'text.highContrast',
                border: '1px solid',
                borderColor: 'borderHc.500',
                _hover: {
                  borderColor: 'primaryHc.500',
                },
                _focus: {
                  borderColor: 'primaryHc.500',
                  boxShadow: `0 0 0 1px ${colors.primaryHc[500]}`,
                  zIndex: 1,
                },
                _invalid: {
                  borderColor: 'error.highContrast',
                  boxShadow: `0 0 0 1px ${colors.error.highContrast}`,
                },
              }
            : {
                bg: props.colorMode === 'light' ? 'white' : 'gray.800',
                border: '1px solid',
                borderColor: props.colorMode === 'light' ? 'gray.200' : 'gray.700',
                _hover: {
                  borderColor: props.colorMode === 'light' ? 'gray.300' : 'gray.600',
                },
                _focus: {
                  borderColor: 'primary.500',
                  boxShadow: `0 0 0 1px ${props.colorMode === 'light' ? 'rgba(62, 92, 118, 0.6)' : 'rgba(62, 92, 118, 0.4)'}`,
                  zIndex: 1,
                },
                _invalid: {
                  borderColor: 'error.500',
                  boxShadow: `0 0 0 1px ${props.colorMode === 'light' ? 'rgba(244, 67, 54, 0.6)' : 'rgba(244, 67, 54, 0.4)'}`,
                },
              }),
        },
      }),
      outline: (props) => ({
        field: {
          ...(props.colorMode === 'highContrast'
            ? {
                bg: 'background.highContrast',
                color: 'text.highContrast',
                border: '1px solid',
                borderColor: 'borderHc.500',
                _hover: {
                  borderColor: 'primaryHc.500',
                },
                _focus: {
                  borderColor: 'primaryHc.500',
                  boxShadow: `0 0 0 1px ${colors.primaryHc[500]}`,
                  zIndex: 1,
                },
                _invalid: {
                  borderColor: 'error.highContrast',
                  boxShadow: `0 0 0 1px ${colors.error.highContrast}`,
                },
              }
            : {
                bg: 'transparent',
                border: '1px solid',
                borderColor: props.colorMode === 'light' ? 'gray.300' : 'gray.600',
                _hover: {
                  borderColor: props.colorMode === 'light' ? 'gray.400' : 'gray.500',
                },
                _focus: {
                  borderColor: 'primary.500',
                  boxShadow: `0 0 0 1px ${props.colorMode === 'light' ? 'rgba(62, 92, 118, 0.6)' : 'rgba(62, 92, 118, 0.4)'}`,
                  zIndex: 1,
                },
                _invalid: {
                  borderColor: 'error.500',
                  boxShadow: `0 0 0 1px ${props.colorMode === 'light' ? 'rgba(244, 67, 54, 0.6)' : 'rgba(244, 67, 54, 0.4)'}`,
                },
              }),
        },
      }),
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 2,
      py: 1,
      textTransform: 'none',
      fontWeight: 'medium',
    },
    variants: {
      solid: (props) => ({
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'secondaryHc.500',
              color: 'background.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
            }
          : {
              bg: `${props.colorScheme}.500`,
              color: 'white',
            }),
      }),
      outline: (props) => ({
        ...(props.colorMode === 'highContrast'
          ? {
              bg: 'transparent',
              color: 'text.highContrast',
              border: '1px solid',
              borderColor: 'borderHc.500',
            }
          : {
              color: `${props.colorScheme}.500`,
              boxShadow: `inset 0 0 0px 1px ${props.theme.colors[props.colorScheme][500]}`,
            }),
      }),
      // Add high contrast for other variants if needed
    },
  },
  Drawer: {
    baseStyle: (props) => ({
      dialog: {
        bg: props.colorMode === 'highContrast'
          ? 'background.highContrast'
          : props.colorMode === 'light' ? 'white' : 'gray.800',
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
        border: props.colorMode === 'highContrast' ? '1px solid' : 'none',
        borderColor: props.colorMode === 'highContrast' ? 'borderHc.500' : 'transparent',
      },
      header: {
        borderBottom: props.colorMode === 'highContrast' ? '1px solid' : '1px solid',
        borderColor: props.colorMode === 'highContrast' ? 'borderHc.500' : 'inherit',
      },
      // Add styles for body, footer, closeButton if needed
    }),
  },
  Menu: {
    baseStyle: (props) => ({
      list: {
        bg: props.colorMode === 'highContrast'
          ? 'background.highContrast'
          : props.colorMode === 'light' ? 'white' : 'gray.700',
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
        border: '1px solid',
        borderColor: props.colorMode === 'highContrast' ? 'borderHc.500' : 'inherit',
      },
      item: {
        bg: 'transparent',
        color: props.colorMode === 'highContrast' ? 'text.highContrast' : 'inherit',
        _hover: {
          bg: props.colorMode === 'highContrast' ? 'secondaryHc.500' : props.colorMode === 'light' ? 'gray.100' : 'gray.600',
          color: props.colorMode === 'highContrast' ? 'background.highContrast' : 'inherit',
        },
        _focus: {
          bg: props.colorMode === 'highContrast' ? 'secondaryHc.500' : props.colorMode === 'light' ? 'gray.100' : 'gray.600',
          color: props.colorMode === 'highContrast' ? 'background.highContrast' : 'inherit',
        },
      },
    }),
  },
  // Add high contrast styles for other components like SplitView handle, DropZone, ProgressBar etc. if needed
};

// Global styles
const styles = {
<<<<<<< HEAD
  global: (props) => {
    // Check if high contrast mode is active
    const isHighContrast = props.colorScheme === 'highContrast';
    
    if (isHighContrast) {
      return {
        body: {
          bg: props.colorMode === 'light' 
            ? 'background.highContrastLight' 
            : 'background.highContrastDark',
          color: props.colorMode === 'light' 
            ? 'highContrast.light.text' 
            : 'highContrast.dark.text',
          transition: 'background-color 0.2s ease-in-out',
        },
        // Improve focus visibility for all elements
        '*:focus': {
          boxShadow: 'high-contrast-focus !important',
          outline: 'none !important',
        },
        // Increase text spacing for better readability
        'p, h1, h2, h3, h4, h5, h6': {
          letterSpacing: 'wide',
          lineHeight: 'tall',
        },
      };
    }
    
    // Default style
    return {
      body: {
        bg: props.colorMode === 'light' ? 'background.light' : 'background.dark',
        color: props.colorMode === 'light' ? 'neutral.800' : 'neutral.100',
        transition: 'background-color 0.2s ease-in-out',
      },
    };
  },
=======
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
      transition: 'none', // Disable transitions globally in high contrast
    },
    // High contrast focus outline
    '*:focus-visible': {
      outline: props.colorMode === 'highContrast' ? `2px solid ${colors.primaryHc[500]}` : 'none',
      outlineOffset: props.colorMode === 'highContrast' ? '2px' : '0',
      boxShadow: props.colorMode === 'highContrast' ? 'none' : 'outline', // Use default outline shadow otherwise
    },
    // High contrast selection
    '::selection': {
      background: props.colorMode === 'highContrast' ? 'primaryHc.500' : 'primary.500',
      color: props.colorMode === 'highContrast' ? 'background.highContrast' : 'white',
    },
    // High contrast scrollbars (basic)
    '::-webkit-scrollbar': {
      width: props.colorMode === 'highContrast' ? '10px' : '8px',
      height: props.colorMode === 'highContrast' ? '10px' : '8px',
    },
    '::-webkit-scrollbar-track': {
      background: props.colorMode === 'highContrast' ? 'background.highContrast' : props.colorMode === 'light' ? '#f1f1f1' : '#2d3748',
    },
    '::-webkit-scrollbar-thumb': {
      background: props.colorMode === 'highContrast' ? 'borderHc.500' : '#888',
      border: props.colorMode === 'highContrast' ? `2px solid ${colors.background.highContrast}` : 'none',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: props.colorMode === 'highContrast' ? 'primaryHc.500' : '#555',
    },
  }),
>>>>>>> main
};

// Theme config
const config: ThemeConfig = {
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
  createHighContrast: createHighContrastGlassmorphism,
  createHighContrastDark: createHighContrastDarkGlassmorphism,
};

// Create a high contrast theme extension
export const createHighContrastTheme = (colorMode: 'light' | 'dark'): ThemeOverride => {
  return {
    colors: {
      ...colors,
    },
    styles: {
      global: {
        body: {
          bg: colorMode === 'light' 
            ? 'background.highContrastLight' 
            : 'background.highContrastDark',
          color: colorMode === 'light' 
            ? 'highContrast.light.text' 
            : 'highContrast.dark.text',
        },
      },
    },
    // Add colorScheme property to be used in component styles
    colorScheme: 'highContrast',
  };
};

