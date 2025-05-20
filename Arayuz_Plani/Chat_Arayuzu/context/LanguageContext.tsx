import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n, Language, TranslationNamespace, t } from '../services/i18n';

// Language context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (namespace: TranslationNamespace, key: string, params?: { [key: string]: string }) => string;
  availableLanguages: { code: Language; name: string }[];
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Language provider props
interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * LanguageProvider component for providing language context to the application
 * 
 * @param children - Child components
 */
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(i18n.getLanguage());
  const [availableLanguages, setAvailableLanguages] = useState(i18n.getAvailableLanguages());
  
  // Update language state when it changes
  useEffect(() => {
    const handleLanguageChange = (newLanguage: Language) => {
      setLanguageState(newLanguage);
    };
    
    i18n.addListener(handleLanguageChange);
    
    return () => {
      i18n.removeListener(handleLanguageChange);
    };
  }, []);
  
  // Set language
  const setLanguage = async (newLanguage: Language) => {
    await i18n.setLanguage(newLanguage);
  };
  
  // Context value
  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages,
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * useLanguage hook for accessing language context
 * 
 * @returns Language context
 */
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
