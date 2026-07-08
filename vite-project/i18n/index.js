import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    localeDetection: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    debug: false,
    // saveMissing: true, // dil dosyasında olmayan keylerin oto kayıdedilmesi
    /* keySeparator: false,
    react: {
      useSuspense: false,
    },*/
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // addPath: '/locales/add/{{lng}}/{{ns}}', // Missing keylerin kaydedileceği location
    },
    ns: [
      'common',
      'navbar',
      /*     'dashboard',
      'departments',
      'i18ntest',
      'login',
      'reports',
      'settings',
      'userDetail',
      'userEdit', */
    ],
    defaultNS: 'common',
    detection: {
      // Changed language option detection order
      // To set default lang to "en" no matter user browser requests or LanguageDetector value
      // Otherwise, LanguageDetector detects user preference language
      order: ['localStorage', 'sessionStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
