import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en/common.json';
import hi from './hi/common.json';
import pa from './pa/common.json';
import mwr from './mwr/common.json';
import bgr from './bgr/common.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: {translation: en},
    hi: {translation: hi},
    pa: {translation: pa},
    mwr: {translation: mwr},
    bgr: {translation: bgr},
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {escapeValue: false},
});

export const t = (key: string, options?: Record<string, unknown>) =>
  i18n.t(key, options);

export default i18n;
