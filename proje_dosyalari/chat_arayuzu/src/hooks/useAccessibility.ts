import { useState, useEffect, useCallback } from 'react';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  reduceMotion: false,
  screenReaderMode: false
};

/**
 * Erişilebilirlik ayarları için hook
 * @returns Erişilebilirlik ayarları ve değiştirme fonksiyonları
 */
export const useAccessibility = () => {
  // Yerel depolamadan ayarları al veya varsayılan ayarları kullan
  const getInitialSettings = (): AccessibilitySettings => {
    try {
      const storedSettings = localStorage.getItem('accessibility_settings');
      return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    } catch (error) {
      console.error('Erişilebilirlik ayarları yüklenirken hata:', error);
      return defaultSettings;
    }
  };

  const [settings, setSettings] = useState<AccessibilitySettings>(getInitialSettings);

  // Ayarları yerel depolamaya kaydet
  useEffect(() => {
    try {
      localStorage.setItem('accessibility_settings', JSON.stringify(settings));
      
      // CSS değişkenlerini güncelle
      document.documentElement.style.setProperty('--font-size-base', `${settings.fontSize}px`);
      
      // Yüksek kontrast modu
      if (settings.highContrast) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      
      // Hareketi azaltma
      if (settings.reduceMotion) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
      
      // Ekran okuyucu modu
      if (settings.screenReaderMode) {
        document.body.classList.add('screen-reader-mode');
      } else {
        document.body.classList.remove('screen-reader-mode');
      }
    } catch (error) {
      console.error('Erişilebilirlik ayarları kaydedilirken hata:', error);
    }
  }, [settings]);

  // Yazı boyutunu değiştir
  const setFontSize = useCallback((size: number) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  }, []);

  // Yüksek kontrast modunu değiştir
  const setHighContrast = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, highContrast: enabled }));
  }, []);

  // Hareketi azaltma modunu değiştir
  const setReduceMotion = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, reduceMotion: enabled }));
  }, []);

  // Ekran okuyucu modunu değiştir
  const setScreenReaderMode = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, screenReaderMode: enabled }));
  }, []);

  return {
    ...settings,
    setFontSize,
    setHighContrast,
    setReduceMotion,
    setScreenReaderMode
  };
};

export default useAccessibility;
