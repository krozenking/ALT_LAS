import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Language interface
 */
export interface Language {
  /**
   * Language code
   */
  code: string;
  /**
   * Language name
   */
  name: string;
  /**
   * Language flag
   */
  flag?: string;
  /**
   * Language direction
   */
  dir?: 'ltr' | 'rtl';
}

/**
 * Available languages
 */
export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
];

/**
 * Hook for language management
 * @returns Language management functions and state
 */
export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    AVAILABLE_LANGUAGES.find(lang => lang.code === i18n.language) || AVAILABLE_LANGUAGES[0]
  );

  /**
   * Change language
   * @param languageCode Language code
   */
  const changeLanguage = useCallback(
    async (languageCode: string) => {
      try {
        await i18n.changeLanguage(languageCode);
        const newLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
        if (newLanguage) {
          setCurrentLanguage(newLanguage);
          
          // Set document direction
          document.documentElement.dir = newLanguage.dir || 'ltr';
          
          // Set document language
          document.documentElement.lang = newLanguage.code;
          
          // Store language in localStorage
          localStorage.setItem('i18nextLng', languageCode);
        }
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    },
    [i18n]
  );

  /**
   * Get language name
   * @param languageCode Language code
   * @returns Language name
   */
  const getLanguageName = useCallback(
    (languageCode: string) => {
      const language = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
      if (language) {
        return language.name;
      }
      return t(`languages.${languageCode}`, { defaultValue: languageCode });
    },
    [t]
  );

  /**
   * Get language flag
   * @param languageCode Language code
   * @returns Language flag
   */
  const getLanguageFlag = useCallback(
    (languageCode: string) => {
      const language = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
      return language?.flag || '';
    },
    []
  );

  /**
   * Get language direction
   * @param languageCode Language code
   * @returns Language direction
   */
  const getLanguageDirection = useCallback(
    (languageCode: string) => {
      const language = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode);
      return language?.dir || 'ltr';
    },
    []
  );

  // Set document direction and language on mount
  useEffect(() => {
    document.documentElement.dir = currentLanguage.dir || 'ltr';
    document.documentElement.lang = currentLanguage.code;
  }, [currentLanguage]);

  return {
    currentLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
    changeLanguage,
    getLanguageName,
    getLanguageFlag,
    getLanguageDirection,
  };
};

export default useLanguage;
