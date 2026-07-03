import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/en.json';
import tr from './locales/tr/tr.json';
import fr from './locales/fr/fr.json';
import it from './locales/it/it.json';

import commonEN from './locales/en/common.json';
import dashboardEN from './locales/en/dashboard.json';
import departmentsEN from './locales/en/departments.json';
import loginEN from './locales/en/login.json';
import navbarEN from './locales/en/navbar.json';
import reportsEN from './locales/en/reports.json';
import settingsEN from './locales/en/settings.json';
import userDetailEN from './locales/en/userDetail.json';
import userEditEN from './locales/en/userEdit.json';

import commonTR from './locales/tr/common.json';
import dashboardTR from './locales/tr/dashboard.json';
import departmentsTR from './locales/tr/departments.json';
import loginTR from './locales/tr/login.json';
import navbarTR from './locales/tr/navbar.json';
import reportsTR from './locales/tr/reports.json';
import settingsTR from './locales/tr/settings.json';
import userDetailTR from './locales/tr/userDetail.json';
import userEditTR from './locales/tr/userEdit.json';

import commonFR from './locales/fr/common.json';
import dashboardFR from './locales/fr/dashboard.json';
import departmentsFR from './locales/fr/departments.json';
import loginFR from './locales/fr/login.json';
import navbarFR from './locales/fr/navbar.json';
import reportsFR from './locales/fr/reports.json';
import settingsFR from './locales/fr/settings.json';
import userDetailFR from './locales/fr/userDetail.json';
import userEditFR from './locales/fr/userEdit.json';

import commonIT from './locales/it/common.json';
import dashboardIT from './locales/it/dashboard.json';
import departmentsIT from './locales/it/departments.json';
import loginIT from './locales/it/login.json';
import navbarIT from './locales/it/navbar.json';
import reportsIT from './locales/it/reports.json';
import settingsIT from './locales/it/settings.json';
import userDetailIT from './locales/it/userDetail.json';
import userEditIT from './locales/it/userEdit.json';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    localeDetection: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: commonEN,
        dashboard: dashboardEN,
        departments: departmentsEN,
        login: loginEN,
        navbar: navbarEN,
        reports: reportsEN,
        settings: settingsEN,
        userDetail: userDetailEN,
        userEdit: userEditEN,
      },
      tr: {
        common: commonTR,
        dashboard: dashboardTR,
        departments: departmentsTR,
        login: loginTR,
        navbar: navbarTR,
        reports: reportsTR,
        settings: settingsTR,
        userDetail: userDetailTR,
        userEdit: userEditTR,
      },
      fr: {
        common: commonFR,
        dashboard: dashboardFR,
        departments: departmentsFR,
        login: loginFR,
        navbar: navbarFR,
        reports: reportsFR,
        settings: settingsFR,
        userDetail: userDetailFR,
        userEdit: userEditFR,
      },
      it: {
        common: commonIT,
        dashboard: dashboardIT,
        departments: departmentsIT,
        login: loginIT,
        navbar: navbarIT,
        reports: reportsIT,
        settings: settingsIT,
        userDetail: userDetailIT,
        userEdit: userEditIT,
      },
    },
    ns: [
      'common',
      'dashboard',
      'departments',
      'login',
      'navbar',
      'reports',
      'settings',
      'userDetail',
      'userEdit',
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
