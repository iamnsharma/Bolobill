import { Link, useLocation } from "react-router-dom";
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
  const { pathname } = useLocation();
  const onLogin = pathname === "/login";
  const onSignup = pathname === "/signup";
  const onAuth = onLogin || onSignup;

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
            ) : onAuth ? (
              onSignup ? (
                <Link to="/login" className="marketing-header-btn marketing-header-btn--primary">
                  Log in
                </Link>
              ) : (
                <Link to="/signup" className="marketing-header-btn marketing-header-btn--primary">
                  Get access
                </Link>
              )
            ) : (
              <>
                <Link to="/login" className="marketing-header-btn marketing-header-btn--ghost">
                  Log in
                </Link>
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
