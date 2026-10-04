import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { changeAppLocale } from "./localeActions";
import type { AppLocale } from "./config";
import { getLocaleMeta, SUPPORTED_LOCALES } from "./config";

export function useLocale() {
  const { i18n } = useTranslation();
  const code = i18n.language;
  const meta = getLocaleMeta(code);

  const setLocale = useCallback((next: AppLocale) => {
    void changeAppLocale(next);
  }, []);

  return {
    locale: code as AppLocale,
    meta,
    locales: SUPPORTED_LOCALES,
    setLocale,
  };
}
