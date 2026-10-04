import { useState } from "react";
import { useTranslation } from "react-i18next";
import SectionPanel from "../merchant/SectionPanel";
import PinInput from "../PinInput";
import { authApi } from "../../api/auth";

export default function SettingsPinSection() {
  const { t } = useTranslation();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState<{ type: "success" | "danger"; text: string } | null>(
    null,
  );
  const [pinSaving, setPinSaving] = useState(false);

  const pinLengthOk = (p: string) => p.length >= 4 && p.length <= 8;

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage(null);
    const cur = currentPin.trim();
    const next = newPin.trim();
    const confirm = confirmPin.trim();
    if (!pinLengthOk(cur)) {
      setPinMessage({ type: "danger", text: t("settings.pin.errCurrent") });
      return;
    }
    if (!pinLengthOk(next)) {
      setPinMessage({ type: "danger", text: t("settings.pin.errNew") });
      return;
    }
    if (next !== confirm) {
      setPinMessage({ type: "danger", text: t("settings.pin.errMismatch") });
      return;
    }
    if (cur === next) {
      setPinMessage({ type: "danger", text: t("settings.pin.errSame") });
      return;
    }
    setPinSaving(true);
    try {
      await authApi.changePin({ currentPin: cur, newPin: next });
      setPinMessage({ type: "success", text: t("settings.pin.success") });
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPinMessage({ type: "danger", text: msg || t("settings.pin.fail") });
    } finally {
      setPinSaving(false);
    }
  };

  return (
    <SectionPanel title={t("settings.pin.title")} icon="ti-lock" subtitle={t("settings.pin.subtitle")}>
      {pinMessage ? (
        <div className={`alert alert-${pinMessage.type === "success" ? "success" : "danger"} py-2 small`}>
          {pinMessage.text}
        </div>
      ) : null}
      <form onSubmit={handleChangePin}>
        <label className="form-label fw-semibold small">{t("settings.pin.current")}</label>
        <PinInput
          variant="form"
          className="mb-3"
          value={currentPin}
          onChange={setCurrentPin}
          autoComplete="current-password"
        />
        <label className="form-label fw-semibold small">{t("settings.pin.new")}</label>
        <PinInput
          variant="form"
          className="mb-3"
          value={newPin}
          onChange={setNewPin}
          autoComplete="new-password"
          placeholder={t("settings.pin.newPlaceholder")}
        />
        <label className="form-label fw-semibold small">{t("settings.pin.confirm")}</label>
        <PinInput
          variant="form"
          className="mb-3"
          value={confirmPin}
          onChange={setConfirmPin}
          autoComplete="new-password"
          placeholder={t("settings.pin.confirmPlaceholder")}
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
          {t("settings.pin.update")}
        </button>
      </form>
    </SectionPanel>
  );
}
