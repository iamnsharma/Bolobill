import { useState } from "react";
import { useTranslation } from "react-i18next";
import PinInput from "./PinInput";

type Props = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (inventoryPin: string) => Promise<void>;
};

export default function FinanceInventoryPinSetupModal({ open, busy, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const a = pin.trim();
    const b = confirm.trim();
    if (a.length < 4 || a.length > 8) {
      setError(t("finance.inventoryPin.errPinLength"));
      return;
    }
    if (a !== b) {
      setError(t("finance.inventoryPin.errMismatch"));
      return;
    }
    try {
      await onSubmit(a);
      setPin("");
      setConfirm("");
      setError(null);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("finance.hideFailed"));
    }
  };

  const handleClose = () => {
    if (busy) return;
    setPin("");
    setConfirm("");
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
                <h5 className="modal-title">{t("finance.inventoryPin.setupTitle")}</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t("common.close")}
                  onClick={handleClose}
                  disabled={busy}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">{t("finance.inventoryPin.setupHint")}</p>
                {error ? (
                  <div className="alert alert-danger py-2 small" role="alert">{error}</div>
                ) : null}
                <label className="form-label fw-semibold small">{t("finance.inventoryPin.newLabel")}</label>
                <PinInput
                  variant="form"
                  className="mb-3"
                  value={pin}
                  onChange={setPin}
                  autoComplete="new-password"
                />
                <label className="form-label fw-semibold small">{t("finance.inventoryPin.confirmLabel")}</label>
                <PinInput
                  variant="form"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={handleClose} disabled={busy}>
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? t("common.saving") : t("finance.inventoryPin.saveAndHide")}
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
