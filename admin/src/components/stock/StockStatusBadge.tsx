export type StockBadgeKind = "low" | "out";

export default function StockStatusBadge({
  kind,
  className = "",
}: {
  kind: StockBadgeKind;
  className?: string;
}) {
  if (kind === "out") {
    return (
      <span className={`badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 ${className}`}>
        Out of stock
      </span>
    );
  }
  return (
    <span className={`badge bg-warning bg-opacity-25 text-dark ${className}`}>
      Low
    </span>
  );
}

/** Product on shelf: zero stock vs low threshold */
export function productStockBadge(product: {
  quantityOnHand: number;
  lowStockThreshold?: number | null;
}): StockBadgeKind | null {
  if (product.quantityOnHand <= 0) return "out";
  if (
    product.lowStockThreshold != null &&
    product.quantityOnHand <= product.lowStockThreshold
  ) {
    return "low";
  }
  return null;
}

/** Bill cart qty exceeds available stock */
export function cartOversellBadge(
  qtyInCart: number,
  stockOnHand: number | undefined,
): StockBadgeKind | null {
  if (stockOnHand == null) return null;
  if (qtyInCart > stockOnHand) return "out";
  return null;
}

export function exceedsAvailableStock(
  qtyInCart: number,
  stockOnHand: number | undefined,
): boolean {
  return stockOnHand != null && qtyInCart > stockOnHand;
}
