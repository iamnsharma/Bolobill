import { useState } from "react";
import { useTranslation } from "react-i18next";
import AppModal from "../AppModal";

export default function AiVisionPinModal({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = pin.trim();
    if (!value) {
      setError(t("pages.aiVisionPin.required"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const ok = await onSubmit(value);
      if (!ok) {
        setError(t("pages.aiVisionPin.wrong"));
        return;
      }
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppModal
      show={open}
      title={t("pages.aiVisionPin.title")}
      onClose={() => {
        if (!submitting && !busy) {
          setPin("");
          setError(null);
          onClose();
        }
      }}
      size="md"
    >
      <p className="small text-muted mb-3">{t("pages.aiVisionPin.hint")}</p>
      <form onSubmit={handleSubmit}>
        <label className="form-label fw-semibold small" htmlFor="ai-vision-demo-pin">
          {t("pages.aiVisionPin.label")}
        </label>
        <input
          id="ai-vision-demo-pin"
          type="password"
          className={`form-control${error ? " is-invalid" : ""}`}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError(null);
          }}
          autoComplete="off"
          autoFocus
          inputMode="numeric"
        />
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}
        <div className="d-flex gap-2 justify-content-end mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={submitting || busy}
          >
            {t("common.cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || busy}>
            {submitting ? t("common.loading") : t("pages.aiVisionPin.submit")}
          </button>
        </div>
      </form>
    </AppModal>
  );
}
