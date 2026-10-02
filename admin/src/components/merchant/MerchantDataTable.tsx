import type { ReactNode } from "react";

export default function MerchantDataTable({ children }: { children: ReactNode }) {
  return (
    <div className="table-responsive merchant-data-table">
      <table className="table table-hover align-middle mb-0">{children}</table>
    </div>
  );
}

export function MerchantTableHeadLabel({
  children,
  numeric,
}: {
  children: ReactNode;
  numeric?: boolean;
}) {
  if (numeric) {
    return <span className="merchant-data-table__head-num">{children}</span>;
  }
  return <>{children}</>;
}
