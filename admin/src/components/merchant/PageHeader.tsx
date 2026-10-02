import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  badge,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  badge?: string;
}) {
  return (
    <header className="merchant-page-header mb-4">
      <div className="merchant-page-header__main">
        {icon ? (
          <span className="merchant-page-header__icon" aria-hidden>
            <i className={`ti ${icon}`} />
          </span>
        ) : null}
        <div className="merchant-page-header__text">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h1 className="merchant-page-header__title mb-0">{title}</h1>
            {badge ? <span className="merchant-page-header__badge">{badge}</span> : null}
          </div>
          {subtitle ? <p className="merchant-page-header__subtitle mb-0">{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="merchant-page-header__actions">{actions}</div> : null}
    </header>
  );
}
