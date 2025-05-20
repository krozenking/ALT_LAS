/**
 * Theme configuration for the application
 */

// Colors
export const colors = {
  // Primary colors
  primary: {
    main: '#0084ff',
    light: '#4da3ff',
    dark: '#0066cc',
    contrastText: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    main: '#f7b928',
    light: '#ffd166',
    dark: '#c48800',
    contrastText: '#000000',
  },
  
  // Text colors
  text: {
    primary: '#050505',
    secondary: '#65676b',
    disabled: '#8e8e8e',
    hint: '#8e8e8e',
  },
  
  // Background colors
  background: {
    default: '#f0f2f5',
    paper: '#ffffff',
    light: '#f5f7fb',
    dark: '#e0e0e0',
  },
  
  // Status colors
  status: {
    online: '#31a24c',
    away: '#f7b928',
    offline: '#8e8e8e',
    error: '#ff3b30',
    success: '#31a24c',
    warning: '#f7b928',
    info: '#0084ff',
  },
  
  // Border colors
  border: {
    light: '#e0e0e0',
    main: '#d0d0d0',
    dark: '#b0b0b0',
  },
  
  // High contrast colors (for accessibility)
  highContrast: {
    background: '#000000',
    text: '#ffffff',
    primary: '#00aaff',
    secondary: '#ffcc00',
    border: '#ffffff',
  },
};

// Typography
export const typography = {
  fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  
  // Font sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    md: '1rem',       // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    xxl: '1.5rem',    // 24px
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeight: {
    xs: 1.2,
    sm: 1.4,
    md: 1.5,
    lg: 1.6,
    xl: 1.8,
  },
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px',
};

// Shadows
export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
};

// Border radius
export const borderRadius = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  round: '50%',
};

// Transitions
export const transitions = {
  duration: {
    short: '0.2s',
    medium: '0.3s',
    long: '0.5s',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Z-index
export const zIndex = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Theme object
const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  transitions,
  zIndex,
};

export default theme;
