import { useState, useEffect } from 'react';
import { adminApi, type AdminInvoice } from '../api/admin';
import { exportInvoiceAsPdf } from '../utils/exportInvoicePdf';

type InvoiceData = Omit<AdminInvoice, 'pdfUrl'> & { pdfUrl?: string };

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
            <div className="modal-footer border-top bg-light px-4 py-3">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
