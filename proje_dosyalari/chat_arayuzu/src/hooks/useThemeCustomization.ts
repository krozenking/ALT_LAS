import { useState, useEffect, useCallback } from 'react';
import { useColorMode } from '@chakra-ui/react';

// Tema renkleri için tip tanımı
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    light: string;
    dark: string;
  };
  text: {
    light: string;
    dark: string;
  };
  sidebar: {
    light: string;
    dark: string;
  };
  border: {
    light: string;
    dark: string;
  };
  success: string;
  error: string;
  warning: string;
  info: string;
}

// Tema ayarları için tip tanımı
export interface ThemeSettings {
  colors: ThemeColors;
  fontSize: 'sm' | 'md' | 'lg';
  fontFamily: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  customCss?: string;
}

// Varsayılan tema renkleri
const defaultColors: ThemeColors = {
  primary: '#3182CE', // blue.500
  secondary: '#805AD5', // purple.500
  accent: '#38B2AC', // teal.500
  background: {
    light: '#FFFFFF',
    dark: '#1A202C', // gray.800
  },
  text: {
    light: '#1A202C', // gray.800
    dark: '#FFFFFF',
  },
  sidebar: {
    light: '#F7FAFC', // gray.50
    dark: '#2D3748', // gray.700
  },
  border: {
    light: '#E2E8F0', // gray.200
    dark: '#4A5568', // gray.600
  },
  success: '#38A169', // green.500
  error: '#E53E3E', // red.500
  warning: '#DD6B20', // orange.500
  info: '#3182CE', // blue.500
};

// Varsayılan tema ayarları
const defaultSettings: ThemeSettings = {
  colors: defaultColors,
  fontSize: 'md',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  borderRadius: 'md',
  density: 'comfortable',
  animations: true,
};

// Tema özelleştirme hook'u
export const useThemeCustomization = () => {
  const { colorMode } = useColorMode();
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultSettings);
  
  // Yerel depolamadan tema ayarlarını yükle
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('theme_settings');
      if (savedSettings) {
        setThemeSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Tema ayarları yüklenirken hata:', error);
    }
  }, []);
  
  // Tema ayarlarını yerel depolamaya kaydet
  useEffect(() => {
    try {
      localStorage.setItem('theme_settings', JSON.stringify(themeSettings));
    } catch (error) {
      console.error('Tema ayarları kaydedilirken hata:', error);
    }
  }, [themeSettings]);
  
  // CSS değişkenlerini güncelle
  useEffect(() => {
    const root = document.documentElement;
    const { colors, fontSize, fontFamily, borderRadius, density } = themeSettings;
    
    // Renk değişkenleri
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-info', colors.info);
    
    // Arka plan ve metin renkleri (tema moduna göre)
    if (colorMode === 'light') {
      root.style.setProperty('--color-bg', colors.background.light);
      root.style.setProperty('--color-text', colors.text.light);
      root.style.setProperty('--color-sidebar', colors.sidebar.light);
      root.style.setProperty('--color-border', colors.border.light);
    } else {
      root.style.setProperty('--color-bg', colors.background.dark);
      root.style.setProperty('--color-text', colors.text.dark);
      root.style.setProperty('--color-sidebar', colors.sidebar.dark);
      root.style.setProperty('--color-border', colors.border.dark);
    }
    
    // Yazı tipi boyutu
    let fontSizeValue = '1rem';
    if (fontSize === 'sm') fontSizeValue = '0.875rem';
    if (fontSize === 'lg') fontSizeValue = '1.125rem';
    root.style.setProperty('--font-size-base', fontSizeValue);
    
    // Yazı tipi ailesi
    root.style.setProperty('--font-family', fontFamily);
    
    // Kenar yuvarlaklığı
    let borderRadiusValue = '0.375rem'; // md
    if (borderRadius === 'none') borderRadiusValue = '0';
    if (borderRadius === 'sm') borderRadiusValue = '0.125rem';
    if (borderRadius === 'lg') borderRadiusValue = '0.5rem';
    if (borderRadius === 'xl') borderRadiusValue = '0.75rem';
    root.style.setProperty('--border-radius', borderRadiusValue);
    
    // Yoğunluk (boşluk)
    let spacingMultiplier = '1'; // comfortable
    if (density === 'compact') spacingMultiplier = '0.75';
    if (density === 'spacious') spacingMultiplier = '1.25';
    root.style.setProperty('--spacing-multiplier', spacingMultiplier);
    
    // Animasyonlar
    if (!themeSettings.animations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Özel CSS
    let styleElement = document.getElementById('custom-theme-css');
    if (!styleElement && themeSettings.customCss) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      document.head.appendChild(styleElement);
    }
    
    if (styleElement && themeSettings.customCss) {
      styleElement.textContent = themeSettings.customCss;
    } else if (styleElement) {
      styleElement.textContent = '';
    }
  }, [themeSettings, colorMode]);
  
  // Tema renklerini güncelle
  const updateColors = useCallback((newColors: Partial<ThemeColors>) => {
    setThemeSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...newColors,
      },
    }));
  }, []);
  
  // Tema ayarlarını güncelle
  const updateSettings = useCallback((newSettings: Partial<ThemeSettings>) => {
    setThemeSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);
  
  // Temayı sıfırla
  const resetTheme = useCallback(() => {
    setThemeSettings(defaultSettings);
  }, []);
  
  // Önceden tanımlanmış temalar
  const predefinedThemes = {
    default: defaultSettings,
    dark: {
      ...defaultSettings,
      colors: {
        ...defaultColors,
        primary: '#90CDF4', // blue.200
        secondary: '#D6BCFA', // purple.200
        accent: '#4FD1C5', // teal.300
      },
    },
    nature: {
      ...defaultSettings,
      colors: {
        ...defaultColors,
        primary: '#68D391', // green.300
        secondary: '#F6E05E', // yellow.300
        accent: '#4299E1', // blue.400
        background: {
          light: '#F0FFF4', // green.50
          dark: '#1C4532', // green.900
        },
      },
    },
    sunset: {
      ...defaultSettings,
      colors: {
        ...defaultColors,
        primary: '#F56565', // red.500
        secondary: '#ED8936', // orange.500
        accent: '#ECC94B', // yellow.400
        background: {
          light: '#FFFAF0', // orange.50
          dark: '#3D2A00', // custom dark brown
        },
      },
    },
    ocean: {
      ...defaultSettings,
      colors: {
        ...defaultColors,
        primary: '#4299E1', // blue.400
        secondary: '#38B2AC', // teal.500
        accent: '#9F7AEA', // purple.400
        background: {
          light: '#EBF8FF', // blue.50
          dark: '#1A365D', // blue.900
        },
      },
    },
  };
  
  // Önceden tanımlanmış tema uygula
  const applyPredefinedTheme = useCallback((themeName: keyof typeof predefinedThemes) => {
    const theme = predefinedThemes[themeName];
    if (theme) {
      setThemeSettings(theme);
    }
  }, []);
  
  return {
    themeSettings,
    updateColors,
    updateSettings,
    resetTheme,
    predefinedThemes,
    applyPredefinedTheme,
  };
};

export default useThemeCustomization;
