import { ReactNode } from "react";
import { Link } from "react-router-dom";
import MarketingBackdrop from "./MarketingBackdrop";
import MarketingHeader from "./MarketingHeader";

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export default function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div className="marketing-page marketing-page--legal">
      <MarketingBackdrop intensity="subtle" />
      <MarketingHeader mode="solid" showNav={false} />
      <main className="container marketing-legal-main py-5">
        <div className="marketing-legal-card">
          <Link
            to="/"
            className="marketing-back-link d-inline-flex align-items-center gap-1 small mb-4">
            <i className="ti ti-arrow-left" aria-hidden />
            Back to home
          </Link>
          <h1 className="marketing-legal-title">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
}
