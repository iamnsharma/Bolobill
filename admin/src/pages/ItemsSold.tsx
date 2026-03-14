import { useState, useEffect } from "react";
import { adminApi, type ItemSold } from "../api/admin";

const formatMoney = (n: number) => `₹${Number(n).toLocaleString()}`;

export default function ItemsSold() {
  const [items, setItems] = useState<ItemSold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getItemsSold({
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setItems(res.items ?? []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load items",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [dateFrom, dateTo]);

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Items Sold</h1>
      <p className="text-muted mb-4">
        See which items sold how much, with quantity and amount. Use the date
        filter to view sales for a specific period.
      </p>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-3 align-items-end">
            <div>
              <label className="form-label small text-muted mb-1">
                From date
              </label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">
                To date
              </label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>
                      <i className="ti ti-package me-1" />
                      Item name
                    </th>
                    <th className="text-end">
                      <i className="ti ti-number me-1" />
                      Quantity
                    </th>
                    <th className="text-end">
                      <i className="ti ti-cash me-1" />
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">
                        No items found for the selected period.
                      </td>
                    </tr>
                  ) : (
                    items.map((row, i) => (
                      <tr key={i}>
                        <td className="fw-medium">{row.itemName}</td>
                        <td className="text-end">{row.quantity}</td>
                        <td className="text-end">{formatMoney(row.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
