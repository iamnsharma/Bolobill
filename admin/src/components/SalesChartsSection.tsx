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
import { useFinancePrivacy, FINANCE_MASK } from "../contexts/FinancePrivacyContext";
import FilterApplyButton from "./merchant/FilterApplyButton";
import { canApplyDateRangeFilter, isDateRangeComplete } from "../utils/dateRangeFilters";

type Period = "day" | "week" | "month" | "year" | "custom";

export function SalesChartsSection() {
  const { formatFinance, hideFinance } = useFinancePrivacy();
  const yTick = (v: number) =>
    hideFinance
      ? FINANCE_MASK
      : v >= 1000
        ? `₹${(v / 1000).toFixed(0)}k`
        : `₹${v}`;
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [daily, setDaily] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("month");
  const [draftCustomFrom, setDraftCustomFrom] = useState("");
  const [draftCustomTo, setDraftCustomTo] = useState("");
  const [appliedCustomFrom, setAppliedCustomFrom] = useState("");
  const [appliedCustomTo, setAppliedCustomTo] = useState("");

  useEffect(() => {
    setLoading(true);
    adminApi
      .getSalesSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (period !== "custom") return;
    if (!isDateRangeComplete(appliedCustomFrom, appliedCustomTo)) {
      setDaily([]);
      setCustomSummary(null);
      setDailyLoading(false);
      return;
    }
    setDailyLoading(true);
    adminApi
      .getSalesSummaryDaily({ from: appliedCustomFrom, to: appliedCustomTo })
      .then((res) => setDaily(res.daily ?? []))
      .catch(() => setDaily([]))
      .finally(() => setDailyLoading(false));
  }, [period, appliedCustomFrom, appliedCustomTo]);

  const barColors = ["#0d6efd", "#198754", "#0dcaf0", "#fd7e14"];
  const barData = summary
    ? [
        { label: "Today", value: summary.today },
        { label: "This week", value: summary.thisWeek },
        { label: "This month", value: summary.thisMonth },
        { label: "This year", value: summary.thisYear },
      ]
    : [];

  const [customSummary, setCustomSummary] = useState<SalesSummary | null>(null);
  useEffect(() => {
    if (period !== "custom") {
      setCustomSummary(null);
      return;
    }
    if (!isDateRangeComplete(appliedCustomFrom, appliedCustomTo)) {
      setCustomSummary(null);
      return;
    }
    adminApi
      .getSalesSummary({ from: appliedCustomFrom, to: appliedCustomTo })
      .then(setCustomSummary)
      .catch(() => setCustomSummary(null));
  }, [period, appliedCustomFrom, appliedCustomTo]);

  const periodLabels: { value: Period; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
    { value: "custom", label: "Custom" },
  ];

  const customApplyReady = canApplyDateRangeFilter(
    draftCustomFrom,
    draftCustomTo,
    appliedCustomFrom,
    appliedCustomTo,
  );
  const customRangeApplied = isDateRangeComplete(appliedCustomFrom, appliedCustomTo);

  return (
    <div className="sales-charts-section">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <p className="small text-muted mb-0">Compare periods or pick a custom range for daily trend.</p>
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

        {period === "custom" && (
          <form
            className="d-flex flex-wrap gap-3 align-items-end mb-4 p-3 rounded-3 bg-light"
            onSubmit={(e) => {
              e.preventDefault();
              if (!customApplyReady) return;
              setAppliedCustomFrom(draftCustomFrom);
              setAppliedCustomTo(draftCustomTo);
            }}
          >
            <div>
              <label className="form-label small text-muted mb-1">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={draftCustomFrom}
                onChange={(e) => setDraftCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={draftCustomTo}
                onChange={(e) => setDraftCustomTo(e.target.value)}
              />
            </div>
            <FilterApplyButton type="submit" loading={dailyLoading} disabled={!customApplyReady} />
          </form>
        )}

        {period === "custom" && !customRangeApplied && !dailyLoading ? (
          <div className="text-center py-4 text-muted">
            Select from and to dates, then tap Apply.
          </div>
        ) : null}

        {loading && !summary ? (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm me-2" />
            Loading sales…
          </div>
        ) : period === "day" ? (
          <div className="text-center py-4">
            <p className="text-muted small mb-1">Sales today</p>
            <p className="display-5 fw-bold text-primary mb-0">
              {summary ? formatFinance(summary.today) : "—"}
            </p>
          </div>
        ) : period === "custom" ? (
          customRangeApplied ? (
            <>
              {customSummary != null && (
                <div className="mb-3 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
                  <span className="text-muted small">Total in selected range</span>
                  <p className="fs-3 fw-bold text-primary mb-0">
                    {formatFinance(customSummary.filteredTotal)}
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
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={yTick} />
                      <Tooltip
                        formatter={(value) => [
                          value != null && typeof value === "number" ? formatFinance(value) : "—",
                          "Sales",
                        ]}
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
          ) : null
        ) : summary ? (
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={yTick} />
                <Tooltip
                  formatter={(value) => [
                    value != null && typeof value === "number" ? formatFinance(value) : "—",
                    "Sales",
                  ]}
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
        ) : (
          <div className="text-center py-4 text-muted">Could not load sales data.</div>
        )}
    </div>
  );
}
