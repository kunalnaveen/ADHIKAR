import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, AppSettings } from '../types';
import { t as translateText, translateNumber, getLanguageDetails } from '../utils/translate';
import { translations, TranslationDictionary } from '../data/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
  tNum: (num: number | string) => string;
  dict: TranslationDictionary;
  languageDetails: { code: Language; name: string; native: string; bcp47: string };
  availableLanguages: Array<{ code: Language; name: string; native: string; bcp47: string }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const AVAILABLE_LANGUAGES: Array<{ code: Language; name: string; native: string; bcp47: string }> = [
  { code: 'EN', name: 'English', native: 'English', bcp47: 'en-IN' },
  { code: 'HI', name: 'Hindi', native: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'TA', name: 'Tamil', native: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'TE', name: 'Telugu', native: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'ML', name: 'Malayalam', native: 'മലയാളം', bcp47: 'ml-IN' },
  { code: 'KN', name: 'Kannada', native: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'BN', name: 'Bengali', native: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'MR', name: 'Marathi', native: 'मराठी', bcp47: 'mr-IN' },
  { code: 'GU', name: 'Gujarati', native: 'ગુજરાતી', bcp47: 'gu-IN' },
  { code: 'PA', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  { code: 'UR', name: 'Urdu', native: 'اردو', bcp47: 'ur-IN' },
  { code: 'OR', name: 'Odia', native: 'ଓଡ଼ିଆ', bcp47: 'or-IN' },
  { code: 'AS', name: 'Assamese', native: 'অসমীয়া', bcp47: 'as-IN' },
  { code: 'BHO', name: 'Bhojpuri', native: 'भोजपुरी', bcp47: 'hi-IN' },
  { code: 'MAI', name: 'Maithili', native: 'मैथिली', bcp47: 'hi-IN' },
];

export const LanguageProvider: React.FC<{
  children: ReactNode;
  initialLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}> = ({ children, initialLanguage = 'EN', onLanguageChange }) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    onLanguageChange?.(newLang);
    try {
      localStorage.setItem('adhikar_user_language', newLang);
    } catch (e) {
      // safe fallback
    }
  };

  const t = (text: string) => translateText(text, language);
  const tNum = (num: number | string) => translateNumber(num, language);
  const dict = translations[language] || translations.EN;
  const languageDetails = getLanguageDetails(language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tNum,
        dict,
        languageDetails,
        availableLanguages: AVAILABLE_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside LanguageProvider
    return {
      language: 'EN',
      setLanguage: () => {},
      t: (text: string) => text,
      tNum: (num: number | string) => String(num),
      dict: translations.EN,
      languageDetails: AVAILABLE_LANGUAGES[0],
      availableLanguages: AVAILABLE_LANGUAGES,
    };
  }
  return context;
};
