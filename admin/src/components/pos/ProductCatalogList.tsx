import type { StockProduct } from "../../api/admin";
import StockStatusBadge, {
  cartOversellBadge,
  productStockBadge,
} from "../stock/StockStatusBadge";

export default function ProductCatalogList({
  products,
  loading,
  emptyAction,
  formatMoney,
  cartQtyByProductId,
  recentlyAddedId,
  onAdd,
  subtleLoading = false,
}: {
  products: StockProduct[];
  loading: boolean;
  subtleLoading?: boolean;
  emptyAction?: React.ReactNode;
  formatMoney: (amount: number) => string;
  cartQtyByProductId: Record<string, number>;
  recentlyAddedId?: string | null;
  onAdd: (product: StockProduct) => void;
}) {
  if (loading && products.length === 0) {
    return <p className="small text-muted py-3 mb-0">Loading products…</p>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 bg-light rounded-3">
        <p className="text-muted mb-2">No products found.</p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div
      className={`pos-catalog-list border rounded-3 overflow-hidden${subtleLoading ? " opacity-75" : ""}`}
    >
      {products.map((p) => {
        const inCart = cartQtyByProductId[p._id] ?? 0;
        const justAdded = recentlyAddedId === p._id;
        const shelfBadge = productStockBadge(p);
        const oversellBadge = cartOversellBadge(inCart, p.quantityOnHand);
        const cannotAddMore =
          p.quantityOnHand <= 0 || inCart >= p.quantityOnHand;
        return (
          <div
            key={p._id}
            className={`pos-catalog-row d-flex align-items-center gap-2 px-3 py-2 border-bottom bg-white${
              justAdded ? " is-just-added" : ""
            }`}
          >
            <div className="flex-grow-1 min-width-0">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="fw-semibold text-truncate">{p.name}</span>
                {oversellBadge && <StockStatusBadge kind={oversellBadge} />}
                {!oversellBadge && shelfBadge && <StockStatusBadge kind={shelfBadge} />}
              </div>
              <div className="small text-muted">
                {formatMoney(p.unitPrice)} · {p.quantityOnHand} {p.unit}
                {inCart > 0 && (
                  <span className="text-primary ms-1">· In cart: {inCart}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className={`btn btn-sm flex-shrink-0 ${
                justAdded ? "btn-success" : "btn-primary"
              }`}
              onClick={() => onAdd(p)}
              disabled={cannotAddMore}
              title={
                cannotAddMore
                  ? p.quantityOnHand <= 0
                    ? "Out of stock"
                    : "All available stock is already in the cart"
                  : undefined
              }
            >
              {justAdded ? (
                <>
                  <i className="ti ti-check me-1" />
                  Added
                </>
              ) : inCart > 0 ? (
                "+1"
              ) : (
                "Add"
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
