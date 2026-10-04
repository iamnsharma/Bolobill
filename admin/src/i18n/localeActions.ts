import i18n from "i18next";
import { persistLocale, type AppLocale } from "./config";

export function changeAppLocale(code: AppLocale) {
  persistLocale(code);
  document.documentElement.lang = code;
  return i18n.changeLanguage(code);
}
