import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import type { DateRangePreset } from "../utils/dateRangePresets";
import { isRangeFilterActive } from "../utils/dateRangePresets";

type SalesChartsSectionProps = {
  preset: DateRangePreset;
  appliedFrom: string;
  appliedTo: string;
};

export function SalesChartsSection({ preset, appliedFrom, appliedTo }: SalesChartsSectionProps) {
  const { t } = useTranslation();
  const { formatFinance, hideFinance, financeDataEpoch } = useFinancePrivacy();
  const yTick = (v: number) =>
    hideFinance
      ? FINANCE_MASK
      : v >= 1000
        ? `₹${(v / 1000).toFixed(0)}k`
        : `₹${v}`;
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [daily, setDaily] = useState<{ date: string; total: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [rangeSummary, setRangeSummary] = useState<SalesSummary | null>(null);

  const showAllTimeBars = preset === "all";
  const rangeActive = isRangeFilterActive(preset, appliedFrom, appliedTo);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getSalesSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [financeDataEpoch]);

  useEffect(() => {
    if (!rangeActive) {
      setDaily([]);
      setRangeSummary(null);
      setDailyLoading(false);
      return;
    }
    setDailyLoading(true);
    Promise.all([
      adminApi.getSalesSummaryDaily({ from: appliedFrom, to: appliedTo }),
      adminApi.getSalesSummary({ from: appliedFrom, to: appliedTo }),
    ])
      .then(([dailyRes, sumRes]) => {
        setDaily(dailyRes.daily ?? []);
        setRangeSummary(sumRes);
      })
      .catch(() => {
        setDaily([]);
        setRangeSummary(null);
      })
      .finally(() => setDailyLoading(false));
  }, [rangeActive, appliedFrom, appliedTo, financeDataEpoch]);

  const barColors = ["#0d6efd", "#198754", "#0dcaf0", "#fd7e14"];
  const barData = summary
    ? [
        { label: t("pages.dashboard.today"), value: summary.today ?? 0 },
        { label: t("pages.dashboard.thisWeek"), value: summary.thisWeek ?? 0 },
        { label: t("pages.dashboard.thisMonth"), value: summary.thisMonth ?? 0 },
        { label: t("pages.dashboard.thisYear"), value: summary.thisYear ?? 0 },
      ]
    : [];

  return (
    <div className="sales-charts-section">
      {preset === "custom" && !rangeActive && !dailyLoading ? (
        <div className="text-center py-4 text-muted small">
          {t("pages.sales.dateHint")}
        </div>
      ) : null}

      {loading && !summary ? (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          {t("common.loading")}
        </div>
      ) : showAllTimeBars && summary ? (
        <div style={{ width: "100%", height: 280 }}>
          <p className="small text-muted mb-3">{t("pages.sales.chartAllHint")}</p>
          <ResponsiveContainer>
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={yTick} />
              <Tooltip
                formatter={(value) => [
                  value != null && typeof value === "number" ? formatFinance(value) : "—",
                  t("pages.dashboard.sales"),
                ]}
                contentStyle={{ borderRadius: 8, border: "1px solid #dee2e6" }}
              />
              <Bar dataKey="value" name={t("pages.dashboard.sales")} radius={[6, 6, 0, 0]}>
                {barData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : rangeActive ? (
        <>
          {rangeSummary != null && (
            <div className="mb-3 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
              <span className="text-muted small">{t("pages.sales.filteredTotal")}</span>
              <p className="fs-3 fw-bold text-primary mb-0">
                {formatFinance(rangeSummary.filteredTotal)}
              </p>
            </div>
          )}
          {dailyLoading ? (
            <div className="text-center py-4 text-muted">
              <span className="spinner-border spinner-border-sm me-2" />
              {t("common.loading")}
            </div>
          ) : daily.length === 0 ? (
            <div className="text-center py-4 text-muted">{t("pages.sales.noSalesInRange")}</div>
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
                      t("pages.dashboard.sales"),
                    ]}
                    labelFormatter={(label) => `${label}`}
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
        <div className="text-center py-4 text-muted">{t("common.failedGeneric")}</div>
      )}
    </div>
  );
}
