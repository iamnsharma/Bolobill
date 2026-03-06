import {create} from 'zustand';
import i18n from '../lang';
import {storage} from '../utils/storage/mmkv';
import {STORAGE_KEYS} from '../utils/storage/keys';

export type AppLanguage = 'en' | 'hi' | 'pa' | 'mwr' | 'bgr';

type LanguageState = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  initializeLanguage: () => void;
};

export const useLanguageStore = create<LanguageState>(set => ({
  language: 'en',
  setLanguage: lang => {
    storage.set(STORAGE_KEYS.LANGUAGE, lang);
    i18n.changeLanguage(lang);
    set({language: lang});
  },
  initializeLanguage: () => {
    const saved = storage.getString(STORAGE_KEYS.LANGUAGE) as
      | AppLanguage
      | undefined;
    const lang = saved ?? 'en';
    i18n.changeLanguage(lang);
    set({language: lang});
  },
}));
