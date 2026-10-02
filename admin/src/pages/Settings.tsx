import { useEffect, useState } from "react";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import { authApi } from "../api/auth";
import {
  DEFAULT_SHOP_SETTINGS,
  useShopSettings,
  type ThemeColorCount,
} from "../contexts/ShopSettingsContext";

const COLOR_COUNT_OPTIONS: { value: ThemeColorCount; label: string }[] = [
  { value: 1, label: "1 color" },
  { value: 2, label: "2 colors" },
  { value: 3, label: "3 colors" },
  { value: 4, label: "4 colors" },
];

const COLOR_LABELS = ["Primary", "Accent", "Highlight", "Warm"];

export default function Settings() {
  const { settings, setSettings, resetSettings, resetToDefaults } = useShopSettings();
  const count = settings.themeColorCount;

  const [draftName, setDraftName] = useState(settings.storeName);
  const [draftTagline, setDraftTagline] = useState(settings.storeTagline);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [pinSaving, setPinSaving] = useState(false);

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

  const handleResetToDefaults = () => {
    resetToDefaults();
    setDraftName(DEFAULT_SHOP_SETTINGS.storeName);
    setDraftTagline(DEFAULT_SHOP_SETTINGS.storeTagline);
  };

  const pinLengthOk = (p: string) => p.length >= 4 && p.length <= 8;

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);
    const cur = currentPin.trim();
    const next = newPin.trim();
    const confirm = confirmPin.trim();
    if (!pinLengthOk(cur)) {
      setPinMessage({ type: "danger", text: "Enter your current PIN (4–8 digits)." });
      return;
    }
    if (!pinLengthOk(next)) {
      setPinMessage({ type: "danger", text: "New PIN must be 4–8 characters." });
      return;
    }
    if (next !== confirm) {
      setPinMessage({ type: "danger", text: "New PIN and confirmation do not match." });
      return;
    }
    if (cur === next) {
      setPinMessage({ type: "danger", text: "New PIN must be different from your current PIN." });
      return;
    }
    setPinSaving(true);
    try {
      await authApi.changePin({ currentPin: cur, newPin: next });
      setPinMessage({ type: "success", text: "PIN updated. Use the new PIN next time you sign in." });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPinMessage({ type: "danger", text: msg || "Could not change PIN." });
    } finally {
      setPinSaving(false);
    }
  };

  const previewName = storeDraftDirty ? draftName.trim() || DEFAULT_SHOP_SETTINGS.storeName : settings.storeName;
  const previewTagline = storeDraftDirty ? draftTagline.trim() : settings.storeTagline;

  return (
    <PageShell>
      <PageHeader
        title="Settings"
        subtitle="Customize how this panel looks on your device. Store name updates only when you tap Apply."
        icon="ti-settings"
        actions={
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleResetToDefaults}>
            Reset to BoloBill defaults
          </button>
        }
      />

      <div className="row g-4">
        <div className="col-lg-6">
          <SectionPanel title="Login PIN" icon="ti-lock" subtitle="Change the PIN BoloBill shared with you">
            {pinMessage ? (
              <div className={`alert alert-${pinMessage.type === "success" ? "success" : "danger"} py-2 small`}>
                {pinMessage.text}
              </div>
            ) : null}
            <form onSubmit={handleChangePin}>
              <label className="form-label fw-semibold small">Current PIN</label>
              <input
                type="password"
                className="form-control mb-3"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                autoComplete="current-password"
                maxLength={8}
              />
              <label className="form-label fw-semibold small">New PIN</label>
              <input
                type="password"
                className="form-control mb-3"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                autoComplete="new-password"
                maxLength={8}
              />
              <label className="form-label fw-semibold small">Confirm new PIN</label>
              <input
                type="password"
                className="form-control mb-3"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                autoComplete="new-password"
                maxLength={8}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={
                  pinSaving ||
                  !pinLengthOk(currentPin.trim()) ||
                  !pinLengthOk(newPin.trim()) ||
                  newPin.trim() !== confirmPin.trim()
                }
              >
                {pinSaving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Update PIN
              </button>
            </form>
          </SectionPanel>
        </div>

        <div className="col-lg-6">
          <SectionPanel
            title="Your store"
            icon="ti-building-store"
            subtitle="Sidebar and header show these after you apply"
          >
            <label className="form-label fw-semibold small">Store name</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder={DEFAULT_SHOP_SETTINGS.storeName}
              value={draftName}
              maxLength={40}
              onChange={(e) => setDraftName(e.target.value)}
            />
            <label className="form-label fw-semibold small">Tagline (optional)</label>
            <input
              type="text"
              className="form-control mb-3"
              placeholder={DEFAULT_SHOP_SETTINGS.storeTagline}
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
                Apply store name
              </button>
              {storeDraftDirty ? (
                <span className="small text-muted">Not saved yet — sidebar still shows the current name.</span>
              ) : null}
            </div>
          </SectionPanel>
        </div>

        <div className="col-lg-6">
          <SectionPanel
            title="Theme preview"
            icon="ti-palette"
            actions={
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetSettings}>
                Reset theme colors only
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
            <p className="small text-muted mb-0">
              Color changes apply immediately. Use <strong>Reset to BoloBill defaults</strong> above for name,
              tagline, and orange/green theme together.
            </p>
          </SectionPanel>
        </div>

        <div className="col-12">
          <SectionPanel title="Theme colors" icon="ti-color-swatch" subtitle="Pick 1 to 4 brand colors">
            <div className="d-flex flex-wrap gap-2 mb-4">
              {COLOR_COUNT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`btn btn-sm ${count === opt.value ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setSettings({ themeColorCount: opt.value })}
                >
                  {opt.label}
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
                      aria-label={`${COLOR_LABELS[i]} color`}
                    />
                    {COLOR_LABELS[i]}
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
        </div>
      </div>
    </PageShell>
  );
}
