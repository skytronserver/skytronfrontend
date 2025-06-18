import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enCommon from '../locales/en/common.json';
import enPages from '../locales/en/pages.json';
import enForms from '../locales/en/forms.json';
import enNavigation from '../locales/en/navigation.json';
import enValidation from '../locales/en/validation.json';
import enHomepage from '../locales/en/homepage.json';
import enDashboard from '../locales/en/dashboard.json';

import hiCommon from '../locales/hi/common.json';
import hiPages from '../locales/hi/pages.json';
import hiForms from '../locales/hi/forms.json';
import hiNavigation from '../locales/hi/navigation.json';
import hiValidation from '../locales/hi/validation.json';
import hiHomepage from '../locales/hi/homepage.json';
import hiDashboard from '../locales/hi/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    pages: enPages,
    forms: enForms,
    navigation: enNavigation,
    validation: enValidation,
    homepage: enHomepage,
    dashboard: enDashboard,
  },
  hi: {
    common: hiCommon,
    pages: hiPages,
    forms: hiForms,
    navigation: hiNavigation,
    validation: hiValidation,
    homepage: hiHomepage,
    dashboard: hiDashboard,
  },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace configuration
    ns: ['common', 'pages', 'forms', 'navigation', 'validation', 'homepage', 'dashboard'],
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n; 