export const LOCALE_STORAGE_KEY = "bolobill_locale_v1";

export type AppLocale = "en-IN" | "en-US" | "en-GB" | "hi" | "pa" | "es";

export type LocaleMeta = {
  code: AppLocale;
  flag: string;
  nativeName: string;
  shortCode: string;
};

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: "en-IN", flag: "🇮🇳", nativeName: "English (India)", shortCode: "EN" },
  { code: "en-US", flag: "🇺🇸", nativeName: "English (US)", shortCode: "US" },
  { code: "en-GB", flag: "🇬🇧", nativeName: "English (UK)", shortCode: "UK" },
  { code: "hi", flag: "🇮🇳", nativeName: "हिन्दी", shortCode: "HI" },
  { code: "pa", flag: "🇮🇳", nativeName: "ਪੰਜਾਬੀ", shortCode: "PA" },
  { code: "es", flag: "🇪🇸", nativeName: "Español", shortCode: "ES" },
];

export const DEFAULT_LOCALE: AppLocale = "en-IN";

export function isAppLocale(value: string): value is AppLocale {
  return SUPPORTED_LOCALES.some((l) => l.code === value);
}

export function getLocaleMeta(code: string): LocaleMeta {
  return SUPPORTED_LOCALES.find((l) => l.code === code) ?? SUPPORTED_LOCALES[0];
}

export function loadStoredLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && isAppLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

export function persistLocale(code: AppLocale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  } catch {
    /* ignore */
  }
}
