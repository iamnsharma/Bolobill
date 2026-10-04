import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, loadStoredLocale } from "./config";
import enIN from "./locales/en-IN.json";
import enUS from "./locales/en-US.json";
import enGB from "./locales/en-GB.json";
import hi from "./locales/hi.json";
import pa from "./locales/pa.json";
import es from "./locales/es.json";

const initialLocale = loadStoredLocale();

function applyDocumentLang(code: string) {
  document.documentElement.lang = code;
}

applyDocumentLang(initialLocale);

void i18n.use(initReactI18next).init({
  resources: {
    "en-IN": { translation: enIN },
    "en-US": { translation: enUS },
    "en-GB": { translation: enGB },
    hi: { translation: hi },
    pa: { translation: pa },
    es: { translation: es },
  },
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export { changeAppLocale } from "./localeActions";

export default i18n;
