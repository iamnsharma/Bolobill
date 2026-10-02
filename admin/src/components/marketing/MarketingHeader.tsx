import { Link, useLocation } from "react-router-dom";

type MarketingHeaderProps = {
  mode?: "transparent" | "solid";
  scrolled?: boolean;
  showNav?: boolean;
  /** Rapid taps on brand (e.g. login easter egg); does not navigate home. */
  onBrandSecretTap?: () => void;
};

export default function MarketingHeader({
  mode = "transparent",
  scrolled = false,
  showNav = true,
  onBrandSecretTap,
}: MarketingHeaderProps) {
  const { pathname } = useLocation();
  const onLogin = pathname === "/login";
  const onSignup = pathname === "/signup";
  const onAuth = onLogin || onSignup;

  const isSolid =
    !onAuth && (mode === "solid" || (mode === "transparent" && scrolled));

  return (
    <header
      className={`marketing-header ${isSolid ? "marketing-header--solid" : "marketing-header--dark"}`}>
      <div className="container-fluid container-lg">
        <div
          className={`marketing-header-inner ${showNav ? "" : "marketing-header-inner--no-nav"}`.trim()}>
          {onBrandSecretTap ? (
            <button
              type="button"
              className="marketing-brand marketing-brand--tap border-0 bg-transparent p-0"
              onClick={onBrandSecretTap}
              aria-label="BoloBill home">
              <span className="marketing-brand-text">
                Bolo<span className="marketing-brand-accent">Bill</span>
              </span>
            </button>
          ) : (
            <Link to="/" className="marketing-brand text-decoration-none">
              <span className="marketing-brand-text">
                Bolo<span className="marketing-brand-accent">Bill</span>
              </span>
            </Link>
          )}

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
            {!onLogin ? (
              <Link to="/login" className="marketing-header-btn marketing-header-btn--ghost">
                Log in
              </Link>
            ) : null}
            {!onSignup ? (
              <Link to="/signup" className="marketing-header-btn marketing-header-btn--primary">
                Get access
              </Link>
            ) : (
              <Link to="/login" className="marketing-header-btn marketing-header-btn--primary">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
