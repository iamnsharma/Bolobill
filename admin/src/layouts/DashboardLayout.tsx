import { useState, useMemo } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMembership } from '../contexts/MembershipContext';
import ConfirmModal from '../components/ConfirmModal';

const SUPERADMIN_NAV = [
  { to: '/', icon: 'ti-home', label: 'Dashboard' },
  { to: '/invoices', icon: 'ti-receipt', label: 'Invoices' },
  { to: '/users', icon: 'ti-users', label: 'Users' },
  { to: '/memberships', icon: 'ti-crown', label: 'Memberships' },
  { to: '/manage-features', icon: 'ti-settings', label: 'Manage features' },
];

const BUSINESS_NAV = [
  { to: '/', icon: 'ti-home', label: 'Dashboard' },
  { to: '/invoices', icon: 'ti-receipt', label: 'Bills & Invoices' },
  { to: '/invoices/new', icon: 'ti-plus', label: 'Create Bill' },
  { to: '/sales', icon: 'ti-chart-bar', label: 'Sales Summary' },
  { to: '/items-sold', icon: 'ti-package', label: 'Items Sold' },
  { to: '/out-of-stock', icon: 'ti-alert-circle', label: 'Out of Stock' },
  { to: '/memberships', icon: 'ti-crown', label: 'Plans' },
];

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isSuperAdmin, logout } = useAuth();
  const { hasActiveMembership } = useMembership();
  const navigate = useNavigate();
  const navItems = useMemo(() => (isSuperAdmin ? SUPERADMIN_NAV : BUSINESS_NAV), [isSuperAdmin]);

  const toggleSidebar = () => {
    setSidebarCollapsed((s) => !s);
  };

  const openMobile = () => {
    setMobileOpen(true);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div
        className={`overlay ${mobileOpen ? 'show' : ''}`}
        onClick={closeMobile}
        aria-hidden
      />
      <nav className="navbar bg-white border-bottom fixed-top topbar px-3">
        <button
          type="button"
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="ti ti-layout-sidebar-left-expand" />
        </button>
        <button
          type="button"
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={openMobile}
          aria-label="Open menu"
        >
          <i className="ti ti-layout-sidebar-left-expand" />
        </button>
        <div className="ms-auto d-flex align-items-center gap-2">
          {hasActiveMembership && (
            <NavLink
              to="/memberships"
              className="membership-header-badge text-decoration-none"
              title="Your membership"
              aria-label="Your membership"
            >
              <i className="ti ti-crown" style={{ fontSize: '1rem' }} />
            </NavLink>
          )}
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="avatar avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
              <span className="d-none d-sm-inline">{user?.name || user?.phone}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text small text-muted">
                  {user?.phone}
                </span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button type="button" className="dropdown-item text-danger" onClick={handleLogoutClick}>
                  <i className="ti ti-logout me-2" />
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <aside
        id="sidebar"
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-show' : ''}`}
      >
        <div className="logo-area">
          <NavLink to="/" className="d-inline-flex align-items-center text-dark text-decoration-none">
            <span className="icon-shape icon-sm bg-primary text-white rounded-2 d-flex align-items-center justify-content-center">
              <i className="ti ti-receipt" />
            </span>
            <span className="logo-text ms-2 fw-bold">BoloBill Admin</span>
          </NavLink>
        </div>
        <ul className="nav flex-column">
          <li className="px-4 py-2">
            <small className="nav-text">Main</small>
          </li>
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobile}
              >
                <i className={`ti ${icon}`} />
                <span className="nav-text">{label}</span>
              </NavLink>
            </li>
          ))}
          <li className="px-4 pt-4 pb-2">
            <small className="nav-text">Account</small>
          </li>
          <li>
            <button
              type="button"
              className="nav-link border-0 bg-transparent w-100 text-start text-danger"
              onClick={handleLogoutClick}
            >
              <i className="ti ti-logout" />
              <span className="nav-text">Log out</span>
            </button>
          </li>
        </ul>
      </aside>

      <ConfirmModal
        show={showLogoutConfirm}
        title="Log out?"
        message="You will need to sign in again to access the admin panel."
        variant="warning"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <main
        id="content"
        className={`content py-4 ${sidebarCollapsed ? 'full' : ''}`}
      >
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </>
  );
}
