import { useId } from "react";
import BillCartPanel from "./BillCartPanel";
import type { PosCartLine } from "./CartLineStepper";

export default function MobileCartBar({
  lines,
  total,
  formatMoney,
  getStockOnHand,
  onDecrement,
  onIncrement,
  onRemove,
  onReview,
  onCancel,
  reviewDisabled,
  reviewDisabledReason,
}: {
  lines: PosCartLine[];
  total: number;
  formatMoney: (amount: number) => string;
  getStockOnHand: (line: PosCartLine, index: number) => number | undefined;
  onDecrement: (index: number) => void;
  onIncrement: (index: number) => void;
  onRemove: (index: number) => void;
  onReview: () => void;
  onCancel: () => void;
  reviewDisabled?: boolean;
  reviewDisabledReason?: string;
}) {
  const offcanvasId = useId().replace(/:/g, "");
  const itemCount = lines.reduce((s, l) => s + (l.quantityNumeric ?? 1), 0);

  if (lines.length === 0) {
    return null;
  }

  return (
    <>
      <div className="pos-mobile-cart-bar d-lg-none">
        <button
          type="button"
          className="btn btn-link text-dark text-decoration-none flex-grow-1 text-start p-0"
          data-bs-toggle="offcanvas"
          data-bs-target={`#${offcanvasId}`}
          aria-controls={offcanvasId}
        >
          <span className="fw-semibold">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className="text-muted small ms-2">View cart</span>
        </button>
        <span className="fw-bold me-2">{formatMoney(total)}</span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onReview}
          disabled={reviewDisabled}
        >
          Review
        </button>
      </div>

      <div
        className="offcanvas offcanvas-bottom d-lg-none pos-cart-offcanvas"
        tabIndex={-1}
        id={offcanvasId}
        aria-labelledby={`${offcanvasId}-label`}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-bold" id={`${offcanvasId}-label`}>
            Your cart
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body d-flex flex-column">
          <BillCartPanel
            lines={lines}
            formatMoney={formatMoney}
            getStockOnHand={getStockOnHand}
            onDecrement={onDecrement}
            onIncrement={onIncrement}
            onRemove={onRemove}
            total={total}
            onCancel={onCancel}
            onReview={onReview}
            reviewDisabled={reviewDisabled}
            reviewDisabledReason={reviewDisabledReason}
            compact
            showActions
          />
        </div>
      </div>
    </>
  );
}
