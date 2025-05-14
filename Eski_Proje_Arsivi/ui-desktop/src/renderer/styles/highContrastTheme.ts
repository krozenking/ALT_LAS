import { extendTheme } from '@chakra-ui/react';
import { theme } from './theme';

/**
 * High Contrast Theme for ALT_LAS UI
 * 
 * This theme implements WCAG 2.1 AA compliant high contrast mode
 * with the following color palette:
 * 
 * - Background: #000000 (Black)
 * - Text: #FFFFFF (White)
 * - Primary Action/Highlight: #FFFF00 (Yellow)
 * - Secondary Action/Highlight: #00FFFF (Cyan)
 * - Borders/Subtle Elements: #FFFFFF (White)
 * - Success: #00FF00 (Green)
 * - Warning: #FFA500 (Orange)
 * - Error: #FF0000 (Red)
 * - Info: #00FFFF (Cyan)
 */

// High contrast color palette
const colors = {
  primary: {
    50: '#FFFFCC',
    100: '#FFFF99',
    200: '#FFFF66',
    300: '#FFFF33',
    400: '#FFFF00', // Primary Yellow
    500: '#FFFF00',
    600: '#E6E600',
    700: '#CCCC00',
    800: '#B3B300',
    900: '#999900',
  },
  secondary: {
    50: '#CCFFFF',
    100: '#99FFFF',
    200: '#66FFFF',
    300: '#33FFFF',
    400: '#00FFFF', // Secondary Cyan
    500: '#00FFFF',
    600: '#00E6E6',
    700: '#00CCCC',
    800: '#00B3B3',
    900: '#009999',
  },
  success: {
    50: '#CCFFCC',
    100: '#99FF99',
    200: '#66FF66',
    300: '#33FF33',
    400: '#00FF00', // Success Green
    500: '#00FF00',
    600: '#00E600',
    700: '#00CC00',
    800: '#00B300',
    900: '#009900',
  },
  warning: {
    50: '#FFEACC',
    100: '#FFD699',
    200: '#FFC166',
    300: '#FFAD33',
    400: '#FFA500', // Warning Orange
    500: '#FFA500',
    600: '#E69500',
    700: '#CC8400',
    800: '#B37300',
    900: '#996300',
  },
  error: {
    50: '#FFCCCC',
    100: '#FF9999',
    200: '#FF6666',
    300: '#FF3333',
    400: '#FF0000', // Error Red
    500: '#FF0000',
    600: '#E60000',
    700: '#CC0000',
    800: '#B30000',
    900: '#990000',
  },
  info: {
    50: '#CCFFFF',
    100: '#99FFFF',
    200: '#66FFFF',
    300: '#33FFFF',
    400: '#00FFFF', // Info Cyan (same as secondary)
    500: '#00FFFF',
    600: '#00E6E6',
    700: '#00CCCC',
    800: '#00B3B3',
    900: '#009999',
  },
  gray: {
    50: '#FFFFFF',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#000000', // Black background
  },
  text: {
    default: '#FFFFFF', // White text
  },
  border: {
    default: '#FFFFFF', // White borders
  }
};

// Component style overrides for high contrast
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'md',
      border: '2px solid',
      borderColor: 'white',
      _focus: {
        boxShadow: '0 0 0 3px #FFFF00', // Yellow focus ring
        zIndex: 1,
      },
      _hover: {
        transform: 'none', // Disable transform for better accessibility
      },
      _active: {
        transform: 'none', // Disable transform for better accessibility
      },
    },
    variants: {
      solid: {
        bg: 'primary.500', // Yellow
        color: 'black',
        _hover: {
          bg: 'white',
          color: 'black',
        },
        _active: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
      },
      outline: {
        bg: 'transparent',
        color: 'white',
        borderColor: 'white',
        _hover: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'white',
        _hover: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
      // Map glass variants to high contrast equivalents
      glass: {
        bg: 'transparent',
        color: 'white',
        borderColor: 'white',
        _hover: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
      'glass-primary': {
        bg: 'primary.500', // Yellow
        color: 'black',
        borderColor: 'white',
        _hover: {
          bg: 'white',
          color: 'black',
        },
        _active: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
      },
      'glass-secondary': {
        bg: 'secondary.500', // Cyan
        color: 'black',
        borderColor: 'white',
        _hover: {
          bg: 'white',
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
    },
    sizes: {
      sm: {
        fontSize: 'sm',
        px: 4,
        py: 2,
      },
      md: {
        fontSize: 'md',
        px: 6,
        py: 3,
      },
      lg: {
        fontSize: 'lg',
        px: 8,
        py: 4,
      },
    },
    defaultProps: {
      variant: 'solid',
      size: 'md',
    },
  },
  IconButton: {
    baseStyle: {
      borderRadius: 'md',
      border: '2px solid',
      borderColor: 'white',
      _focus: {
        boxShadow: '0 0 0 3px #FFFF00', // Yellow focus ring
        zIndex: 1,
      },
      _hover: {
        transform: 'none', // Disable transform for better accessibility
      },
      _active: {
        transform: 'none', // Disable transform for better accessibility
      },
    },
    variants: {
      solid: {
        bg: 'primary.500', // Yellow
        color: 'black',
        _hover: {
          bg: 'white',
          color: 'black',
        },
        _active: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
      },
      outline: {
        bg: 'transparent',
        color: 'white',
        borderColor: 'white',
        _hover: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
      // Map glass variants to high contrast equivalents
      glass: {
        bg: 'transparent',
        color: 'white',
        borderColor: 'white',
        _hover: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
      'glass-primary': {
        bg: 'primary.500', // Yellow
        color: 'black',
        borderColor: 'white',
        _hover: {
          bg: 'white',
          color: 'black',
        },
        _active: {
          bg: 'secondary.500', // Cyan
          color: 'black',
        },
      },
      'glass-secondary': {
        bg: 'secondary.500', // Cyan
        color: 'black',
        borderColor: 'white',
        _hover: {
          bg: 'white',
          color: 'black',
        },
        _active: {
          bg: 'primary.500', // Yellow
          color: 'black',
        },
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'md',
        border: '2px solid',
        borderColor: 'white',
        color: 'white',
        bg: 'black',
        _focus: {
          borderColor: 'primary.500', // Yellow
          boxShadow: '0 0 0 1px #FFFF00',
          zIndex: 1,
        },
        _hover: {
          borderColor: 'secondary.500', // Cyan
        },
        _invalid: {
          borderColor: 'error.500', // Red
          boxShadow: '0 0 0 1px #FF0000',
        },
        _disabled: {
          opacity: 0.7,
          cursor: 'not-allowed',
          borderColor: 'gray.500',
        },
      },
    },
    variants: {
      // Map all variants to high contrast equivalent
      outline: {
        field: {
          bg: 'black',
          color: 'white',
          borderColor: 'white',
        },
      },
      filled: {
        field: {
          bg: 'black',
          color: 'white',
          borderColor: 'white',
          _hover: {
            bg: 'gray.900',
          },
          _focus: {
            bg: 'black',
          },
        },
      },
      flushed: {
        field: {
          bg: 'black',
          color: 'white',
          borderColor: 'white',
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: '2px solid',
        },
      },
      glass: {
        field: {
          bg: 'black',
          color: 'white',
          borderColor: 'white',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'black',
        color: 'white',
        border: '2px solid',
        borderColor: 'white',
        borderRadius: 'md',
        boxShadow: 'none',
        transition: 'none', // Disable transitions
        _hover: {}, // Disable hover effects
      },
      header: {
        borderBottom: '2px solid',
        borderColor: 'white',
        padding: 4,
      },
      body: {
        padding: 4,
      },
      footer: {
        borderTop: '2px solid',
        borderColor: 'white',
        padding: 4,
      },
    },
  },
  Heading: {
    baseStyle: {
      color: 'white',
      fontWeight: 'bold',
    },
  },
  Text: {
    baseStyle: {
      color: 'white',
    },
  },
  Link: {
    baseStyle: {
      color: 'primary.500', // Yellow
      fontWeight: 'bold',
      textDecoration: 'underline',
      _hover: {
        color: 'secondary.500', // Cyan
      },
      _focus: {
        boxShadow: '0 0 0 3px #FFFF00', // Yellow focus ring
        zIndex: 1,
      },
    },
  },
  Alert: {
    variants: {
      solid: {
        container: {
          border: '2px solid',
          borderColor: 'white',
        },
        info: {
          bg: 'info.500', // Cyan
          color: 'black',
        },
        success: {
          bg: 'success.500', // Green
          color: 'black',
        },
        warning: {
          bg: 'warning.500', // Orange
          color: 'black',
        },
        error: {
          bg: 'error.500', // Red
          color: 'black',
        },
      },
    },
  },
};

// Global style overrides
const styles = {
  global: {
    body: {
      bg: 'black',
      color: 'white',
    },
    // Improve focus visibility globally
    '*:focus': {
      boxShadow: '0 0 0 3px #FFFF00 !important', // Yellow focus ring
      outline: 'none !important',
    },
    // Disable animations and transitions for reduced motion preference
    '@media (prefers-reduced-motion: reduce)': {
      '*': {
        transition: 'none !important',
        animation: 'none !important',
      },
    },
  },
};

// Create the high contrast theme by extending the base theme
export const highContrastTheme = extendTheme({
  colors,
  components,
  styles,
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
});

export default highContrastTheme;
