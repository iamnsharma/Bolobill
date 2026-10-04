import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useGuestMode } from "../contexts/GuestModeContext";
import { FinancePrivacyProvider, useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import { ShopSettingsProvider, useShopSettings } from "../contexts/ShopSettingsContext";
import ConfirmModal from "../components/ConfirmModal";
import FinanceUnlockModal from "../components/FinanceUnlockModal";
import FinanceInventoryPinSetupModal from "../components/FinanceInventoryPinSetupModal";
import LocaleSwitcher from "../components/LocaleSwitcher";
import { BUSINESS_NAV_SECTIONS } from "../config/merchantNav";
import { VOICE_MIC_FEATURE_ENABLED } from "../utils/voiceComingSoon";
import BoloBillLogo from "../components/BoloBillLogo";

const SUPERADMIN_NAV = [
  { to: "/dashboard", icon: "ti-home", label: "Dashboard" },
  { to: "/dashboard/users", icon: "ti-users", label: "Manage users" },
  { to: "/dashboard/subscriptions", icon: "ti-crown", label: "Manage subscriptions" },
  ...(VOICE_MIC_FEATURE_ENABLED
    ? [{ to: "/dashboard/whisper", icon: "ti-microphone", label: "Whisper" }]
    : []),
];

type NavItem = { to: string; icon: string; label: string };

function DashboardLayoutInner() {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showExitGuestConfirm, setShowExitGuestConfirm] = useState(false);
  const { isGuest, exitGuestMode } = useGuestMode();
  const [showFinanceUnlock, setShowFinanceUnlock] = useState(false);
  const [showFinancePinSetup, setShowFinancePinSetup] = useState(false);
  const [financeToggleError, setFinanceToggleError] = useState<string | null>(null);
  const { user, isSuperAdmin, logout } = useAuth();
  const {
    hideFinance,
    hasInventoryPin,
    financeSyncing,
    hideFinanceReports,
    unlockFinanceReports,
  } = useFinancePrivacy();
  const { displayStoreName, settings } = useShopSettings();
  const storeInitial = displayStoreName.charAt(0).toUpperCase() || "S";
  const navigate = useNavigate();
  const superAdminNavItems: NavItem[] = SUPERADMIN_NAV;

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

  const handleExitGuestConfirm = () => {
    setShowExitGuestConfirm(false);
    exitGuestMode();
    navigate("/", { replace: true });
  };

  return (
    <>
      <div
        className={`overlay ${mobileOpen ? "show" : ""}`}
        onClick={closeMobile}
        aria-hidden
      />
      <nav
        className={`navbar bg-white border-bottom fixed-top topbar merchant-topbar flex-column align-items-stretch p-0${
          isGuest ? " merchant-topbar--guest-active" : ""
        }`}>
        {isGuest ? (
          <div className="merchant-topbar-guest-strip" role="status">
            <span className="merchant-topbar-guest-strip__text">
              <i className="ti ti-device-laptop me-1" aria-hidden />
              <span className="d-none d-md-inline">{t("guest.banner")}</span>
              <span className="d-md-none">{t("guest.previewLabel")}</span>
            </span>
            <button
              type="button"
              className="btn btn-sm btn-light merchant-topbar-guest-strip__exit"
              onClick={() => setShowExitGuestConfirm(true)}>
              {t("guest.exit")}
            </button>
          </div>
        ) : null}
        <div className="merchant-topbar-row d-flex align-items-center flex-grow-1 w-100 px-3">
        <button
          type="button"
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
          onClick={toggleSidebar}
          aria-label={t("common.toggleSidebar")}>
          <i className="ti ti-layout-sidebar-left-expand" />
        </button>
        <button
          type="button"
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={openMobile}
          aria-label={t("common.openMenu")}>
          <i className="ti ti-layout-sidebar-left-expand" />
        </button>
        <NavLink to="/dashboard" className="merchant-topbar-brand d-lg-none text-decoration-none">
          <span className="merchant-topbar-brand__mark">{storeInitial}</span>
          <span className="merchant-topbar-brand__name">{displayStoreName}</span>
        </NavLink>
        <div className="ms-auto d-flex align-items-center gap-2">
          <LocaleSwitcher />
          {!isSuperAdmin ? (
          <div
            className={`finance-privacy-toggle${hideFinance ? " is-active" : ""}`}
            title={hideFinance ? t("finance.showTitle") : t("finance.hideTitle")}>
            <button
              type="button"
              className={`finance-privacy-toggle__btn${financeSyncing ? " is-busy" : ""}`}
              aria-busy={financeSyncing}
              onClick={() => {
                setFinanceToggleError(null);
                if (hideFinance) {
                  setShowFinanceUnlock(true);
                  return;
                }
                if (!hasInventoryPin) {
                  setShowFinancePinSetup(true);
                  return;
                }
                hideFinanceReports().catch((err: unknown) => {
                  const msg = (err as { response?: { data?: { message?: string } } })?.response
                    ?.data?.message;
                  setFinanceToggleError(msg || t("finance.hideFailed"));
                });
              }}
              aria-pressed={hideFinance}
              aria-label={hideFinance ? t("finance.showAria") : t("finance.hideAria")}>
              <span className="finance-privacy-toggle__icon" aria-hidden>
                <i className={`ti ${hideFinance ? "ti-eye-off" : "ti-currency-rupee"}`} />
              </span>
              <span className="finance-privacy-toggle__text">
                <span className="finance-privacy-toggle__label">
                  {hideFinance ? t("finance.revenueHidden") : t("finance.hideRevenue")}
                </span>
                <span className="finance-privacy-toggle__hint d-none d-lg-inline">
                  {hideFinance ? t("finance.tapPinToShow") : t("finance.reportsOnly")}
                </span>
              </span>
              <span
                className={`finance-privacy-toggle__switch${hideFinance ? " on" : ""}`}
                aria-hidden>
                <span className="finance-privacy-toggle__knob" />
              </span>
            </button>
          </div>
          ) : null}
          {financeToggleError ? (
            <span className="small text-danger d-none d-md-inline" role="alert">
              {financeToggleError}
            </span>
          ) : null}
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
                {isGuest ? t("guest.previewLabel") : user?.name || user?.phone}
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
                  {t("nav.settings")}
                </NavLink>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              {!isGuest ? (
                <li>
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={handleLogoutClick}>
                    <i className="ti ti-logout me-2" />
                    {t("nav.logout")}
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
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
            {isSuperAdmin ? (
              <BoloBillLogo variant="lockup" className="merchant-platform-logo" alt="Bolo Bill" />
            ) : (
              <>
                <span className="merchant-logo-mark">{storeInitial}</span>
                <span className="merchant-logo-text">
                  <span className="merchant-logo-name">{displayStoreName}</span>
                  {settings.storeTagline ? (
                    <span className="merchant-logo-tagline">{settings.storeTagline}</span>
                  ) : null}
                </span>
              </>
            )}
          </NavLink>
        </div>
        <ul className="nav flex-column merchant-nav">
          {isSuperAdmin
            ? superAdminNavItems.map(({ to, icon, label }) => (
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
              ))
            : BUSINESS_NAV_SECTIONS.flatMap((section, sectionIndex) => [
                <li
                  key={`section-${section.labelKey}`}
                  className={`px-4 py-2 ${sectionIndex > 0 ? "pt-3" : ""}`}>
                  <small className="nav-text merchant-nav-label">{t(section.labelKey)}</small>
                </li>,
                ...section.items.map(({ to, icon, labelKey }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === "/dashboard"}
                      className={({ isActive }) =>
                        `nav-link merchant-nav-link ${isActive ? "active" : ""}`
                      }
                      onClick={closeMobile}>
                      <i className={`ti ${icon}`} />
                      <span className="nav-text">{t(labelKey)}</span>
                    </NavLink>
                  </li>
                )),
              ])}
        </ul>
      </aside>

      <FinanceInventoryPinSetupModal
        open={showFinancePinSetup}
        busy={financeSyncing}
        onClose={() => setShowFinancePinSetup(false)}
        onSubmit={(inventoryPin) => hideFinanceReports(inventoryPin)}
      />

      <FinanceUnlockModal
        open={showFinanceUnlock}
        busy={financeSyncing}
        onClose={() => setShowFinanceUnlock(false)}
        onSubmit={unlockFinanceReports}
      />

      <ConfirmModal
        show={showLogoutConfirm}
        title={t("logoutModal.title")}
        message={t("logoutModal.message")}
        variant="warning"
        confirmLabel={t("logoutModal.confirm")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmModal
        show={showExitGuestConfirm}
        title={t("guest.exitConfirmTitle")}
        message={t("guest.exitConfirmMessage")}
        variant="warning"
        confirmLabel={t("guest.exitConfirmAction")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleExitGuestConfirm}
        onCancel={() => setShowExitGuestConfirm(false)}
      />

      <main
        id="content"
        className={`content pb-4 merchant-content ${sidebarCollapsed ? "full" : ""}${isGuest ? " merchant-content--guest" : ""}`}>
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
