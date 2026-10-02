import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminStats, type SalesSummary } from "../api/admin";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import MetricTile from "../components/merchant/MetricTile";
import QuickActionStrip from "../components/merchant/QuickActionStrip";
import SectionPanel from "../components/merchant/SectionPanel";

const EMPTY = "—";

export default function Dashboard() {
  const { isSuperAdmin } = useAuth();
  const { formatFinance } = useFinancePrivacy();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [stockSummary, setStockSummary] = useState<{
    inventoryValue: number;
    lowStockCount: number;
    totalProducts: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) {
      adminApi
        .getStats()
        .then((data) => {
          setStats(data);
          setApiAvailable(true);
        })
        .catch(() => {
          setStats(null);
          setApiAvailable(false);
        })
        .finally(() => setLoading(false));
    } else {
      Promise.all([adminApi.getSalesSummary(), adminApi.getStockSummary()])
        .then(([sales, stock]) => {
          setSalesSummary(sales);
          setStockSummary(stock);
          setApiAvailable(true);
        })
        .catch(() => {
          setSalesSummary(null);
          setStockSummary(null);
          setApiAvailable(false);
        })
        .finally(() => setLoading(false));
    }
  }, [isSuperAdmin]);

  const formatAmount = (n: number) =>
    n != null ? formatFinance(n) : EMPTY;

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        icon="ti-layout-dashboard"
        subtitle={
          isSuperAdmin
            ? "Platform overview and admin tools."
            : "Today’s numbers and shortcuts—like your shop command center."
        }
      />

      {!isSuperAdmin && (
        <SectionPanel flush bodyClassName="p-3">
          <QuickActionStrip
            actions={[
              {
                to: "/dashboard/invoices/new",
                label: "New bill",
                icon: "ti-plus",
                emphasis: true,
              },
              { to: "/dashboard/stock", label: "Stock", icon: "ti-box" },
              { to: "/dashboard/invoices", label: "Bills", icon: "ti-receipt" },
              { to: "/dashboard/sales", label: "Sales", icon: "ti-chart-bar" },
              { to: "/dashboard/out-of-stock", label: "Restock list", icon: "ti-alert-circle" },
            ]}
          />
        </SectionPanel>
      )}

      {!loading && !apiAvailable && (
        <div className="alert alert-warning d-flex align-items-start gap-2 mb-4" role="alert">
          <i className="ti ti-plug-connected-x mt-1" aria-hidden />
          <div>
            <strong>Could not reach the server.</strong>
            <span className="d-block small">
              Start the backend or check VITE_API_URL in admin/.env, then refresh.
            </span>
          </div>
        </div>
      )}

      {isSuperAdmin ? (
        <>
          <div className="row g-3 mb-4 mt-1">
            <div className="col-lg-3 col-md-6">
              <MetricTile
                label="Total invoices"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats
                      ? stats.totalInvoices
                      : EMPTY
                }
                hint={apiAvailable ? "Platform total" : ""}
                icon="ti-receipt"
                tone="primary"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <MetricTile
                label="Total users"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats
                      ? stats.totalUsers
                      : EMPTY
                }
                icon="ti-users"
                tone="success"
                href="/dashboard/users"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <MetricTile
                label="Active memberships"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats != null
                      ? stats.activeMemberships
                      : EMPTY
                }
                hint=""
                icon="ti-crown"
                tone="info"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <MetricTile
                label="Blacklisted users"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats
                      ? stats.blacklistedUsers
                      : EMPTY
                }
                icon="ti-user-off"
                tone="warning"
              />
            </div>
          </div>
          <SectionPanel title="Quick guide" icon="ti-info-circle">
            <p className="text-muted small mb-0">
              <strong>Manage users</strong> — view all users, filter by signup, blacklist.{" "}
              <strong>Manage subscriptions</strong> — set plan limits and notify expiring users.
            </p>
          </SectionPanel>
        </>
      ) : (
        <>
          <div className="row g-3 mb-4 mt-1">
            <div className="col-lg-3 col-6">
              <MetricTile
                label="Today"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.today)
                      : EMPTY
                }
                hint="Sales today"
                icon="ti-calendar"
                tone="primary"
                href="/dashboard/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <MetricTile
                label="This week"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.thisWeek)
                      : EMPTY
                }
                hint="Weekly sales"
                icon="ti-chart-bar"
                tone="success"
                href="/dashboard/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <MetricTile
                label="This month"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.thisMonth)
                      : EMPTY
                }
                hint="Monthly sales"
                icon="ti-calendar-month"
                tone="info"
                href="/dashboard/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <MetricTile
                label="This year"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.thisYear)
                      : EMPTY
                }
                hint="Year to date"
                icon="ti-calendar-year"
                tone="warning"
                href="/dashboard/sales"
              />
            </div>
          </div>
          {apiAvailable && stockSummary != null && (
            <div className="row g-3 mb-4">
              <div className="col-lg-4 col-md-6">
                <MetricTile
                  label="Inventory value"
                  value={formatAmount(stockSummary.inventoryValue)}
                  hint={`${stockSummary.totalProducts} products tracked`}
                  icon="ti-box"
                  tone="info"
                  href="/dashboard/stock"
                />
              </div>
              {stockSummary.lowStockCount > 0 && (
                <div className="col-lg-4 col-md-6">
                  <MetricTile
                    label="Need restock"
                    value={stockSummary.lowStockCount}
                    hint="Items below alert level"
                    icon="ti-alert-triangle"
                    tone="warning"
                    href="/dashboard/stock"
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
