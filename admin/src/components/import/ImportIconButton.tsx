import type { ButtonHTMLAttributes } from "react";

export default function ImportIconButton({
  icon,
  label,
  variant = "outline-secondary",
  className = "",
  size = "sm",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;
  variant?: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "md" ? "" : "btn-sm";
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-icon import-icon-btn ${sizeClass} ${className}`.trim()}
      title={label}
      aria-label={label}
      {...props}
    >
      <i className={`ti ${icon}`} aria-hidden />
    </button>
  );
}
