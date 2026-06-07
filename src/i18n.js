import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import locales directly
import en from './locales/en.json';
import hi from './locales/hi.json';
import es from './locales/es.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      es: { translation: es },
      ta: { translation: ta },
      te: { translation: te },
      mr: { translation: mr }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
