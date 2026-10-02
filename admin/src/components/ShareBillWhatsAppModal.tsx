import { useState, useEffect } from "react";
import type { AdminInvoice } from "../api/admin";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import { useShopSettings } from "../contexts/ShopSettingsContext";
import AppModal from "./AppModal";
import { shareQrOnWhatsApp, buildBillWhatsAppMessageFromInvoice, shareBillWhatsAppHint } from "../utils/shareQrOnWhatsApp";
import { normalizePhoneForWhatsApp } from "../utils/normalizePhoneForWhatsApp";

export default function ShareBillWhatsAppModal({
  invoice,
  onClose,
}: {
  invoice: AdminInvoice | null;
  onClose: () => void;
}) {
  const { formatMoney } = useFinancePrivacy();
  const { displayStoreName } = useShopSettings();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareHint, setShareHint] = useState("");

  useEffect(() => {
    if (!invoice) return;
    setPhone("");
    setError("");
    setShareHint("");
  }, [invoice?.invoiceId]);

  if (!invoice) return null;

  const handleShare = async () => {
    setError("");
    const digits = normalizePhoneForWhatsApp(phone);
    if (digits.length < 10) {
      setError("Enter at least 10 digits (e.g. 9876543210 or 919876543210)");
      return;
    }
    setSharing(true);
    setShareHint("");
    try {
      const result = await shareQrOnWhatsApp(
        digits,
        buildBillWhatsAppMessageFromInvoice(invoice, formatMoney, displayStoreName),
      );
      setShareHint(shareBillWhatsAppHint(result));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not share on WhatsApp");
    } finally {
      setSharing(false);
    }
  };

  return (
    <AppModal
      show={!!invoice}
      title="Bill created"
      onClose={onClose}
      size="md"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Done
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" />
                Opening…
              </>
            ) : (
              <>
                <i className="ti ti-brand-whatsapp me-1" />
                Share on WhatsApp
              </>
            )}
          </button>
        </>
      }
    >
      <div className="text-center mb-4">
        <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3 pos-share-success-icon">
          <i className="ti ti-check fs-3" aria-hidden />
        </span>
        <p className="fw-semibold mb-1">Your bill was saved successfully.</p>
        <p className="small text-muted mb-0">
          {invoice.invoiceId} · {invoice.customerName} · {formatMoney(invoice.total)}
        </p>
      </div>

      <label className="form-label fw-semibold small">Customer WhatsApp number</label>
      <p className="small text-muted mb-2">
        Sends an Ezo-style WhatsApp message: shop name, bill total, link to view the bill online
        (with payment QR). Opens WhatsApp Web for the number you enter. India: 10 digits OK — we add
        91.
      </p>
      {shareHint ? (
        <div className="alert alert-info small py-2 mb-2" role="status">
          {shareHint}
        </div>
      ) : null}
      <input
        type="tel"
        className={`form-control${error ? " is-invalid" : ""}`}
        placeholder="e.g. 9876543210"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setError("");
        }}
        autoFocus
      />
      {error ? <div className="invalid-feedback d-block">{error}</div> : null}
    </AppModal>
  );
}
