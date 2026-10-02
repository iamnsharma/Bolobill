import { Link } from "react-router-dom";

type Tone = "primary" | "success" | "info" | "warning";

export default function MetricTile({
  label,
  value,
  hint,
  icon,
  tone = "primary",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  tone?: Tone;
  href?: string;
}) {
  const inner = (
    <div className={`merchant-metric-tile merchant-metric-tile--${tone}`}>
      <div className="merchant-metric-tile__icon">
        <i className={`ti ${icon}`} aria-hidden />
      </div>
      <div className="merchant-metric-tile__content">
        <span className="merchant-metric-tile__label">{label}</span>
        <span className="merchant-metric-tile__value">{value}</span>
        {hint ? <span className="merchant-metric-tile__hint">{hint}</span> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="merchant-metric-tile-link text-decoration-none">
        {inner}
      </Link>
    );
  }
  return inner;
}
