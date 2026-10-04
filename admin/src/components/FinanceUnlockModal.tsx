import { useState } from "react";
import { useTranslation } from "react-i18next";
import PinInput from "./PinInput";

type Props = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
};

export default function FinanceUnlockModal({ open, busy, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = pin.trim();
    if (trimmed.length < 4 || trimmed.length > 8) {
      setError(t("finance.unlock.errPinLength"));
      return;
    }
    try {
      await onSubmit(trimmed);
      setPin("");
      setError(null);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("finance.unlock.errInvalid"));
    }
  };

  const handleClose = () => {
    if (busy) return;
    setPin("");
    setError(null);
    onClose();
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{t("finance.unlock.title")}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t("common.close")}
                  onClick={handleClose}
                  disabled={busy}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">{t("finance.unlock.hint")}</p>
                {error ? (
                  <div className="alert alert-danger py-2 small" role="alert">{error}</div>
                ) : null}
                <label className="form-label fw-semibold small">{t("finance.unlock.pinLabel")}</label>
                <PinInput
                  variant="form"
                  value={pin}
                  onChange={setPin}
                  autoComplete="current-password"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={handleClose} disabled={busy}>
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? t("common.saving") : t("finance.unlock.confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}
