import { useState, useEffect, useCallback } from 'react';

// Dil dosyalarını içe aktar
import trTranslations from '../locales/tr.json';
import enTranslations from '../locales/en.json';

// Desteklenen diller
export type Language = 'tr' | 'en';

// Çeviri dosyaları
const translations = {
  tr: trTranslations,
  en: enTranslations
};

/**
 * Çeviri hook'u
 * @param initialLang Başlangıç dili
 * @returns Çeviri fonksiyonu ve dil değiştirme fonksiyonu
 */
export const useTranslation = (initialLang: Language = 'tr') => {
  // Tarayıcı dilini al
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'tr';
  };

  // Yerel depolamadan dil tercihini al veya tarayıcı dilini kullan
  const getInitialLanguage = (): Language => {
    const storedLang = localStorage.getItem('language') as Language;
    return storedLang || initialLang || getBrowserLanguage();
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage());

  // Dil değiştirme fonksiyonu
  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, []);

  // Dil değiştiğinde HTML lang özelliğini güncelle
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Çeviri fonksiyonu
   * @param key Çeviri anahtarı (nokta notasyonu ile, örn: 'common.send')
   * @param params Çeviri parametreleri
   * @returns Çevrilmiş metin
   */
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    // Anahtarı parçalara ayır
    const keys = key.split('.');
    
    // Çeviri nesnesinde ilgili değeri bul
    let translation: unknown = translations[language];
    
    for (const k of keys) {
      if (!translation || !translation[k]) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      translation = translation[k];
    }
    
    // Eğer çeviri bulunamazsa, anahtarı döndür
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }
    
    // Eğer çeviri bir string değilse, anahtarı döndür
    if (typeof translation !== 'string') {
      console.warn(`Translation for key ${key} is not a string`);
      return key;
    }
    
    // Parametreleri değiştir
    if (params) {
      return Object.entries(params).reduce((text, [paramKey, paramValue]) => {
        return text.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, translation);
    }
    
    return translation;
  }, [language]);

  return { t, language, changeLanguage };
};

export default useTranslation;
