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
    exportInvoiceAsPdf({
      invoiceId: invoice.invoiceId,
      customerName: invoice.customerName,
      items: invoice.items,
      total: invoice.total,
      createdAt: invoice.createdAt,
      source: invoice.source,
    });
  };

  if (!invoiceId) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Invoice</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {invoice && !loading && (
              <div className="invoice-view">
                <div className="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom">
                  <div>
                    <p className="mb-1 fw-bold text-muted small">Invoice ID</p>
                    <p className="mb-0 fs-5">{invoice.invoiceId}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-1 fw-bold text-muted small">Date</p>
                    <p className="mb-0">
                      {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="mb-1 fw-bold text-muted small">Customer</p>
                  <p className="mb-0 fs-6">{invoice.customerName}</p>
                </div>
                {invoice.user && (
                  <div className="mb-3">
                    <p className="mb-1 fw-bold text-muted small">Created by (user)</p>
                    <p className="mb-0 small">{invoice.user.name ?? invoice.user.phone}</p>
                  </div>
                )}
                <table className="table table-bordered mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>Item</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Price (₹)</th>
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
                <div className="d-flex justify-content-end border-top pt-2">
                  <p className="mb-0 fw-bold">
                    Total: <span className="fs-5">₹{invoice.total}</span>
                  </p>
                </div>
                {invoice.voiceTranscript && (
                  <div className="mt-3 pt-3 border-top">
                    <p className="mb-1 fw-bold text-muted small">Transcript</p>
                    <p className="mb-0 small text-muted">{invoice.voiceTranscript}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {invoice && !loading && (
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary" onClick={handleExportPdf}>
                <i className="ti ti-file-export me-1" />
                Export PDF
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="modal-backdrop show" onClick={onClose} aria-hidden />
    </div>
  );
}
