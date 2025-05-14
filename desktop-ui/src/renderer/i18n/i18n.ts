import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

/**
 * Initialize i18n
 */
i18n
  // Load translations from backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18n
  .init({
    // Default language
    fallbackLng: 'en',
    // Debug mode
    debug: process.env.NODE_ENV === 'development',
    // Default namespace
    defaultNS: 'translation',
    // Namespaces
    ns: ['translation'],
    // Interpolation
    interpolation: {
      // React already escapes values
      escapeValue: false,
    },
    // Backend options
    backend: {
      // Translation files path
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    // Language detector options
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator'],
      // Cache user language
      caches: ['localStorage'],
      // Local storage key
      lookupLocalStorage: 'i18nextLng',
    },
    // React options
    react: {
      // Wait for translations to be loaded
      wait: true,
      // Use Suspense for loading
      useSuspense: true,
    },
  });

export default i18n;
