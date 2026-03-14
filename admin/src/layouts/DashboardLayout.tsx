import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/', icon: 'ti-home', label: 'Dashboard' },
  { to: '/invoices', icon: 'ti-receipt', label: 'Invoices' },
  { to: '/users', icon: 'ti-users', label: 'Users' },
  { to: '/memberships', icon: 'ti-crown', label: 'Memberships' },
  { to: '/manage-features', icon: 'ti-settings', label: 'Manage features' },
];

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed((s) => !s);
  };

  const openMobile = () => {
    setMobileOpen(true);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
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
        <div className="ms-auto">
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
                <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
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
          {NAV_ITEMS.map(({ to, icon, label }) => (
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
              className="nav-link border-0 bg-transparent w-100 text-start"
              onClick={handleLogout}
            >
              <i className="ti ti-logout" />
              <span className="nav-text">Log out</span>
            </button>
          </li>
        </ul>
      </aside>

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
