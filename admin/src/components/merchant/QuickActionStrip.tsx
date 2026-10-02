import { Link } from "react-router-dom";

type Action = {
  to: string;
  label: string;
  icon: string;
  emphasis?: boolean;
};

export default function QuickActionStrip({ actions }: { actions: Action[] }) {
  return (
    <div className="merchant-quick-actions">
      {actions.map((a) => (
        <Link
          key={a.to}
          to={a.to}
          className={`merchant-quick-actions__item${a.emphasis ? " merchant-quick-actions__item--emphasis" : ""}`}
        >
          <span className="merchant-quick-actions__icon">
            <i className={`ti ${a.icon}`} aria-hidden />
          </span>
          <span className="merchant-quick-actions__label">{a.label}</span>
        </Link>
      ))}
    </div>
  );
}
