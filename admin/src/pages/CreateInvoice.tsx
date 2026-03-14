import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/admin';

type LineItem = { name: string; quantity: string; totalPrice: string };

const defaultLine: LineItem = { name: '', quantity: '1', totalPrice: '0' };

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<LineItem[]>([{ ...defaultLine }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLine = () => setLines((prev) => [...prev, { ...defaultLine }]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineItem, value: string) => {
    setLines((prev) => {
      const next = [...prev];
      (next[index] as Record<string, string>)[field] = value;
      return next;
    });
  };

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.totalPrice) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.name.trim());
    if (validLines.length === 0) {
      setError('Add at least one item with a name.');
      return;
    }
    const items = validLines.map((l) => ({
      name: l.name.trim(),
      quantity: String(parseFloat(l.quantity) || 1),
      totalPrice: parseFloat(l.totalPrice) || 0,
    }));
    setLoading(true);
    setError(null);
    try {
      await adminApi.createInvoice({
        customerName: customerName.trim() || undefined,
        items,
        note: note.trim() || undefined,
      });
      navigate('/invoices', { replace: true });
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Create Bill</h1>
      <p className="text-muted mb-4">
        Create a new bill or invoice from the web. Fill in customer name (optional) and add items with quantity and price.
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label">Customer name (optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Note (optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label mb-0 fw-bold">Items</label>
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addLine}>
              <i className="ti ti-plus me-1" />
              Add row
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40%' }}>Item name</th>
                  <th style={{ width: '15%' }}>Qty</th>
                  <th style={{ width: '25%' }}>Total price (₹)</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Item name"
                        value={line.name}
                        onChange={(e) => updateLine(i, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control form-control-sm"
                        placeholder="0"
                        value={line.totalPrice}
                        onChange={(e) => updateLine(i, 'totalPrice', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeLine(i)}
                        disabled={lines.length <= 1}
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

          <div className="d-flex justify-content-end align-items-center mt-3 pt-3 border-top">
            <span className="me-3 fw-bold">Total: ₹{total.toFixed(2)}</span>
            <button type="button" className="btn btn-outline-secondary me-2" onClick={() => navigate('/invoices')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating…' : 'Create Bill'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}