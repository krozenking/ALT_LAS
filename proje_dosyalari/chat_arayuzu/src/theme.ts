import { extendTheme } from '@chakra-ui/react';

// Renk modu konfigürasyonu
const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

// Özel renkler
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#b3e0ff',
    200: '#80caff',
    300: '#4db3ff',
    400: '#1a9dff',
    500: '#0080ff', // Ana marka rengi
    600: '#0066cc',
    700: '#004d99',
    800: '#003366',
    900: '#001a33',
  },
  // Çalışma modları için renkler
  modes: {
    normal: {
      primary: '#0080ff',
      secondary: '#f0f4f8',
    },
    dream: {
      primary: '#9c27b0',
      secondary: '#f3e5f5',
    },
    explore: {
      primary: '#2e7d32',
      secondary: '#e8f5e9',
    },
    chaos: {
      primary: '#d32f2f',
      secondary: '#ffebee',
    },
  },
};

// Özel font boyutları
const fontSizes = {
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
};

// Özel border radius değerleri
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

// Glassmorphism efektleri
const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
  },
  dark: {
    background: 'rgba(26, 32, 44, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
};

// Bileşen stilleri
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'lg',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.600',
        },
      }),
      outline: (props) => ({
        borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        color: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        _hover: {
          bg: props.colorMode === 'dark' ? 'rgba(0, 128, 255, 0.1)' : 'rgba(0, 128, 255, 0.1)',
        },
      }),
      ghost: (props) => ({
        color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
        _hover: {
          bg: props.colorMode === 'dark' ? 'whiteAlpha.200' : 'blackAlpha.100',
        },
      }),
    },
  },
  Input: {
    variants: {
      outline: (props) => ({
        field: {
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'brand.500' : 'brand.500'}`,
          },
        },
      }),
    },
  },
  Textarea: {
    variants: {
      outline: (props) => ({
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
        _hover: {
          borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
        },
        _focus: {
          borderColor: 'brand.500',
          boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'brand.500' : 'brand.500'}`,
        },
      }),
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'xl',
        boxShadow: props.colorMode === 'dark' ? 'lg' : 'md',
        overflow: 'hidden',
      },
      header: {
        py: 4,
        px: 6,
      },
      body: {
        py: 4,
        px: 6,
      },
      footer: {
        py: 4,
        px: 6,
      },
    }),
  },
  // Özel bileşenler için stiller
  ChatContainer: {
    baseStyle: (props) => ({
      bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
      borderRadius: 'xl',
      boxShadow: props.colorMode === 'dark' ? 'lg' : 'md',
      overflow: 'hidden',
      height: '100%',
    }),
  },
  MessageBubble: {
    baseStyle: (props) => ({
      user: {
        bg: 'brand.500',
        color: 'white',
        borderBottomRightRadius: 0,
      },
      ai: {
        bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
        borderBottomLeftRadius: 0,
      },
    }),
  },
};

// Tema oluşturma
const theme = extendTheme({
  config,
  colors,
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },
  fontSizes,
  radii,
  components,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  glassmorphism,
});

export default theme;
