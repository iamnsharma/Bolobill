import { ReactNode } from "react";
import MarketingBackdrop from "./marketing/MarketingBackdrop";
import MarketingHeader from "./marketing/MarketingHeader";

export type AuthHighlight = { icon: string; text: string };

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  badge?: string;
  formHeading?: string;
  formLead?: string;
  highlights?: AuthHighlight[];
  /** Super-admin login skin (hides business merchant messaging). */
  variant?: "business" | "platform";
  onBrandSecretTap?: () => void;
  onExitPlatformAdmin?: () => void;
};

const BUSINESS_HIGHLIGHTS: AuthHighlight[] = [
  { icon: "ti-receipt-2", text: "Fast billing from your product catalog" },
  { icon: "ti-brand-whatsapp", text: "WhatsApp-ready customer bills" },
  { icon: "ti-chart-bar", text: "Sales insights without spreadsheets" },
];

const PLATFORM_HIGHLIGHTS: AuthHighlight[] = [
  { icon: "ti-users", text: "Onboard and manage merchant accounts" },
  { icon: "ti-crown", text: "Subscription plans, limits, and renewals" },
  { icon: "ti-shield-lock", text: "Platform-wide access — not for shop staff" },
];

export default function AuthScreenLayout({
  title,
  subtitle,
  children,
  badge = "Business panel",
  formHeading = "Sign in",
  formLead = "Use your business phone number and PIN.",
  highlights,
  variant = "business",
  onBrandSecretTap,
  onExitPlatformAdmin,
}: AuthScreenLayoutProps) {
  const isPlatform = variant === "platform";
  const featureList = highlights ?? (isPlatform ? PLATFORM_HIGHLIGHTS : BUSINESS_HIGHLIGHTS);

  return (
    <div
      className={`marketing-page marketing-page--auth min-vh-100 d-flex flex-column${isPlatform ? " marketing-page--auth-platform" : ""}`}
    >
      <MarketingHeader
        mode={isPlatform ? "platform" : "solid"}
        showNav={false}
        onBrandSecretTap={isPlatform ? undefined : onBrandSecretTap}
        platformAdminMode={isPlatform}
        onBackToBusinessLogin={onExitPlatformAdmin}
      />
      <div className="marketing-auth-split flex-grow-1">
        <aside
          className={`marketing-auth-split-left${isPlatform ? " marketing-auth-split-left--platform" : ""}`}
        >
          {!isPlatform ? <MarketingBackdrop intensity="subtle" /> : null}
          <div className="marketing-auth-split-left-shade" aria-hidden />
          <div className="marketing-auth-split-left-inner">
            <span
              className={`marketing-auth-badge marketing-auth-badge--on-dark${isPlatform ? " marketing-auth-badge--platform" : ""}`}
            >
              {badge}
            </span>
            <h1 className="marketing-auth-title marketing-auth-title--on-dark">{title}</h1>
            <p className="marketing-auth-subtitle marketing-auth-subtitle--on-dark">{subtitle}</p>
            <ul className="marketing-auth-feature-list">
              {featureList.map((item) => (
                <li key={item.text}>
                  <i className={`ti ${item.icon}`} aria-hidden />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div
          className={`marketing-auth-split-right${isPlatform ? " marketing-auth-split-right--platform" : ""}`}
        >
          <div
            className={`marketing-auth-card animate-fade-in w-100${isPlatform ? " marketing-auth-card--platform" : ""}`}
          >
            <div className="marketing-auth-form-head d-lg-none">
              <span
                className={`marketing-auth-badge${isPlatform ? " marketing-auth-badge--platform-inline" : ""}`}
              >
                {badge}
              </span>
              <h2
                className={`marketing-auth-form-title${isPlatform ? " marketing-auth-form-title--platform" : ""}`}
              >
                {title}
              </h2>
            </div>
            <h2
              className={`marketing-auth-form-title d-none d-lg-block${isPlatform ? " marketing-auth-form-title--platform" : ""}`}
            >
              {formHeading}
            </h2>
            <p
              className={`marketing-auth-form-lead d-none d-lg-block${isPlatform ? " marketing-auth-form-lead--platform" : ""}`}
            >
              {formLead}
            </p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
