import { Link } from "react-router-dom";
import { ReactNode } from "react";
import MarketingBackdrop from "./marketing/MarketingBackdrop";
import MarketingHeader from "./marketing/MarketingHeader";

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  badge?: string;
  formHeading?: string;
  formLead?: string;
  onBrandSecretTap?: () => void;
};

const AUTH_HIGHLIGHTS = [
  { icon: "ti-microphone", text: "Voice billing at the counter" },
  { icon: "ti-brand-whatsapp", text: "WhatsApp-ready customer bills" },
  { icon: "ti-chart-bar", text: "Sales insights without spreadsheets" },
];

export default function AuthScreenLayout({
  title,
  subtitle,
  children,
  badge = "Merchant panel",
  formHeading = "Sign in",
  formLead = "Use your merchant phone number and PIN.",
  onBrandSecretTap,
}: AuthScreenLayoutProps) {
  return (
    <div className="marketing-page marketing-page--auth min-vh-100 d-flex flex-column">
      <MarketingHeader mode="solid" showNav={false} onBrandSecretTap={onBrandSecretTap} />
      <div className="marketing-auth-split flex-grow-1">
        <aside className="marketing-auth-split-left">
          <MarketingBackdrop intensity="subtle" />
          <div className="marketing-auth-split-left-shade" aria-hidden />
          <div className="marketing-auth-split-left-inner">
            <span className="marketing-auth-badge marketing-auth-badge--on-dark">{badge}</span>
            <h1 className="marketing-auth-title marketing-auth-title--on-dark">{title}</h1>
            <p className="marketing-auth-subtitle marketing-auth-subtitle--on-dark">{subtitle}</p>
            <ul className="marketing-auth-feature-list">
              {AUTH_HIGHLIGHTS.map((item) => (
                <li key={item.text}>
                  <i className={`ti ${item.icon}`} aria-hidden />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="marketing-auth-split-right">
          <div className="marketing-auth-card animate-fade-in w-100">
            <div className="marketing-auth-form-head d-lg-none">
              <span className="marketing-auth-badge">{badge}</span>
              <h2 className="marketing-auth-form-title">{title}</h2>
            </div>
            <h2 className="marketing-auth-form-title d-none d-lg-block">{formHeading}</h2>
            <p className="marketing-auth-form-lead d-none d-lg-block">{formLead}</p>
            {children}
            <p className="marketing-auth-footer small mb-0">
              <Link to="/" className="marketing-inline-link">
                <i className="ti ti-arrow-left me-1" aria-hidden />
                Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
