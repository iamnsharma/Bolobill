import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { adminApi, type SalesSummary } from "../api/admin";

const formatMoney = (n: number) => `₹${Number(n).toLocaleString()}`;

type Period = "day" | "week" | "month" | "year" | "custom";

function getDefaultCustomRange(): { from: string; to: string } {
  const t = new Date();
  const to = t.toISOString().slice(0, 10);
  t.setDate(t.getDate() - 29);
  const from = t.toISOString().slice(0, 10);
  return { from, to };
}

const DUMMY_SUMMARY: SalesSummary = {
  today: 4250,
  thisWeek: 22800,
  thisMonth: 87500,
  thisYear: 542000,
  total: 542000,
  filteredTotal: 542000,
};

function getDummyDaily(from: string, to: string): { date: string; total: number }[] {
  const out: { date: string; total: number }[] = [];
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayIndex = Math.floor((d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const base = 800 + (dayIndex % 7) * 400;
    const variation = Math.sin(dayIndex * 0.3) * 600;
    out.push({ date: dateStr, total: Math.round(Math.max(200, base + variation)) });
  }
  return out;
}

export function SalesChartsSection() {
  const [useDummyData, setUseDummyData] = useState(false);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [daily, setDaily] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("month");
  const [customFrom, setCustomFrom] = useState(getDefaultCustomRange().from);
  const [customTo, setCustomTo] = useState(getDefaultCustomRange().to);

  useEffect(() => {
    if (useDummyData) {
      setSummary(DUMMY_SUMMARY);
      setLoading(false);
      return;
    }
    setLoading(true);
    adminApi
      .getSalesSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [useDummyData]);

  useEffect(() => {
    if (period !== "custom") return;
    if (useDummyData) {
      setDaily(getDummyDaily(customFrom, customTo));
      setDailyLoading(false);
      return;
    }
    setDailyLoading(true);
    adminApi
      .getSalesSummaryDaily({ from: customFrom, to: customTo })
      .then((res) => setDaily(res.daily ?? []))
      .catch(() => setDaily([]))
      .finally(() => setDailyLoading(false));
  }, [period, customFrom, customTo, useDummyData]);

  const barColors = ["#0d6efd", "#198754", "#0dcaf0", "#fd7e14"];
  const displaySummary = useDummyData ? DUMMY_SUMMARY : summary;
  const barData = displaySummary
    ? [
        { label: "Today", value: displaySummary.today },
        { label: "This week", value: displaySummary.thisWeek },
        { label: "This month", value: displaySummary.thisMonth },
        { label: "This year", value: displaySummary.thisYear },
      ]
    : [];

  const [customSummary, setCustomSummary] = useState<SalesSummary | null>(null);
  useEffect(() => {
    if (period !== "custom") {
      setCustomSummary(null);
      return;
    }
    if (useDummyData) {
      const dummyDaily = getDummyDaily(customFrom, customTo);
      setCustomSummary({
        ...DUMMY_SUMMARY,
        filteredTotal: dummyDaily.reduce((s, d) => s + d.total, 0),
      });
      return;
    }
    adminApi
      .getSalesSummary({ from: customFrom, to: customTo })
      .then(setCustomSummary)
      .catch(() => setCustomSummary(null));
  }, [period, customFrom, customTo, useDummyData]);

  const periodLabels: { value: Period; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <h3 className="h5 mb-0 fw-bold">Sales charts</h3>
          <div className="d-flex flex-wrap align-items-center gap-3">
            <label className="d-flex align-items-center gap-2 mb-0 small cursor-pointer">
              <input
                type="checkbox"
                className="form-check-input"
                checked={useDummyData}
                onChange={(e) => setUseDummyData(e.target.checked)}
              />
              <span className={useDummyData ? "text-primary fw-semibold" : "text-muted"}>
                Use sample data
              </span>
            </label>
            {useDummyData && (
              <span className="badge bg-primary bg-opacity-25 text-primary">Preview</span>
            )}
            <div className="d-flex flex-wrap gap-2">
            {periodLabels.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`btn btn-sm ${period === value ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setPeriod(value)}
              >
                {label}
              </button>
            ))}
            </div>
          </div>
        </div>

        {period === "custom" && (
          <div className="d-flex flex-wrap gap-3 align-items-end mb-4 p-3 rounded-3 bg-light">
            <div>
              <label className="form-label small text-muted mb-1">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading && !displaySummary ? (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm me-2" />
            Loading sales…
          </div>
        ) : period === "day" ? (
          <div className="text-center py-4">
            <p className="text-muted small mb-1">Sales today</p>
            <p className="display-5 fw-bold text-primary mb-0">
              {displaySummary ? formatMoney(displaySummary.today) : "—"}
            </p>
          </div>
        ) : period === "custom" ? (
          <>
            {customSummary != null && (
              <div className="mb-3 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                <span className="text-muted small">Total in selected range</span>
                <p className="fs-3 fw-bold text-primary mb-0">
                  {formatMoney(customSummary.filteredTotal)}
                </p>
              </div>
            )}
            {dailyLoading ? (
              <div className="text-center py-4 text-muted">
                <span className="spinner-border spinner-border-sm me-2" />
                Loading daily breakdown…
              </div>
            ) : daily.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No sales in this date range.
              </div>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={daily} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0d6efd" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#0d6efd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => {
                        const d = new Date(v);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                    />
                    <Tooltip
                      formatter={(value) => [value != null && typeof value === "number" ? formatMoney(value) : "—", "Sales"]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: 8, border: "1px solid #dee2e6" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#0d6efd"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                />
                <Tooltip
                  formatter={(value) => [value != null && typeof value === "number" ? formatMoney(value) : "—", "Sales"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid #dee2e6" }}
                />
                <Bar dataKey="value" name="Sales" radius={[6, 6, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

      </div>
    </div>
  );
}
