import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageShell from "../../components/merchant/PageShell";
import PageHeader from "../../components/merchant/PageHeader";
import SettingsHubTile from "../../components/settings/SettingsHubTile";
import SettingsPinSection from "../../components/settings/SettingsPinSection";
import SettingsBrandingSection from "../../components/settings/SettingsBrandingSection";
import SettingsThemeSection from "../../components/settings/SettingsThemeSection";
import SettingsLanguageSection from "../../components/settings/SettingsLanguageSection";
import {
  DEFAULT_SHOP_SETTINGS,
  useShopSettings,
} from "../../contexts/ShopSettingsContext";

export type SettingsSection = "pin" | "branding" | "theme" | "language";

const SECTIONS: SettingsSection[] = ["pin", "branding", "theme", "language"];

function isSettingsSection(value: string | null): value is SettingsSection {
  return value != null && SECTIONS.includes(value as SettingsSection);
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramSection = searchParams.get("section");
  const [section, setSection] = useState<SettingsSection | null>(
    isSettingsSection(paramSection) ? paramSection : "pin",
  );
  const { settings, resetToDefaults } = useShopSettings();

  useEffect(() => {
    if (isSettingsSection(paramSection)) {
      setSection(paramSection);
    }
  }, [paramSection]);

  const selectSection = (next: SettingsSection) => {
    setSection(next);
    setSearchParams({ section: next }, { replace: true });
  };

  const handleResetToDefaults = () => {
    resetToDefaults();
  };

  const previewName = settings.storeName || DEFAULT_SHOP_SETTINGS.storeName;
  const previewTagline = settings.storeTagline;

  const tiles: { id: SettingsSection; icon: string; titleKey: string; descKey: string }[] = [
    {
      id: "pin",
      icon: "ti-lock",
      titleKey: "settings.tiles.pin.title",
      descKey: "settings.tiles.pin.description",
    },
    {
      id: "branding",
      icon: "ti-building-store",
      titleKey: "settings.tiles.branding.title",
      descKey: "settings.tiles.branding.description",
    },
    {
      id: "theme",
      icon: "ti-palette",
      titleKey: "settings.tiles.theme.title",
      descKey: "settings.tiles.theme.description",
    },
    {
      id: "language",
      icon: "ti-language",
      titleKey: "settings.tiles.language.title",
      descKey: "settings.tiles.language.description",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
        icon="ti-settings"
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleResetToDefaults}>
            {t("settings.resetDefaults")}
          </button>
        }
      />

      <div className="settings-hub-layout">
        <div className="settings-hub-tiles">
          {tiles.map((tile) => (
            <SettingsHubTile
              key={tile.id}
              icon={tile.icon}
              title={t(tile.titleKey)}
              description={t(tile.descKey)}
              active={section === tile.id}
              onClick={() => selectSection(tile.id)}
            />
          ))}
        </div>

        <div className="settings-hub-detail" id="settings-section-detail">
          {section === "pin" && <SettingsPinSection />}
          {section === "branding" && <SettingsBrandingSection />}
          {section === "theme" && (
            <SettingsThemeSection previewName={previewName} previewTagline={previewTagline} />
          )}
          {section === "language" && <SettingsLanguageSection />}
        </div>
      </div>
    </PageShell>
  );
}
