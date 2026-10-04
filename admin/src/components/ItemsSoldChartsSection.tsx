import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import type { ItemSold } from "../api/admin";
import { useFinancePrivacy, FINANCE_MASK } from "../contexts/FinancePrivacyContext";

const TOP_N = 10;
const BAR_COLORS = [
  "#6f1d3b",
  "#0d6efd",
  "#198754",
  "#0dcaf0",
  "#fd7e14",
  "#6610f2",
  "#d63384",
  "#20c997",
  "#ffc107",
  "#6c757d",
  "#adb5bd",
];

type Metric = "quantity" | "amount";

function truncateLabel(name: string, max = 22): string {
  const t = name.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function metricValue(row: ItemSold, metric: Metric): number {
  if (metric === "quantity") return row.quantity;
  return row.amount ?? 0;
}

function buildTopRows(items: ItemSold[], metric: Metric) {
  const sorted = [...items].sort((a, b) => metricValue(b, metric) - metricValue(a, metric));
  const top = sorted.slice(0, TOP_N);
  if (sorted.length > TOP_N) {
    const rest = sorted.slice(TOP_N);
    top.push({
      itemName: `Other (${rest.length} items)`,
      quantity: rest.reduce((s, r) => s + r.quantity, 0),
      amount: rest.reduce((s, r) => s + (r.amount ?? 0), 0),
    });
  }
  return top.map((row) => ({
    name: truncateLabel(row.itemName),
    fullName: row.itemName,
    quantity: row.quantity,
    amount: row.amount,
    value: metricValue(row, metric),
  }));
}

type Props = {
  items: ItemSold[];
  loading: boolean;
};

export function ItemsSoldChartsSection({ items, loading }: Props) {
  const { formatFinance, hideFinance } = useFinancePrivacy();
  const [metric, setMetric] = useState<Metric>("quantity");

  const chartRows = useMemo(() => buildTopRows(items, metric), [items, metric]);

  const totalQty = useMemo(
    () => items.reduce((s, r) => s + r.quantity, 0),
    [items],
  );
  const totalAmt = useMemo(() => {
    if (hideFinance) return null;
    const amounts = items.map((r) => r.amount).filter((a): a is number => a != null);
    if (items.length > 0 && amounts.length === 0) return null;
    return amounts.reduce((s, a) => s + a, 0);
  }, [items, hideFinance]);

  const yTickAmount = (v: number) =>
    hideFinance ? FINANCE_MASK : v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`;

  if (loading) {
    return (
      <div className="text-center py-5 text-muted">
        <span className="spinner-border spinner-border-sm me-2" />
        Loading charts…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-muted small">
        Create bills with line items to see what sells best here.
      </div>
    );
  }

  return (
    <div className="items-sold-charts">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="small text-muted">
          Top {Math.min(TOP_N, items.length)} items
          {items.length > TOP_N ? ` (+ others grouped)` : ""} ·{" "}
          <span className="fw-semibold text-body">
            {totalQty.toLocaleString()} units
          </span>
          {" · "}
          <span className="fw-semibold text-body">{formatFinance(totalAmt)}</span> revenue
        </div>
        <div className="btn-group btn-group-sm" role="group" aria-label="Chart metric">
          <button
            type="button"
            className={`btn ${metric === "quantity" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setMetric("quantity")}
          >
            By quantity
          </button>
          <button
            type="button"
            className={`btn ${metric === "amount" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setMetric("amount")}
          >
            By revenue
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <p className="small text-muted mb-2">
            {metric === "quantity" ? "Units sold per item" : "Revenue per item"}
          </p>
          <div className="items-sold-charts__bar-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartRows}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    metric === "amount" ? yTickAmount(Number(v)) : String(v)
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => {
                    if (value == null || typeof value !== "number") return "—";
                    return metric === "amount"
                      ? [formatFinance(value), "Revenue"]
                      : [value.toLocaleString(), "Quantity"];
                  }}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload as { fullName?: string } | undefined;
                    return row?.fullName ?? "";
                  }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #dee2e6" }}
                />
                <Bar dataKey="value" name={metric === "quantity" ? "Quantity" : "Revenue"} radius={[0, 6, 6, 0]}>
                  {chartRows.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-5">
          <p className="small text-muted mb-2">Share of {metric === "quantity" ? "units" : "revenue"}</p>
          <div className="items-sold-charts__pie-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartRows}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {chartRows.map((_, index) => (
                    <Cell key={`pie-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    if (value == null || typeof value !== "number") return "—";
                    return metric === "amount"
                      ? formatFinance(value)
                      : value.toLocaleString();
                  }}
                  contentStyle={{ borderRadius: 8, border: "1px solid #dee2e6" }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, maxWidth: 140 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
