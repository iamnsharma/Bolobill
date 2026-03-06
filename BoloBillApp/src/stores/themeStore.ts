import {create} from 'zustand';
import {darkTheme, lightTheme, AppTheme} from '../styling/globalStyles/theme';
import {storage} from '../utils/storage/mmkv';
import {STORAGE_KEYS} from '../utils/storage/keys';

type ThemeMode = 'light' | 'dark';

type ThemeState = {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  initializeTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  theme: lightTheme,
  toggleTheme: () => {
    const nextDark = !get().isDark;
    const mode: ThemeMode = nextDark ? 'dark' : 'light';
    storage.set(STORAGE_KEYS.THEME_MODE, mode);
    set({isDark: nextDark, theme: nextDark ? darkTheme : lightTheme});
  },
  setTheme: mode => {
    const dark = mode === 'dark';
    storage.set(STORAGE_KEYS.THEME_MODE, mode);
    set({isDark: dark, theme: dark ? darkTheme : lightTheme});
  },
  initializeTheme: () => {
    const saved = storage.getString(STORAGE_KEYS.THEME_MODE) as
      | ThemeMode
      | undefined;
    const dark = saved === 'dark';
    set({isDark: dark, theme: dark ? darkTheme : lightTheme});
  },
}));
