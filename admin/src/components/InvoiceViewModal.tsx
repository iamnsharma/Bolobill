import { useState, useEffect } from 'react';
import { adminApi, type AdminInvoice } from '../api/admin';
import { exportInvoiceAsPdf } from '../utils/exportInvoicePdf';

type InvoiceData = Omit<AdminInvoice, 'pdfUrl'> & { pdfUrl?: string };

/** Normalize to digits only for wa.me (e.g. 919876543210). Add 91 if user entered 10 digits (India). */
function normalizePhoneForWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10 && !value.trim().startsWith('91')) return '91' + digits;
  return digits;
}

export default function InvoiceViewModal({
  invoiceId,
  onClose,
}: {
  invoiceId: string | null;
  onClose: () => void;
}) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWhatsAppShare, setShowWhatsAppShare] = useState(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [whatsAppError, setWhatsAppError] = useState('');

  useEffect(() => {
    if (!invoiceId) {
      setInvoice(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    adminApi
      .getInvoiceById(invoiceId)
      .then(setInvoice)
      .catch((e: unknown) => {
        setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load invoice');
      })
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const handleExportPdf = () => {
    if (!invoice) return;
    const createdBy = invoice.user
      ? [invoice.user.businessName, invoice.user.name].filter(Boolean).join(' — ') || invoice.user.phone
      : undefined;
    exportInvoiceAsPdf({
      invoiceId: invoice.invoiceId,
      customerName: invoice.customerName,
      createdBy: createdBy || undefined,
      items: invoice.items,
      total: invoice.total,
      createdAt: invoice.createdAt,
      source: invoice.source,
    });
  };

  const handleShareOnWhatsApp = () => {
    if (!invoice) return;
    setWhatsAppError('');
    const digits = normalizePhoneForWhatsApp(whatsAppNumber);
    if (digits.length < 10) {
      setWhatsAppError('Enter at least 10 digits (e.g. 9876543210 or 919876543210)');
      return;
    }
    const message = [
      `Bolo Bill – ${invoice.invoiceId}`,
      `Customer: ${invoice.customerName} | Total: ₹${invoice.total}`,
      invoice.pdfUrl ? invoice.pdfUrl : '',
    ]
      .filter(Boolean)
      .join('\n');
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowWhatsAppShare(false);
    setWhatsAppNumber('');
  };

  if (!invoiceId) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      style={{ zIndex: 1050 }}
      onClick={handleBackdropClick}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow">
          <div className="modal-header border-bottom bg-light px-4 py-3">
            <h5 id="invoice-modal-title" className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="ti ti-receipt text-primary" />
              Invoice
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body px-4 py-4">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            )}
            {error && (
              <div className="alert alert-danger mb-0" role="alert">
                {error}
              </div>
            )}
            {invoice && !loading && (
              <div className="invoice-view">
                <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
                  <div>
                    <p className="mb-1 fw-bold text-muted small text-uppercase">Invoice ID</p>
                    <p className="mb-0 fs-5 fw-semibold">{invoice.invoiceId}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1 fw-bold text-muted small text-uppercase">Date</p>
                    <p className="mb-0">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="mb-1 fw-bold text-muted small text-uppercase">Customer</p>
                  <p className="mb-0">{invoice.customerName}</p>
                </div>
                {invoice.user && (
                  <div className="mb-4">
                    <p className="mb-1 fw-bold text-muted small text-uppercase">Created by</p>
                    <p className="mb-0 small">{invoice.user.name ?? invoice.user.phone}</p>
                  </div>
                )}
                <table className="table table-bordered mb-4 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-end" style={{ width: '80px' }}>Qty</th>
                      <th className="text-end" style={{ width: '100px' }}>Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">₹{item.totalPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-end border-top pt-4">
                  <p className="mb-0 fw-bold fs-5">
                    Total: <span className="text-primary">₹{invoice.total}</span>
                  </p>
                </div>
                {invoice.pdfUrl && (
                  <div className="mt-3 pt-3 border-top">
                    <a
                      href={invoice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                    >
                      <i className="ti ti-file" />
                      Open bill PDF
                    </a>
                  </div>
                )}
                {invoice.voiceTranscript && (
                  <div className="mt-4 pt-4 border-top">
                    <p className="mb-1 fw-bold text-muted small text-uppercase">Transcript</p>
                    <p className="mb-0 small text-muted">{invoice.voiceTranscript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {invoice && !loading && (
            <div className="modal-footer border-top bg-light px-4 py-3 flex-wrap gap-2">
              {showWhatsAppShare ? (
                <div className="w-100 d-flex flex-column gap-2">
                  <label className="form-label small mb-0 fw-bold">Send bill to WhatsApp number</label>
                  <p className="small text-muted mb-0">
                    Enter the customer&apos;s number. You don&apos;t need to save the contact — WhatsApp will open a chat with this number (new or existing). For India, 10 digits (e.g. 9876543210) are enough; we add 91 automatically.
                  </p>
                  <div className="d-flex gap-2 flex-wrap align-items-center">
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210 or 919876543210"
                      value={whatsAppNumber}
                      onChange={(e) => {
                        setWhatsAppNumber(e.target.value);
                        setWhatsAppError('');
                      }}
                      style={{ maxWidth: 260 }}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-success d-flex align-items-center gap-1"
                      onClick={handleShareOnWhatsApp}
                    >
                      <i className="ti ti-brand-whatsapp" />
                      Open chat &amp; send
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setShowWhatsAppShare(false);
                        setWhatsAppNumber('');
                        setWhatsAppError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  {whatsAppError && <div className="small text-danger">{whatsAppError}</div>}
                </div>
              ) : (
                <>
                  <button type="button" className="btn btn-secondary d-flex align-items-center gap-1" onClick={onClose}>
                    <i className="ti ti-x" />
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-1"
                    onClick={handleExportPdf}
                  >
                    <i className="ti ti-file-export" />
                    Export PDF
                  </button>
                  <button
                    type="button"
                    className="btn btn-success d-flex align-items-center gap-1"
                    onClick={() => setShowWhatsAppShare(true)}
                  >
                    <i className="ti ti-brand-whatsapp" />
                    Share bill PDF on WhatsApp
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
