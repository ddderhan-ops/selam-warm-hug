import { useState, useEffect, useCallback } from 'react';
import { Language, detectBrowserLanguage, getTranslations, isRTL, type Translations } from '@/lib/i18n';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language | null;
      if (stored && ['tr', 'en', 'de', 'fr', 'ar'].includes(stored)) {
        return stored;
      }
      return detectBrowserLanguage();
    }
    return 'tr';
  });

  const [translations, setTranslations] = useState<Translations>(() => getTranslations(language));

  useEffect(() => {
    setTranslations(getTranslations(language));
    localStorage.setItem('language', language);
    
    // Update document direction for RTL languages
    document.documentElement.dir = isRTL(language) ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  return {
    language,
    setLanguage,
    t: translations,
    isRTL: isRTL(language),
  };
}
