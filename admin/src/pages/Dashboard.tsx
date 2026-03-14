import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminStats } from '../api/admin';

const PLACEHOLDER = '—';
const NEED_API = 'Need backend API';

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
  color: 'primary' | 'success' | 'info' | 'warning';
  href?: string;
}) {
  const content = (
    <div className={`card border-0 shadow-sm rounded-3 h-100 p-4 bg-${color} bg-opacity-10 border-start border-4 border-${color}`}>
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
    return <Link to={href} className="text-decoration-none text-dark">{content}</Link>;
  }
  return content;
}

export default function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div className="mb-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Dashboard</h1>
      <p className="text-muted mb-4">Overview of BoloBill platform</p>

      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Total Invoices"
            value={loading ? '…' : apiAvailable && stats ? stats.totalInvoices : PLACEHOLDER}
            sub={apiAvailable ? '' : NEED_API}
            icon="ti-receipt"
            color="primary"
            href="/invoices"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Total Users"
            value={loading ? '…' : apiAvailable && stats ? stats.totalUsers : PLACEHOLDER}
            sub={apiAvailable ? '' : NEED_API}
            icon="ti-users"
            color="success"
            href="/users"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Active Memberships"
            value={loading ? '…' : apiAvailable && stats != null ? stats.activeMemberships : PLACEHOLDER}
            sub={apiAvailable && stats?.activeMemberships === 0 ? 'Not implemented yet' : !apiAvailable ? NEED_API : ''}
            icon="ti-crown"
            color="info"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <StatCard
            title="Blacklisted Users"
            value={loading ? '…' : apiAvailable && stats ? stats.blacklistedUsers : PLACEHOLDER}
            sub={apiAvailable ? '' : NEED_API}
            icon="ti-user-off"
            color="warning"
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <h3 className="h5 mb-3">Quick actions</h3>
          <p className="text-muted small mb-0">
            Use the sidebar to open Invoices, Users, Memberships, and Manage features. When backend
            APIs are not available, you will see placeholders and &quot;Need backend API&quot; until the server is deployed.
          </p>
        </div>
      </div>
    </div>
  );
}
