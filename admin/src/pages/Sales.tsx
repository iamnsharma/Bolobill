import { useState, useEffect } from "react";
import { adminApi, type SalesSummary as SalesSummaryType } from "../api/admin";

const formatMoney = (n: number) => `₹${Number(n).toLocaleString()}`;

export default function Sales() {
  const [summary, setSummary] = useState<SalesSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSalesSummary({
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setSummary(data);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load sales",
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [dateFrom, dateTo]);

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Sales Summary</h1>
      <p className="text-muted mb-4">
        View your total sales for today, week, month, and year. Use the date
        filter to see sales for a custom range.
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

      <div className="row g-3">
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-primary bg-opacity-10 border-start border-4 border-primary">
            <h3 className="fs-6 text-muted mb-1">Today</h3>
            <p className="fs-4 fw-bold mb-0">
              {loading
                ? "…"
                : summary != null
                  ? formatMoney(summary.today)
                  : "—"}
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-success bg-opacity-10 border-start border-4 border-success">
            <h3 className="fs-6 text-muted mb-1">This week</h3>
            <p className="fs-4 fw-bold mb-0">
              {loading
                ? "…"
                : summary != null
                  ? formatMoney(summary.thisWeek)
                  : "—"}
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-info bg-opacity-10 border-start border-4 border-info">
            <h3 className="fs-6 text-muted mb-1">This month</h3>
            <p className="fs-4 fw-bold mb-0">
              {loading
                ? "…"
                : summary != null
                  ? formatMoney(summary.thisMonth)
                  : "—"}
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-warning bg-opacity-10 border-start border-4 border-warning">
            <h3 className="fs-6 text-muted mb-1">This year</h3>
            <p className="fs-4 fw-bold mb-0">
              {loading
                ? "…"
                : summary != null
                  ? formatMoney(summary.thisYear)
                  : "—"}
            </p>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-secondary bg-opacity-10 border-start border-4 border-secondary">
            <h3 className="fs-6 text-muted mb-1">All time total</h3>
            <p className="fs-4 fw-bold mb-0">
              {loading
                ? "…"
                : summary != null
                  ? formatMoney(summary.total)
                  : "—"}
            </p>
          </div>
        </div>
        {(dateFrom || dateTo) && (
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-3 h-100 p-4 border">
              <h3 className="fs-6 text-muted mb-1">Filtered range total</h3>
              <p className="fs-4 fw-bold mb-0 text-primary">
                {loading
                  ? "…"
                  : summary != null
                    ? formatMoney(summary.filteredTotal)
                    : "—"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
