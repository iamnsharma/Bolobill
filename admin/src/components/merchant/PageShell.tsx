import type { ReactNode } from "react";

export default function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`merchant-page admin-page ${className}`.trim()}>{children}</div>;
}
