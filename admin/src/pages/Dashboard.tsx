import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const { formatFinance, financeDataEpoch } = useFinancePrivacy();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [stockSummary, setStockSummary] = useState<{
    inventoryValue: number | null;
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
  }, [isSuperAdmin, financeDataEpoch]);

  const formatAmount = (n: number | null | undefined) => formatFinance(n);

  return (
    <PageShell>
      <PageHeader
        title={t("pages.dashboard.title")}
        icon="ti-layout-dashboard"
        subtitle={
          isSuperAdmin ? t("pages.dashboard.subtitleAdmin") : t("pages.dashboard.subtitleMerchant")
        }
      />

      {!isSuperAdmin &&
        !loading &&
        apiAvailable &&
        stockSummary != null &&
        stockSummary.totalProducts === 0 && (
          <div
            className="alert alert-info d-flex flex-column flex-sm-row align-items-sm-center gap-2 gap-sm-3 mb-4"
            role="status"
          >
            <div className="flex-grow-1">
              <strong className="d-block mb-1">{t("pages.dashboard.getStartedTitle")}</strong>
              <span className="small">{t("pages.dashboard.getStartedBody")}</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/dashboard/stock" className="btn btn-sm btn-outline-primary">
                {t("pages.dashboard.goToStock")}
              </Link>
              <Link to="/dashboard/invoices/new" className="btn btn-sm btn-primary">
                {t("pages.dashboard.createBill")}
              </Link>
            </div>
          </div>
        )}

      {!isSuperAdmin && (
        <SectionPanel flush bodyClassName="p-3">
          <QuickActionStrip
            actions={[
              {
                to: "/dashboard/invoices/new",
                label: t("pages.dashboard.newBill"),
                icon: "ti-plus",
                emphasis: true,
              },
              { to: "/dashboard/stock", label: t("nav.stock"), icon: "ti-box" },
              { to: "/dashboard/invoices", label: t("pages.dashboard.bills"), icon: "ti-receipt" },
              { to: "/dashboard/sales", label: t("pages.dashboard.sales"), icon: "ti-chart-bar" },
              { to: "/dashboard/items-sold", label: t("pages.dashboard.itemsSold"), icon: "ti-package" },
            ]}
          />
        </SectionPanel>
      )}

      {!loading && !apiAvailable && (
        <div className="alert alert-warning d-flex align-items-start gap-2 mb-4" role="alert">
          <i className="ti ti-plug-connected-x mt-1" aria-hidden />
          <div>
            <strong>{t("pages.dashboard.serverErrorTitle")}</strong>
            <span className="d-block small">{t("pages.dashboard.serverErrorBody")}</span>
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
                label={t("pages.dashboard.today")}
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.today)
                      : EMPTY
                }
                hint={t("pages.dashboard.salesToday")}
                icon="ti-calendar"
                tone="primary"
                href="/dashboard/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <MetricTile
                label={t("pages.dashboard.thisWeek")}
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.thisWeek)
                      : EMPTY
                }
                hint={t("pages.dashboard.weeklySales")}
                icon="ti-chart-bar"
                tone="success"
                href="/dashboard/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <MetricTile
                label={t("pages.dashboard.thisMonth")}
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.thisMonth)
                      : EMPTY
                }
                hint={t("pages.dashboard.monthlySales")}
                icon="ti-calendar-month"
                tone="info"
                href="/dashboard/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <MetricTile
                label={t("pages.dashboard.thisYear")}
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatAmount(salesSummary.thisYear)
                      : EMPTY
                }
                hint={t("pages.dashboard.yearToDate")}
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
                  label={t("pages.dashboard.inventoryValue")}
                  value={formatAmount(stockSummary.inventoryValue)}
                  hint={t("common.productsTracked", { count: stockSummary.totalProducts })}
                  icon="ti-box"
                  tone="info"
                  href="/dashboard/stock"
                />
              </div>
              {stockSummary.lowStockCount > 0 && (
                <div className="col-lg-4 col-md-6">
                  <MetricTile
                    label={t("pages.dashboard.needRestock")}
                    value={stockSummary.lowStockCount}
                    hint={t("pages.dashboard.belowAlert")}
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
