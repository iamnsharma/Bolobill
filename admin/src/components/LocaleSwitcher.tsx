import { useTranslation } from "react-i18next";
import { useLocale } from "../i18n/useLocale";
import type { AppLocale } from "../i18n/config";

type LocaleSwitcherProps = {
  variant?: "compact" | "list";
  className?: string;
};

export default function LocaleSwitcher({ variant = "compact", className = "" }: LocaleSwitcherProps) {
  const { t } = useTranslation();
  const { locale, meta, locales, setLocale } = useLocale();

  if (variant === "list") {
    return (
      <ul className={`list-group list-group-flush settings-locale-list ${className}`.trim()}>
        {locales.map((item) => {
          const active = item.code === locale;
          return (
            <li key={item.code}>
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 settings-locale-list__item${active ? " active" : ""}`}
                onClick={() => setLocale(item.code)}
              >
                <span className="settings-locale-list__flag" aria-hidden>{item.flag}</span>
                <span className="flex-grow-1 text-start">{item.nativeName}</span>
                {active ? <i className="ti ti-check text-primary" aria-hidden /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={`dropdown locale-switcher ${className}`.trim()}>
      <button
        type="button"
        className="btn btn-light btn-sm locale-switcher__btn d-flex align-items-center gap-1"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={t("common.changeLanguage")}
        title={meta.nativeName}
      >
        <span className="locale-switcher__flag" aria-hidden>{meta.flag}</span>
        <span className="locale-switcher__code d-none d-sm-inline">{meta.shortCode}</span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end locale-switcher__menu">
        {locales.map((item) => {
          const active = item.code === locale;
          return (
            <li key={item.code}>
              <button
                type="button"
                className={`dropdown-item d-flex align-items-center gap-2${active ? " active" : ""}`}
                onClick={() => setLocale(item.code as AppLocale)}
              >
                <span aria-hidden>{item.flag}</span>
                <span className="flex-grow-1">{item.nativeName}</span>
                {active ? <i className="ti ti-check ms-auto" aria-hidden /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
