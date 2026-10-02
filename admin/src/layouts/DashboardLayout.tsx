import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FinancePrivacyProvider, useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import { ShopSettingsProvider, useShopSettings } from "../contexts/ShopSettingsContext";
import ConfirmModal from "../components/ConfirmModal";

const SUPERADMIN_NAV = [
  { to: "/dashboard", icon: "ti-home", label: "Dashboard" },
  { to: "/dashboard/users", icon: "ti-users", label: "Manage users" },
  { to: "/dashboard/subscriptions", icon: "ti-crown", label: "Manage subscriptions" },
  { to: "/dashboard/whisper", icon: "ti-microphone", label: "Whisper" },
  { to: "/dashboard/settings", icon: "ti-settings", label: "Settings" },
];

const BUSINESS_NAV = [
  { to: "/dashboard", icon: "ti-home", label: "Dashboard" },
  { to: "/dashboard/invoices/new", icon: "ti-plus", label: "Create Bill" },
  { to: "/dashboard/invoices", icon: "ti-receipt", label: "Bills & Invoices" },
  { to: "/dashboard/sales", icon: "ti-chart-bar", label: "Sales Summary" },
  { to: "/dashboard/items-sold", icon: "ti-package", label: "Items Sold" },
  { to: "/dashboard/stock", icon: "ti-box", label: "Stock" },
  { to: "/dashboard/out-of-stock", icon: "ti-alert-circle", label: "Out of Stock" },
  { to: "/dashboard/qr-code", icon: "ti-qrcode", label: "QR Code" },
  { to: "/dashboard/settings", icon: "ti-settings", label: "Settings" },
];

function DashboardLayoutInner() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isSuperAdmin, logout } = useAuth();
  const { hideFinance, setHideFinance } = useFinancePrivacy();
  const { displayStoreName, settings } = useShopSettings();
  const navigate = useNavigate();
  const navItems = isSuperAdmin ? SUPERADMIN_NAV : BUSINESS_NAV;

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
    navigate("/login", { replace: true });
  };

  const storeInitial = displayStoreName.charAt(0).toUpperCase() || "S";

  return (
    <>
      <div
        className={`overlay ${mobileOpen ? "show" : ""}`}
        onClick={closeMobile}
        aria-hidden
      />
      <nav className="navbar bg-white border-bottom fixed-top topbar px-3 merchant-topbar">
        <button
          type="button"
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar">
          <i className="ti ti-layout-sidebar-left-expand" />
        </button>
        <button
          type="button"
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={openMobile}
          aria-label="Open menu">
          <i className="ti ti-layout-sidebar-left-expand" />
        </button>
        <NavLink to="/dashboard" className="merchant-topbar-brand d-lg-none text-decoration-none">
          <span className="merchant-topbar-brand__mark">{storeInitial}</span>
          <span className="merchant-topbar-brand__name">{displayStoreName}</span>
        </NavLink>
        <div className="ms-auto d-flex align-items-center gap-2">
          <div
            className={`finance-privacy-toggle${hideFinance ? " is-active" : ""}`}
            title={
              hideFinance
                ? "Revenue & report totals are hidden — tap to show"
                : "Hide revenue, sales totals & inventory value from prying eyes"
            }>
            <button
              type="button"
              className="finance-privacy-toggle__btn"
              onClick={() => setHideFinance(!hideFinance)}
              aria-pressed={hideFinance}
              aria-label={hideFinance ? "Show revenue totals" : "Hide revenue totals"}>
              <span className="finance-privacy-toggle__icon" aria-hidden>
                <i className={`ti ${hideFinance ? "ti-eye-off" : "ti-currency-rupee"}`} />
              </span>
              <span className="finance-privacy-toggle__text">
                <span className="finance-privacy-toggle__label">
                  {hideFinance ? "Revenue hidden" : "Hide revenue"}
                </span>
                <span className="finance-privacy-toggle__hint d-none d-lg-inline">
                  {hideFinance ? "Tap to show" : "Reports only"}
                </span>
              </span>
              <span
                className={`finance-privacy-toggle__switch${hideFinance ? " on" : ""}`}
                aria-hidden>
                <span className="finance-privacy-toggle__knob" />
              </span>
            </button>
          </div>
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-light btn-sm dropdown-toggle d-flex align-items-center gap-2"
              data-bs-toggle="dropdown"
              aria-expanded="false">
              <span className="avatar avatar-sm rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
              <span className="d-none d-sm-inline">
                {user?.name || user?.phone}
              </span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <span className="dropdown-item-text small text-muted">
                  {user?.phone}
                </span>
              </li>
              <li>
                <NavLink to="/dashboard/settings" className="dropdown-item">
                  <i className="ti ti-settings me-2" />
                  Settings
                </NavLink>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={handleLogoutClick}>
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
        className={`sidebar merchant-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-show" : ""}`}>
        <div className="logo-area merchant-logo-area">
          <NavLink
            to="/dashboard"
            className="merchant-logo-link text-decoration-none"
            onClick={closeMobile}>
            <span className="merchant-logo-mark">{storeInitial}</span>
            <span className="merchant-logo-text">
              <span className="merchant-logo-name">{displayStoreName}</span>
              {settings.storeTagline ? (
                <span className="merchant-logo-tagline">{settings.storeTagline}</span>
              ) : null}
            </span>
          </NavLink>
        </div>
        <ul className="nav flex-column merchant-nav">
          <li className="px-4 py-2">
            <small className="nav-text merchant-nav-label">Menu</small>
          </li>
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/dashboard"}
                className={({ isActive }) =>
                  `nav-link merchant-nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobile}>
                <i className={`ti ${icon}`} />
                <span className="nav-text">{label}</span>
              </NavLink>
            </li>
          ))}
          <li className="px-4 pt-4 pb-2">
            <small className="nav-text merchant-nav-label">Account</small>
          </li>
          <li>
            <button
              type="button"
              className="nav-link merchant-nav-link border-0 bg-transparent w-100 text-start text-danger"
              onClick={handleLogoutClick}>
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
        className={`content pb-4 merchant-content ${sidebarCollapsed ? "full" : ""}`}>
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export default function DashboardLayout() {
  return (
    <ShopSettingsProvider>
      <FinancePrivacyProvider>
        <DashboardLayoutInner />
      </FinancePrivacyProvider>
    </ShopSettingsProvider>
  );
}
