import { useState, useEffect } from "react";

export type ReviewInvoiceItem = {
  name: string;
  quantity: string;
  totalPrice: number;
};

export type ReviewInvoiceData = {
  customerName: string;
  items: ReviewInvoiceItem[];
  transcript?: string;
  note?: string;
  durationSec?: number;
  source: "voice" | "manual";
};

const defaultItem: ReviewInvoiceItem = { name: "", quantity: "1", totalPrice: 0 };

export default function ReviewInvoiceModal({
  open,
  initialData,
  onClose,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  initialData: ReviewInvoiceData | null;
  onClose: () => void;
  onConfirm: (data: ReviewInvoiceData) => void;
  loading?: boolean;
}) {
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<ReviewInvoiceItem[]>([]);
  const [transcript, setTranscript] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!initialData) return;
    setCustomerName(initialData.customerName);
    setItems(
      initialData.items.length
        ? initialData.items.map((i) => ({
            name: i.name,
            quantity: typeof i.quantity === "number" ? String(i.quantity) : (i.quantity ?? ""),
            totalPrice: Number(i.totalPrice) || 0,
          }))
        : [{ ...defaultItem }]
    );
    setTranscript(initialData.transcript ?? "");
    setNote(initialData.note ?? "");
  }, [initialData]);

  if (!open) return null;

  const total = items.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0);
  const validItems = items.filter((i) => (i.name ?? "").trim());
  const canSubmit =
    customerName.trim() && validItems.length > 0;

  const addRow = () => setItems((p) => [...p, { ...defaultItem }]);
  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((p) => p.filter((_, i) => i !== index));
  };
  const updateRow = (index: number, field: keyof ReviewInvoiceItem, value: string | number) => {
    setItems((p) => {
      const next = [...p];
      (next[index] as Record<string, string | number>)[field] = value;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData || !canSubmit) return;
    const payload: ReviewInvoiceData = {
      ...initialData,
      customerName: customerName.trim(),
      items: validItems.map((i) => ({
        name: i.name.trim(),
        quantity: i.quantity,
        totalPrice: Number(i.totalPrice) || 0,
      })),
      transcript: initialData.source === "voice" ? transcript : undefined,
      note: initialData.source === "manual" ? note : undefined,
    };
    onConfirm(payload);
  };

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1050 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow">
          <div className="modal-header border-bottom bg-light px-4 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <i className="ti ti-clipboard-check text-primary" />
              Review bill before creating
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-4">
              <p className="small text-muted mb-3">
                Edit any field below. This is exactly what will appear on the generated bill PDF.
              </p>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Customer name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                  />
                </div>
                {initialData?.source === "manual" && (
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Note (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Note"
                    />
                  </div>
                )}
              </div>
              <label className="form-label fw-semibold">Items</label>
              <div className="table-responsive mb-3">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40%" }}>Item</th>
                      <th style={{ width: "15%" }}>Qty</th>
                      <th style={{ width: "25%" }}>Total price (₹)</th>
                      <th style={{ width: "60px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.name}
                            onChange={(e) => updateRow(i, "name", e.target.value)}
                            placeholder="Item name"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={row.quantity}
                            onChange={(e) => updateRow(i, "quantity", e.target.value)}
                            placeholder="1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control form-control-sm"
                            value={row.totalPrice || ""}
                            onChange={(e) => updateRow(i, "totalPrice", e.target.value ? parseFloat(e.target.value) : 0)}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeRow(i)}
                            disabled={items.length <= 1}
                            aria-label="Remove row"
                          >
                            <i className="ti ti-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addRow}>
                  <i className="ti ti-plus me-1" />
                  Add row
                </button>
                <p className="mb-0 fw-bold">Total: ₹{total.toFixed(2)}</p>
              </div>
              {initialData?.source === "voice" && (
                <div className="mt-3">
                  <label className="form-label fw-semibold">Transcript (optional, shown on PDF)</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Voice transcript"
                  />
                </div>
              )}
            </div>
            <div className="modal-footer border-top bg-light px-4 py-3">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Back
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating…
                  </>
                ) : (
                  <>
                    <i className="ti ti-check me-1" />
                    Create bill
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
