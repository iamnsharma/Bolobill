import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SectionPanel from "../merchant/SectionPanel";
import {
  DEFAULT_SHOP_SETTINGS,
  SHOP_SETTINGS_FIELD_PLACEHOLDERS,
  useShopSettings,
} from "../../contexts/ShopSettingsContext";

export default function SettingsBrandingSection() {
  const { t } = useTranslation();
  const { settings, setSettings } = useShopSettings();
  const [draftName, setDraftName] = useState(settings.storeName);
  const [draftTagline, setDraftTagline] = useState(settings.storeTagline);

  useEffect(() => {
    setDraftName(settings.storeName);
    setDraftTagline(settings.storeTagline);
  }, [settings.storeName, settings.storeTagline]);

  const storeDraftDirty =
    draftName.trim() !== settings.storeName || draftTagline.trim() !== settings.storeTagline;

  const applyStoreBranding = () => {
    setSettings({
      storeName: draftName.trim() || DEFAULT_SHOP_SETTINGS.storeName,
      storeTagline: draftTagline.trim(),
    });
  };

  return (
    <SectionPanel
      title={t("settings.branding.title")}
      icon="ti-building-store"
      subtitle={t("settings.branding.subtitle")}
    >
      <label className="form-label fw-semibold small">{t("settings.branding.storeName")}</label>
      <input
        type="text"
        className="form-control mb-3"
        placeholder={SHOP_SETTINGS_FIELD_PLACEHOLDERS.storeName}
        value={draftName}
        maxLength={40}
        onChange={(e) => setDraftName(e.target.value)}
      />
      <label className="form-label fw-semibold small">{t("settings.branding.tagline")}</label>
      <input
        type="text"
        className="form-control mb-3"
        placeholder={SHOP_SETTINGS_FIELD_PLACEHOLDERS.storeTagline}
        value={draftTagline}
        maxLength={48}
        onChange={(e) => setDraftTagline(e.target.value)}
      />
      <div className="d-flex flex-wrap gap-2 align-items-center">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={applyStoreBranding}
          disabled={!storeDraftDirty}
        >
          {t("settings.branding.apply")}
        </button>
        {storeDraftDirty ? (
          <span className="small text-muted">{t("settings.branding.unsaved")}</span>
        ) : null}
      </div>
    </SectionPanel>
  );
}
