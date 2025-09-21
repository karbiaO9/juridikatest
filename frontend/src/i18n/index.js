import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../locales/en/translation.json';
import arTranslation from '../locales/ar/translation.json';

// the translations
const resources = {
  en: {
    translation: enTranslation
  },
  ar: {
    translation: arTranslation
  }
};

i18n
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    lng: 'ar', // default language
    fallbackLng: 'en', // fallback to English

    interpolation: {
      escapeValue: false // react already does escaping
    }
  });

  // Ensure the document direction matches the current language (RTL for Arabic)
  const applyDirection = (lng) => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      // also toggle a class for more granular CSS if needed
      document.documentElement.classList.toggle('lang-ar', lng === 'ar');
      document.documentElement.classList.toggle('lang-en', lng !== 'ar');
    }
  };

  applyDirection(i18n.language || 'ar');

  // React to future language changes
  i18n.on('languageChanged', (lng) => {
    applyDirection(lng);
  });

  export default i18n;
