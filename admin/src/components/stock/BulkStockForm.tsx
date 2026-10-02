import { useId, useState } from "react";
import type { StockCategory } from "../../api/admin";
import { POPULAR_UNITS } from "../../constants/stockUnits";

export type BulkStockRow = {
  id: string;
  name: string;
  unit: string;
  unitPrice: string;
  quantityOnHand: string;
  lowStockThreshold: string;
};

function emptyRow(): BulkStockRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    unit: "pcs",
    unitPrice: "",
    quantityOnHand: "",
    lowStockThreshold: "",
  };
}

export default function BulkStockForm({
  categories,
  defaultCategoryName,
  loading,
  onSubmit,
  onCancel,
}: {
  categories: StockCategory[];
  defaultCategoryName: string;
  loading: boolean;
  onSubmit: (rows: BulkStockRow[], sharedCategoryName: string) => void;
  onCancel: () => void;
}) {
  const categorySelectId = useId();
  const [sharedCategory, setSharedCategory] = useState(defaultCategoryName);
  const [rows, setRows] = useState<BulkStockRow[]>(() => [emptyRow(), emptyRow(), emptyRow()]);

  const updateRow = (id: string, field: keyof BulkStockRow, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rows, sharedCategory.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="bulk-stock-form">
      <p className="small text-muted mb-3">
        Add many products at once. Same category for all rows below—change per line only if you add
        rows with different names and prices.
      </p>
      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor={categorySelectId}>
            Category for this batch
          </label>
          <input
            id={categorySelectId}
            type="text"
            className="form-control"
            list={`${categorySelectId}-list`}
            value={sharedCategory}
            onChange={(e) => setSharedCategory(e.target.value)}
            placeholder="e.g. Rice, Snacks"
            required
          />
          <datalist id={`${categorySelectId}-list`}>
            {categories.map((c) => (
              <option key={c._id} value={c.name} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="table-responsive border rounded-3 bg-white">
        <table className="table table-sm align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Product name</th>
              <th style={{ width: 72 }}>Unit</th>
              <th style={{ width: 100 }}>Price (₹)</th>
              <th style={{ width: 100 }}>In stock</th>
              <th style={{ width: 100 }}>Alert at</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Name"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, "name", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    list="bulk-unit-list"
                    value={row.unit}
                    onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-control form-control-sm"
                    value={row.unitPrice}
                    onChange={(e) => updateRow(row.id, "unitPrice", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-control form-control-sm"
                    value={row.quantityOnHand}
                    onChange={(e) => updateRow(row.id, "quantityOnHand", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="form-control form-control-sm"
                    placeholder="—"
                    value={row.lowStockThreshold}
                    onChange={(e) => updateRow(row.id, "lowStockThreshold", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-danger p-0"
                    onClick={() => removeRow(row.id)}
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
      <datalist id="bulk-unit-list">
        {POPULAR_UNITS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={addRow}>
          <i className="ti ti-plus me-1" />
          Add row
        </button>
        <div className="ms-auto d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Save all products"}
          </button>
        </div>
      </div>
    </form>
  );
}
