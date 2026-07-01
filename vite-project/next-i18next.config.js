/** @type {import('next-i18next').UserConfig} */
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'tr', 'fr', 'it'],
  localeDetection: false,
};

export default {
  i18n,
  localePath: './public/locales',
  //reloadOnPrerender: process.env.NODE_ENV === 'development',
};
