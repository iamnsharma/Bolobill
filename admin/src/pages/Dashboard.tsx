import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminStats, type SalesSummary } from "../api/admin";
import { DownloadAppSection } from "../components/DownloadAppSection";

const PLACEHOLDER = "—";
const NEED_API = "Need backend API";

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
  href,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: string;
  color: "primary" | "success" | "info" | "warning";
  href?: string;
}) {
  const content = (
    <div
      className={`card border-0 shadow-sm rounded-3 h-100 p-4 bg-${color} bg-opacity-10 border-start border-4 border-${color}`}>
      <div className="d-flex gap-3 align-items-center">
        <div className={`icon-shape icon-md bg-${color} text-white rounded-2`}>
          <i className={`ti ${icon} fs-4`} />
        </div>
        <div>
          <h2 className="fs-6 text-muted mb-1">{title}</h2>
          <h3 className="fw-bold mb-0">{value}</h3>
          <small className={`text-${color}`}>{sub}</small>
        </div>
      </div>
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="text-decoration-none text-dark">
        {content}
      </Link>
    );
  }
  return content;
}

export default function Dashboard() {
  const { isSuperAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
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
      adminApi
        .getSalesSummary()
        .then((data) => {
          setSalesSummary(data);
          setApiAvailable(true);
        })
        .catch(() => {
          setSalesSummary(null);
          setApiAvailable(false);
        })
        .finally(() => setLoading(false));
    }
  }, [isSuperAdmin]);

  const formatMoney = (n: number) =>
    n != null ? `₹${Number(n).toLocaleString()}` : PLACEHOLDER;

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Dashboard</h1>
      <p className="text-muted mb-4">
        {isSuperAdmin
          ? "Overview of BoloBill platform. Use the sidebar for Invoices, Users, and settings."
          : "Your sales at a glance. View bills, sales summary, items sold, and out-of-stock list from the sidebar."}
      </p>

      <div className="mb-4">
        <DownloadAppSection />
      </div>

      {isSuperAdmin ? (
        <>
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Total Invoices"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats
                      ? stats.totalInvoices
                      : PLACEHOLDER
                }
                sub={apiAvailable ? "" : NEED_API}
                icon="ti-receipt"
                color="primary"
                href="/invoices"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Total Users"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats
                      ? stats.totalUsers
                      : PLACEHOLDER
                }
                sub={apiAvailable ? "" : NEED_API}
                icon="ti-users"
                color="success"
                href="/users"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Active Memberships"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats != null
                      ? stats.activeMemberships
                      : PLACEHOLDER
                }
                sub={
                  apiAvailable && stats?.activeMemberships === 0
                    ? "Not implemented yet"
                    : !apiAvailable
                      ? NEED_API
                      : ""
                }
                icon="ti-crown"
                color="info"
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <StatCard
                title="Blacklisted Users"
                value={
                  loading
                    ? "…"
                    : apiAvailable && stats
                      ? stats.blacklistedUsers
                      : PLACEHOLDER
                }
                sub={apiAvailable ? "" : NEED_API}
                icon="ti-user-off"
                color="warning"
              />
            </div>
          </div>
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h3 className="h5 mb-3">Quick actions</h3>
              <p className="text-muted small mb-0">
                Use the sidebar to open Invoices, Users, Memberships, Store links, and Manage
                features.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-6">
              <StatCard
                title="Today"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatMoney(salesSummary.today)
                      : PLACEHOLDER
                }
                sub="Sales today"
                icon="ti-calendar"
                color="primary"
                href="/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <StatCard
                title="This week"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatMoney(salesSummary.thisWeek)
                      : PLACEHOLDER
                }
                sub="Sales this week"
                icon="ti-chart-bar"
                color="success"
                href="/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <StatCard
                title="This month"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatMoney(salesSummary.thisMonth)
                      : PLACEHOLDER
                }
                sub="Sales this month"
                icon="ti-calendar-month"
                color="info"
                href="/sales"
              />
            </div>
            <div className="col-lg-3 col-6">
              <StatCard
                title="This year"
                value={
                  loading
                    ? "…"
                    : apiAvailable && salesSummary != null
                      ? formatMoney(salesSummary.thisYear)
                      : PLACEHOLDER
                }
                sub="Sales this year"
                icon="ti-calendar-year"
                color="warning"
                href="/sales"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
