import { extendTheme, ThemeConfig, ThemeDirection, ColorMode } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { 
  ThemeSettings, 
  DEFAULT_THEME_SETTINGS,
  THEME_VARIANT_SETTINGS,
  THEME_TYPE_SETTINGS,
} from './types';
import { glassmorphism } from '../theme';

/**
 * Create theme from settings
 * @param settings Theme settings
 * @returns Chakra UI theme
 */
export const createThemeFromSettings = (settings: Partial<ThemeSettings> = {}) => {
  // Merge settings with defaults
  const mergedSettings: ThemeSettings = {
    ...DEFAULT_THEME_SETTINGS,
    ...settings,
  };

  // Apply variant settings
  if (mergedSettings.variant !== 'custom') {
    const variantSettings = THEME_VARIANT_SETTINGS[mergedSettings.variant];
    Object.assign(mergedSettings, variantSettings);
  }

  // Apply type settings if not system or custom
  if (mergedSettings.type !== 'system' && mergedSettings.type !== 'custom') {
    const typeSettings = THEME_TYPE_SETTINGS[mergedSettings.type];
    Object.assign(mergedSettings, typeSettings);
  }

  // Create theme config
  const config: ThemeConfig = {
    initialColorMode: mergedSettings.type === 'system' ? 'system' : (mergedSettings.type as ColorMode),
    useSystemColorMode: mergedSettings.type === 'system',
    disableTransitionOnChange: !mergedSettings.useTransitions,
    ...mergedSettings.config,
  };

  // Create spacing scale based on density
  const getSpacingScale = () => {
    const baseScale = {
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

    // Apply density modifier
    const densityModifier = mergedSettings.density === 'compact' 
      ? 0.8 
      : mergedSettings.density === 'spacious' 
        ? 1.2 
        : 1;

    // Apply custom spacing if provided
    const customSpacingModifier = mergedSettings.spacing 
      ? mergedSettings.spacing / 4 
      : 1;

    // Combine modifiers
    const modifier = densityModifier * customSpacingModifier;

    // Apply modifier to scale
    if (modifier !== 1) {
      const modifiedScale: Record<string, string> = {};
      
      Object.entries(baseScale).forEach(([key, value]) => {
        if (key === 'px') {
          modifiedScale[key] = value;
          return;
        }
        
        const numValue = parseFloat(value);
        const unit = value.replace(/[\d.]/g, '');
        modifiedScale[key] = `${numValue * modifier}${unit}`;
      });
      
      return modifiedScale;
    }
    
    return baseScale;
  };

  // Create radius scale based on radius setting
  const getRadiusScale = () => {
    const baseScale = {
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

    // Apply radius modifier
    let modifier = 1;
    
    switch (mergedSettings.radius) {
      case 'none':
        return {
          none: '0',
          sm: '0',
          base: '0',
          md: '0',
          lg: '0',
          xl: '0',
          '2xl': '0',
          '3xl': '0',
          full: '0',
        };
      case 'sm':
        modifier = 0.5;
        break;
      case 'md':
        modifier = 1;
        break;
      case 'lg':
        modifier = 1.5;
        break;
      case 'xl':
        modifier = 2;
        break;
      case 'full':
        return {
          none: '9999px',
          sm: '9999px',
          base: '9999px',
          md: '9999px',
          lg: '9999px',
          xl: '9999px',
          '2xl': '9999px',
          '3xl': '9999px',
          full: '9999px',
        };
    }

    // Apply custom border radius if provided
    if (mergedSettings.borderRadius) {
      modifier = mergedSettings.borderRadius / 4;
    }

    // Apply modifier to scale
    if (modifier !== 1) {
      const modifiedScale: Record<string, string> = {};
      
      Object.entries(baseScale).forEach(([key, value]) => {
        if (key === 'none' || key === 'full') {
          modifiedScale[key] = value;
          return;
        }
        
        const numValue = parseFloat(value);
        const unit = value.replace(/[\d.]/g, '');
        modifiedScale[key] = `${numValue * modifier}${unit}`;
      });
      
      return modifiedScale;
    }
    
    return baseScale;
  };

  // Create font settings
  const getFontSettings = () => {
    // Base font settings
    const baseFonts = {
      system: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      sans: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      serif: `Georgia, Times, serif`,
      mono: `SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
    };

    // Get font family based on setting
    let fontFamily = baseFonts.system;
    
    if (mergedSettings.font !== 'custom') {
      fontFamily = baseFonts[mergedSettings.font];
    } else if (mergedSettings.fontFamily) {
      fontFamily = mergedSettings.fontFamily;
    }

    // Font size modifier based on setting
    const fontSizeModifier = mergedSettings.fontSize ? mergedSettings.fontSize / 16 : 1;

    // Base font sizes
    const baseSizes = {
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

    // Apply font size modifier
    const fontSizes = fontSizeModifier !== 1
      ? Object.entries(baseSizes).reduce((acc, [key, value]) => {
          const numValue = parseFloat(value);
          const unit = value.replace(/[\d.]/g, '');
          acc[key] = `${numValue * fontSizeModifier}${unit}`;
          return acc;
        }, {} as Record<string, string>)
      : baseSizes;

    return {
      fonts: {
        body: fontFamily,
        heading: fontFamily,
        mono: baseFonts.mono,
      },
      fontSizes,
    };
  };

  // Create colors based on settings
  const getColors = () => {
    // Get primary color
    const primaryColor = mergedSettings.primaryColor || '#3182ce'; // Default blue
    const secondaryColor = mergedSettings.secondaryColor || '#63b3ed';
    const accentColor = mergedSettings.accentColor || '#4299e1';

    // Create color object
    return {
      primary: {
        50: adjustColorBrightness(primaryColor, 0.85),
        100: adjustColorBrightness(primaryColor, 0.7),
        200: adjustColorBrightness(primaryColor, 0.55),
        300: adjustColorBrightness(primaryColor, 0.4),
        400: adjustColorBrightness(primaryColor, 0.2),
        500: primaryColor,
        600: adjustColorBrightness(primaryColor, -0.2),
        700: adjustColorBrightness(primaryColor, -0.4),
        800: adjustColorBrightness(primaryColor, -0.6),
        900: adjustColorBrightness(primaryColor, -0.8),
      },
      secondary: {
        50: adjustColorBrightness(secondaryColor, 0.85),
        100: adjustColorBrightness(secondaryColor, 0.7),
        200: adjustColorBrightness(secondaryColor, 0.55),
        300: adjustColorBrightness(secondaryColor, 0.4),
        400: adjustColorBrightness(secondaryColor, 0.2),
        500: secondaryColor,
        600: adjustColorBrightness(secondaryColor, -0.2),
        700: adjustColorBrightness(secondaryColor, -0.4),
        800: adjustColorBrightness(secondaryColor, -0.6),
        900: adjustColorBrightness(secondaryColor, -0.8),
      },
      accent: {
        50: adjustColorBrightness(accentColor, 0.85),
        100: adjustColorBrightness(accentColor, 0.7),
        200: adjustColorBrightness(accentColor, 0.55),
        300: adjustColorBrightness(accentColor, 0.4),
        400: adjustColorBrightness(accentColor, 0.2),
        500: accentColor,
        600: adjustColorBrightness(accentColor, -0.2),
        700: adjustColorBrightness(accentColor, -0.4),
        800: adjustColorBrightness(accentColor, -0.6),
        900: adjustColorBrightness(accentColor, -0.8),
      },
    };
  };

  // Create styles based on settings
  const getStyles = () => {
    return {
      global: (props: any) => ({
        body: {
          bg: mode(
            mergedSettings.backgroundColor || 'gray.50',
            mergedSettings.backgroundColor || 'gray.900'
          )(props),
          color: mode(
            mergedSettings.textColor || 'gray.900',
            mergedSettings.textColor || 'gray.50'
          )(props),
          transition: mergedSettings.useTransitions ? 'all 0.2s' : 'none',
        },
        '*': {
          borderColor: mode('gray.200', 'gray.700')(props),
          borderWidth: mergedSettings.useBorders ? undefined : '0',
        },
        '::selection': {
          bg: mode('primary.100', 'primary.800')(props),
        },
        '::-webkit-scrollbar': mergedSettings.useCustomScrollbar
          ? {
              width: '8px',
              height: '8px',
            }
          : {},
        '::-webkit-scrollbar-track': mergedSettings.useCustomScrollbar
          ? {
              bg: mode('gray.100', 'gray.800')(props),
            }
          : {},
        '::-webkit-scrollbar-thumb': mergedSettings.useCustomScrollbar
          ? {
              bg: mode('gray.300', 'gray.600')(props),
              borderRadius: 'full',
              '&:hover': {
                bg: mode('gray.400', 'gray.500')(props),
              },
            }
          : {},
      }),
    };
  };

  // Create components based on settings
  const getComponents = () => {
    return {
      Button: {
        baseStyle: {
          borderRadius: mergedSettings.radius,
          fontWeight: 'medium',
          _focus: {
            boxShadow: mergedSettings.useShadows ? 'outline' : 'none',
          },
        },
      },
      Input: {
        baseStyle: {
          field: {
            borderRadius: mergedSettings.radius,
            _focus: {
              boxShadow: mergedSettings.useShadows ? 'outline' : 'none',
            },
          },
        },
      },
      // Add more component customizations as needed
    };
  };

  // Create transition settings
  const getTransitions = () => {
    if (!mergedSettings.useTransitions) {
      return {
        property: {
          common: 'none',
          colors: 'none',
          backgrounds: 'none',
          borderColor: 'none',
          opacity: 'none',
          shadow: 'none',
          transform: 'none',
        },
        easing: {
          ease: 'linear',
          easeIn: 'linear',
          easeOut: 'linear',
          easeInOut: 'linear',
        },
        duration: {
          'ultra-fast': '0ms',
          faster: '0ms',
          fast: '0ms',
          normal: '0ms',
          slow: '0ms',
          slower: '0ms',
          'ultra-slow': '0ms',
        },
      };
    }

    // Animation speed based on setting
    const getAnimationSpeed = () => {
      switch (mergedSettings.animation) {
        case 'none':
          return {
            'ultra-fast': '0ms',
            faster: '0ms',
            fast: '0ms',
            normal: '0ms',
            slow: '0ms',
            slower: '0ms',
            'ultra-slow': '0ms',
          };
        case 'minimal':
          return {
            'ultra-fast': '50ms',
            faster: '100ms',
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
            slower: '400ms',
            'ultra-slow': '500ms',
          };
        case 'normal':
          return {
            'ultra-fast': '50ms',
            faster: '100ms',
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
            slower: '400ms',
            'ultra-slow': '500ms',
          };
        case 'elaborate':
          return {
            'ultra-fast': '100ms',
            faster: '150ms',
            fast: '200ms',
            normal: '300ms',
            slow: '400ms',
            slower: '500ms',
            'ultra-slow': '700ms',
          };
        default:
          return {
            'ultra-fast': '50ms',
            faster: '100ms',
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
            slower: '400ms',
            'ultra-slow': '500ms',
          };
      }
    };

    return {
      duration: getAnimationSpeed(),
    };
  };

  // Create shadows based on settings
  const getShadows = () => {
    if (!mergedSettings.useShadows) {
      return {
        xs: 'none',
        sm: 'none',
        base: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        outline: 'none',
        inner: 'none',
        none: 'none',
        'dark-lg': 'none',
      };
    }

    return undefined; // Use Chakra defaults
  };

  // Create the theme
  const theme = extendTheme({
    config,
    direction: mergedSettings.direction,
    ...getFontSettings(),
    colors: getColors(),
    space: getSpacingScale(),
    radii: getRadiusScale(),
    shadows: getShadows(),
    styles: getStyles(),
    components: getComponents(),
    transition: getTransitions(),
    // Add glassmorphism to the theme
    glassmorphism: {
      create: (
        opacity = mergedSettings.glassmorphismOpacity || 0.7,
        blur = mergedSettings.glassmorphismBlur || 10,
        border = mergedSettings.glassmorphismBorder || 1
      ) => glassmorphism.create(opacity, blur, border),
      createDark: (
        opacity = mergedSettings.glassmorphismOpacity || 0.7,
        blur = mergedSettings.glassmorphismBlur || 10,
        border = mergedSettings.glassmorphismBorder || 1
      ) => glassmorphism.createDark(opacity, blur, border),
    },
  });

  return theme;
};

/**
 * Adjust color brightness
 * @param hex Hex color
 * @param percent Percent to adjust (-1 to 1)
 * @returns Adjusted hex color
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Convert hex to RGB
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, Math.round(r + r * percent)));
  g = Math.min(255, Math.max(0, Math.round(g + g * percent)));
  b = Math.min(255, Math.max(0, Math.round(b + b * percent)));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
