import type { CSSProperties, ReactNode } from "react";

export default function MerchantFilterField({
  label,
  htmlFor,
  children,
  className = "",
  style,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`merchant-filter-field ${className}`.trim()} style={style}>
      <label className="merchant-filter-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
