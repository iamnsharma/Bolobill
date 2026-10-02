type Props = {
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  closedLabel?: string;
  openLabel?: string;
  className?: string;
};

/** Show / hide optional analytics charts without loading graph UI until opened. */
export default function ChartToggleButton({
  open,
  onToggle,
  disabled,
  closedLabel = "View graph",
  openLabel = "Hide graph",
  className = "",
}: Props) {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-outline-primary ${className}`.trim()}
      onClick={onToggle}
      disabled={disabled}
      aria-expanded={open}
    >
      <i className={`ti ${open ? "ti-eye-off" : "ti-chart-bar"} me-1`} aria-hidden />
      {open ? openLabel : closedLabel}
    </button>
  );
}
