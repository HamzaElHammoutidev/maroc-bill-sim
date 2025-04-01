import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  
  // Current language from i18next
  const language = (i18n.language || 'fr').substring(0, 2) as Language;
  
  // Check if the current language is RTL
  const isRTL = language === 'ar';
  
  // Change language function
  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    
    // Set document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    
    // Set lang attribute
    document.documentElement.lang = lang;
  };
  
  // Set initial direction and lang attributes
  React.useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [isRTL, language]);
  
  // Wrap the translation function to make it compatible with the existing implementation
  const translateFunc = (key: string, params?: Record<string, any>): string => {
    return t(key, params);
  };
  
  const value = {
    language,
    setLanguage,
    t: translateFunc,
    isRTL,
  };
  
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;
