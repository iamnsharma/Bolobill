import type { ReactNode } from "react";

export default function SectionPanel({
  title,
  subtitle,
  icon,
  actions,
  children,
  className = "",
  bodyClassName = "p-3 p-md-4",
  flush,
}: {
  title?: string;
  subtitle?: string;
  icon?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}) {
  const showHead = title || subtitle || actions;
  return (
    <section className={`merchant-section-panel ${className}`.trim()}>
      {showHead ? (
        <div className="merchant-section-panel__head">
          <div className="merchant-section-panel__head-text">
            {title ? (
              <h2 className="merchant-section-panel__title">
                {icon ? <i className={`ti ${icon} me-2 text-primary`} aria-hidden /> : null}
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="merchant-section-panel__subtitle mb-0">{subtitle}</p> : null}
          </div>
          {actions ? <div className="merchant-section-panel__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div
        className={`merchant-section-panel__body${flush ? " merchant-section-panel__body--flush" : ""} ${bodyClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
