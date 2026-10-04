import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useGuestMode } from "../../contexts/GuestModeContext";
import BoloBillLogo from "../BoloBillLogo";

type MarketingHeaderProps = {
  mode?: "transparent" | "solid" | "platform";
  scrolled?: boolean;
  showNav?: boolean;
  /** Rapid taps on brand (e.g. login easter egg); does not navigate home. */
  onBrandSecretTap?: () => void;
  platformAdminMode?: boolean;
  onBackToBusinessLogin?: () => void;
};

export default function MarketingHeader({
  mode = "transparent",
  scrolled = false,
  showNav = true,
  onBrandSecretTap,
  platformAdminMode = false,
  onBackToBusinessLogin,
}: MarketingHeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isGuest, enterGuestMode, exitGuestMode } = useGuestMode();
  const { pathname } = useLocation();
  const onLogin = pathname === "/login";
  const onSignup = pathname === "/signup";
  const onAuth = onLogin || onSignup;

  const startGuestDemo = () => {
    enterGuestMode();
    navigate("/dashboard", { replace: true });
  };

  const handleExitGuest = () => {
    exitGuestMode();
    navigate("/", { replace: true });
  };

  const showGuestDemoCta = !platformAdminMode && !isAuthenticated && !isGuest;
  const showGuestExit = !platformAdminMode && isGuest;

  const isPlatformHeader = mode === "platform" || platformAdminMode;
  const isSolid =
    !isPlatformHeader &&
    (mode === "solid" || (mode === "transparent" && !onAuth && scrolled));

  return (
    <header
      className={`marketing-header ${
        isPlatformHeader
          ? "marketing-header--platform"
          : isSolid
            ? "marketing-header--solid"
            : "marketing-header--dark"
      }`}
    >
      <div className="container-fluid container-lg">
        <div
          className={`marketing-header-inner ${showNav ? "" : "marketing-header-inner--no-nav"}`.trim()}>
          <div className="marketing-header-brand-group">
            {onAuth ? (
              <Link to="/" className="marketing-back-home text-decoration-none">
                <i className="ti ti-arrow-left" aria-hidden />
                <span className="d-none d-sm-inline">Back to home</span>
              </Link>
            ) : null}
            {onBrandSecretTap ? (
              <button
                type="button"
                className="marketing-brand marketing-brand--tap border-0 bg-transparent p-0"
                onClick={onBrandSecretTap}
                aria-label="BoloBill home">
                <BoloBillLogo variant="lockup" className="marketing-brand-logo" />
              </button>
            ) : (
              <Link to="/" className="marketing-brand text-decoration-none">
                <BoloBillLogo variant="lockup" className="marketing-brand-logo" />
              </Link>
            )}
          </div>

          {showNav ? (
            <nav className="marketing-nav d-none d-xl-flex" aria-label="Primary">
              <a href="/#landing-import" className="marketing-nav-link">
                Smart import
              </a>
              <a href="/#landing-features" className="marketing-nav-link">
                Features
              </a>
              <a href="/#landing-how" className="marketing-nav-link">
                How it works
              </a>
              <a href="/#landing-contact" className="marketing-nav-link">
                Onboarding
              </a>
            </nav>
          ) : null}

          <div className="marketing-header-actions">
            {platformAdminMode && onBackToBusinessLogin ? (
              <button
                type="button"
                className="marketing-header-btn marketing-header-btn--exit-admin"
                onClick={onBackToBusinessLogin}
              >
                Exit Admin
              </button>
            ) : showGuestExit ? (
              <>
                <Link to="/dashboard" className="marketing-header-btn marketing-header-btn--ghost">
                  {t("guest.previewLabel")}
                </Link>
                <button
                  type="button"
                  className="marketing-header-btn marketing-header-btn--primary"
                  onClick={handleExitGuest}>
                  {t("guest.exit")}
                </button>
              </>
            ) : onAuth ? (
              <>
                {showGuestDemoCta ? (
                  <button
                    type="button"
                    className="marketing-header-btn marketing-header-btn--ghost"
                    onClick={startGuestDemo}>
                    <i className="ti ti-device-laptop me-1 d-none d-md-inline" aria-hidden />
                    {t("landing.guestCta")}
                  </button>
                ) : null}
                {onSignup ? (
                  <Link to="/login" className="marketing-header-btn marketing-header-btn--primary">
                    Log in
                  </Link>
                ) : (
                  <Link to="/signup" className="marketing-header-btn marketing-header-btn--primary">
                    Get access
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="marketing-header-btn marketing-header-btn--ghost">
                  Log in
                </Link>
                {showGuestDemoCta ? (
                  <button
                    type="button"
                    className="marketing-header-btn marketing-header-btn--guest"
                    onClick={startGuestDemo}>
                    <i className="ti ti-device-laptop me-1" aria-hidden />
                    <span className="d-none d-sm-inline">{t("landing.guestCta")}</span>
                    <span className="d-sm-none">Demo</span>
                  </button>
                ) : null}
                <Link to="/signup" className="marketing-header-btn marketing-header-btn--primary">
                  Get access
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
