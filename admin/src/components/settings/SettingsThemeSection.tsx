import { useTranslation } from "react-i18next";
import SectionPanel from "../merchant/SectionPanel";
import { useShopSettings, type ThemeColorCount } from "../../contexts/ShopSettingsContext";

const COLOR_COUNT_KEYS: { value: ThemeColorCount; key: string }[] = [
  { value: 1, key: "settings.theme.colorCount1" },
  { value: 2, key: "settings.theme.colorCount2" },
  { value: 3, key: "settings.theme.colorCount3" },
  { value: 4, key: "settings.theme.colorCount4" },
];

const COLOR_LABEL_KEYS = [
  "settings.theme.primary",
  "settings.theme.accent",
  "settings.theme.highlight",
  "settings.theme.warm",
];

export default function SettingsThemeSection({
  previewName,
  previewTagline,
}: {
  previewName: string;
  previewTagline: string;
}) {
  const { t } = useTranslation();
  const { settings, setSettings, resetSettings } = useShopSettings();
  const count = settings.themeColorCount;

  return (
    <>
      <SectionPanel
        title={t("settings.theme.previewTitle")}
        icon="ti-palette"
        actions={
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetSettings}>
            {t("settings.theme.resetColors")}
          </button>
        }
      >
        <div
          className="merchant-theme-preview mb-3"
          style={{
            background: `linear-gradient(135deg, ${settings.colors[0]} 0%, ${
              count >= 2 ? settings.colors[1] : settings.colors[0]
            } 50%, ${count >= 3 ? settings.colors[2] : settings.colors[0]} 100%)`,
          }}
        >
          <span className="merchant-theme-preview__name">{previewName}</span>
          <span className="merchant-theme-preview__tag">{previewTagline}</span>
        </div>
        <p className="small text-muted mb-0">{t("settings.theme.previewHint")}</p>
      </SectionPanel>

      <SectionPanel
        title={t("settings.theme.colorsTitle")}
        icon="ti-color-swatch"
        subtitle={t("settings.theme.colorsSubtitle")}
        className="mt-4"
      >
        <div className="d-flex flex-wrap gap-2 mb-4">
          {COLOR_COUNT_KEYS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`btn btn-sm ${count === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSettings({ themeColorCount: opt.value })}
            >
              {t(opt.key)}
            </button>
          ))}
        </div>

        <div className="row g-3">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="col-sm-6 col-md-3">
              <label className="form-label small fw-semibold d-flex align-items-center gap-2">
                <input
                  type="color"
                  className="form-control form-control-color merchant-color-input"
                  value={settings.colors[i]}
                  onChange={(e) => {
                    const colors = [...settings.colors] as typeof settings.colors;
                    colors[i] = e.target.value;
                    setSettings({ colors });
                  }}
                  aria-label={t(COLOR_LABEL_KEYS[i])}
                />
                {t(COLOR_LABEL_KEYS[i])}
              </label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                value={settings.colors[i]}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  if (!/^#[0-9A-Fa-f]{6}$/.test(v)) return;
                  const colors = [...settings.colors] as typeof settings.colors;
                  colors[i] = v;
                  setSettings({ colors });
                }}
              />
            </div>
          ))}
        </div>
      </SectionPanel>
    </>
  );
}
