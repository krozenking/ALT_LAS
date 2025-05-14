import { ThemeConfig, ThemeDirection, ColorMode } from '@chakra-ui/react';

/**
 * Theme type
 */
export type ThemeType = 'light' | 'dark' | 'system' | 'custom';

/**
 * Theme variant
 */
export type ThemeVariant = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'gray' | 'custom';

/**
 * Theme density
 */
export type ThemeDensity = 'comfortable' | 'compact' | 'spacious';

/**
 * Theme radius
 */
export type ThemeRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Theme font
 */
export type ThemeFont = 'system' | 'sans' | 'serif' | 'mono' | 'custom';

/**
 * Theme animation
 */
export type ThemeAnimation = 'none' | 'minimal' | 'normal' | 'elaborate';

/**
 * Theme settings
 */
export interface ThemeSettings {
  /**
   * Theme type
   */
  type: ThemeType;
  /**
   * Theme variant
   */
  variant: ThemeVariant;
  /**
   * Theme density
   */
  density: ThemeDensity;
  /**
   * Theme radius
   */
  radius: ThemeRadius;
  /**
   * Theme font
   */
  font: ThemeFont;
  /**
   * Theme animation
   */
  animation: ThemeAnimation;
  /**
   * Theme direction
   */
  direction: ThemeDirection;
  /**
   * Custom primary color
   */
  primaryColor?: string;
  /**
   * Custom secondary color
   */
  secondaryColor?: string;
  /**
   * Custom accent color
   */
  accentColor?: string;
  /**
   * Custom background color
   */
  backgroundColor?: string;
  /**
   * Custom text color
   */
  textColor?: string;
  /**
   * Custom font size
   */
  fontSize?: number;
  /**
   * Custom font family
   */
  fontFamily?: string;
  /**
   * Custom border radius
   */
  borderRadius?: number;
  /**
   * Custom spacing
   */
  spacing?: number;
  /**
   * Use glassmorphism
   */
  useGlassmorphism?: boolean;
  /**
   * Glassmorphism opacity
   */
  glassmorphismOpacity?: number;
  /**
   * Glassmorphism blur
   */
  glassmorphismBlur?: number;
  /**
   * Glassmorphism border
   */
  glassmorphismBorder?: number;
  /**
   * Use shadows
   */
  useShadows?: boolean;
  /**
   * Use animations
   */
  useAnimations?: boolean;
  /**
   * Use transitions
   */
  useTransitions?: boolean;
  /**
   * Use borders
   */
  useBorders?: boolean;
  /**
   * Use gradients
   */
  useGradients?: boolean;
  /**
   * Use custom scrollbar
   */
  useCustomScrollbar?: boolean;
  /**
   * Use reduced motion
   */
  useReducedMotion?: boolean;
  /**
   * Use high contrast
   */
  useHighContrast?: boolean;
  /**
   * Chakra config
   */
  config?: ThemeConfig;
}

/**
 * Default theme settings
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  type: 'system',
  variant: 'default',
  density: 'comfortable',
  radius: 'md',
  font: 'system',
  animation: 'normal',
  direction: 'ltr',
  useGlassmorphism: true,
  glassmorphismOpacity: 0.7,
  glassmorphismBlur: 10,
  glassmorphismBorder: 1,
  useShadows: true,
  useAnimations: true,
  useTransitions: true,
  useBorders: true,
  useGradients: false,
  useCustomScrollbar: true,
  useReducedMotion: false,
  useHighContrast: false,
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
    disableTransitionOnChange: false,
  },
};

/**
 * Light theme settings
 */
export const LIGHT_THEME_SETTINGS: Partial<ThemeSettings> = {
  type: 'light',
  backgroundColor: '#f7fafc',
  textColor: '#1a202c',
};

/**
 * Dark theme settings
 */
export const DARK_THEME_SETTINGS: Partial<ThemeSettings> = {
  type: 'dark',
  backgroundColor: '#1a202c',
  textColor: '#f7fafc',
};

/**
 * Blue theme settings
 */
export const BLUE_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'blue',
  primaryColor: '#3182ce',
  secondaryColor: '#63b3ed',
  accentColor: '#4299e1',
};

/**
 * Green theme settings
 */
export const GREEN_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'green',
  primaryColor: '#38a169',
  secondaryColor: '#68d391',
  accentColor: '#48bb78',
};

/**
 * Purple theme settings
 */
export const PURPLE_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'purple',
  primaryColor: '#805ad5',
  secondaryColor: '#b794f4',
  accentColor: '#9f7aea',
};

/**
 * Orange theme settings
 */
export const ORANGE_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'orange',
  primaryColor: '#dd6b20',
  secondaryColor: '#f6ad55',
  accentColor: '#ed8936',
};

/**
 * Red theme settings
 */
export const RED_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'red',
  primaryColor: '#e53e3e',
  secondaryColor: '#fc8181',
  accentColor: '#f56565',
};

/**
 * Teal theme settings
 */
export const TEAL_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'teal',
  primaryColor: '#319795',
  secondaryColor: '#4fd1c5',
  accentColor: '#38b2ac',
};

/**
 * Gray theme settings
 */
export const GRAY_THEME_SETTINGS: Partial<ThemeSettings> = {
  variant: 'gray',
  primaryColor: '#718096',
  secondaryColor: '#a0aec0',
  accentColor: '#4a5568',
};

/**
 * Theme variant settings map
 */
export const THEME_VARIANT_SETTINGS: Record<ThemeVariant, Partial<ThemeSettings>> = {
  default: {},
  blue: BLUE_THEME_SETTINGS,
  green: GREEN_THEME_SETTINGS,
  purple: PURPLE_THEME_SETTINGS,
  orange: ORANGE_THEME_SETTINGS,
  red: RED_THEME_SETTINGS,
  teal: TEAL_THEME_SETTINGS,
  gray: GRAY_THEME_SETTINGS,
  custom: {},
};

/**
 * Theme type settings map
 */
export const THEME_TYPE_SETTINGS: Record<Exclude<ThemeType, 'system' | 'custom'>, Partial<ThemeSettings>> = {
  light: LIGHT_THEME_SETTINGS,
  dark: DARK_THEME_SETTINGS,
};
