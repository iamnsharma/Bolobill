import { useState, useEffect, useRef } from "react";
import type { AddressBookContact, AdminInvoice } from "../api/admin";
import { adminApi } from "../api/admin";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import { useShopSettings } from "../contexts/ShopSettingsContext";
import AppModal from "./AppModal";
import AddressBookContactPicker from "./address-book/AddressBookContactPicker";
import { shareQrOnWhatsApp, buildBillWhatsAppMessageFromInvoice, shareBillWhatsAppHint } from "../utils/shareQrOnWhatsApp";
import { normalizePhoneForWhatsApp } from "../utils/normalizePhoneForWhatsApp";
import { phoneDigitsForLookup } from "../utils/phoneDigitsForLookup";

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
  const [lookupName, setLookupName] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);
  const [contactName, setContactName] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!invoice) return;
    setPhone("");
    setError("");
    setShareHint("");
    setLookupName(null);
    setSaveToAddressBook(true);
    setContactName(invoice.customerName?.trim() || "");
    setSelectedContactId(null);
  }, [invoice?.invoiceId, invoice?.customerName]);

  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    const digits = phoneDigitsForLookup(phone);
    if (!digits) {
      setLookupName(null);
      return;
    }
    if (selectedContactId) return;
    setLookupLoading(true);
    lookupTimer.current = setTimeout(() => {
      adminApi
        .lookupAddressBookContact(digits)
        .then((res) => {
          if (res.found && res.contact) {
            setLookupName(res.contact.name);
            setContactName(res.contact.name);
            setSelectedContactId(res.contact.id);
            setSaveToAddressBook(false);
          } else {
            setLookupName(null);
            setContactName((prev) => prev.trim() || invoice?.customerName?.trim() || "");
            setSaveToAddressBook(true);
          }
        })
        .catch(() => setLookupName(null))
        .finally(() => setLookupLoading(false));
    }, 320);
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, [phone, invoice?.customerName, selectedContactId]);

  if (!invoice) return null;

  const applyContact = (contact: AddressBookContact) => {
    setSelectedContactId(contact.id);
    setPhone(contact.phone);
    setLookupName(contact.name);
    setContactName(contact.name);
    setSaveToAddressBook(false);
    setError("");
  };

  const persistContactIfNeeded = async (digitsForWa: string) => {
    if (lookupName || selectedContactId) return;
    if (!saveToAddressBook) return;
    const name = contactName.trim();
    if (!name) return;
    const saved = await adminApi.saveAddressBookContact({
      phone: digitsForWa,
      name,
    });
    setLookupName(saved.name);
    setSelectedContactId(saved.id);
    setSaveToAddressBook(false);
  };

  const handleShare = async () => {
    setError("");
    const digits = normalizePhoneForWhatsApp(phone);
    if (digits.length < 10) {
      setError("Enter at least 10 digits (e.g. 9876543210 or 919876543210)");
      return;
    }
    if (!lookupName && !selectedContactId && saveToAddressBook && !contactName.trim()) {
      setError("Enter a name to save this customer in your address book.");
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
      try {
        await persistContactIfNeeded(digits);
      } catch {
        setShareHint(
          `${shareBillWhatsAppHint(result)} Could not save to address book — add the contact from the Address Book tab.`,
        );
      }
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
      size="xl"
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

      <div className="row g-3 g-lg-4 share-whatsapp-modal-split">
        <div className="col-lg-6">
          <label className="form-label fw-semibold small">Type WhatsApp number</label>
          <p className="small text-muted mb-2">
            Bill link opens in WhatsApp Web. India: 10 digits is fine — we add 91.
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
              setSelectedContactId(null);
              setError("");
            }}
            autoFocus
          />
          {lookupLoading && phoneDigitsForLookup(phone) ? (
            <p className="small text-muted mt-2 mb-0">
              <span className="spinner-border spinner-border-sm me-1" role="status" />
              Checking address book…
            </p>
          ) : null}
          {lookupName ? (
            <div className="alert alert-success small py-2 mt-2 mb-0" role="status">
              <i className="ti ti-address-book me-1" aria-hidden />
              <strong>{lookupName}</strong> — in your address book
            </div>
          ) : null}
          {!lookupName && phoneDigitsForLookup(phone) ? (
            <div className="border rounded-3 p-3 mt-3 bg-light">
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="save-address-book"
                  checked={saveToAddressBook}
                  onChange={(e) => setSaveToAddressBook(e.target.checked)}
                />
                <label className="form-check-label small fw-semibold" htmlFor="save-address-book">
                  Save to address book after sharing
                </label>
              </div>
              {saveToAddressBook ? (
                <div>
                  <label className="form-label small mb-1" htmlFor="address-book-name">
                    Customer name
                  </label>
                  <input
                    id="address-book-name"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Name for this number"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          {error ? <div className="invalid-feedback d-block mt-2">{error}</div> : null}
        </div>

        <div className="col-lg-6">
          <div className="share-whatsapp-modal-picker h-100 border-start-lg-0 border-top-lg-0 pt-3 pt-lg-0 ps-lg-3 border-top border-lg-start">
            <AddressBookContactPicker
              selectedId={selectedContactId}
              onSelect={applyContact}
              className="h-100"
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
}
