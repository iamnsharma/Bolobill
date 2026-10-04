import { useTranslation } from "react-i18next";
import SectionPanel from "../merchant/SectionPanel";
import LocaleSwitcher from "../LocaleSwitcher";
import { useLocale } from "../../i18n/useLocale";

export default function SettingsLanguageSection() {
  const { t } = useTranslation();
  const { meta } = useLocale();

  return (
    <SectionPanel title={t("settings.tiles.language.title")} icon="ti-language" subtitle={t("common.languageHint")}>
      <p className="small text-muted mb-3">
        <strong>{t("common.currentLanguage")}:</strong> {meta.flag} {meta.nativeName}
      </p>
      <LocaleSwitcher variant="list" />
    </SectionPanel>
  );
}
