import CartLineStepper, { type PosCartLine } from "./CartLineStepper";

export default function BillCartPanel({
  lines,
  formatMoney,
  getStockOnHand,
  onDecrement,
  onIncrement,
  onRemove,
  total,
  onCancel,
  onReview,
  reviewDisabled,
  reviewDisabledReason,
  compact = false,
  showActions = true,
  editableName,
  onNameChange,
  editableLineTotal,
  onLineTotalChange,
}: {
  lines: PosCartLine[];
  formatMoney: (amount: number) => string;
  getStockOnHand: (line: PosCartLine, index: number) => number | undefined;
  onDecrement: (index: number) => void;
  onIncrement: (index: number) => void;
  onRemove: (index: number) => void;
  total: number;
  onCancel?: () => void;
  onReview: () => void;
  reviewDisabled?: boolean;
  /** Shown when the review button is disabled but the cart has items */
  reviewDisabledReason?: string;
  compact?: boolean;
  showActions?: boolean;
  editableName?: boolean;
  onNameChange?: (index: number, name: string) => void;
  editableLineTotal?: boolean;
  onLineTotalChange?: (index: number, total: number) => void;
}) {
  return (
    <div className={`pos-cart-panel d-flex flex-column h-100 ${compact ? "" : "pos-cart-sticky"}`}>
      <h2 className="h6 fw-bold mb-3">Cart</h2>

      <div className="pos-cart-lines flex-grow-1 overflow-auto mb-3">
        {lines.length === 0 ? (
          <p className="text-muted small mb-0 py-3 text-center">
            Add products from the list
          </p>
        ) : (
          lines.map((line, i) => {
            const qty = line.quantityNumeric ?? 1;
            const onHand = getStockOnHand(line, i);
            const oversell = onHand != null && qty > onHand;
            const incrementDisabled = onHand != null && qty >= onHand;
            return (
              <CartLineStepper
                key={line.productId ?? i}
                line={line}
                lineTotalFormatted={formatMoney(parseFloat(line.totalPrice) || 0)}
                stockOnHand={onHand}
                oversell={oversell}
                onDecrement={() => onDecrement(i)}
                onIncrement={() => onIncrement(i)}
                onRemove={() => onRemove(i)}
                incrementDisabled={incrementDisabled}
                editableName={editableName}
                onNameChange={onNameChange ? (name) => onNameChange(i, name) : undefined}
                editableTotal={editableLineTotal}
                onTotalChange={
                  onLineTotalChange ? (total) => onLineTotalChange(i, total) : undefined
                }
              />
            );
          })
        )}
      </div>

      <div className="border-top pt-3 mt-auto">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-semibold">Total</span>
          <span className="fs-5 fw-bold">{formatMoney(total)}</span>
        </div>
        {showActions && (
          <div className="d-flex flex-wrap gap-2">
            {onCancel && (
              <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary flex-grow-1"
              onClick={onReview}
              disabled={reviewDisabled || lines.length === 0}
              title={
                reviewDisabled && lines.length > 0
                  ? reviewDisabledReason ?? "Complete required fields to continue"
                  : lines.length === 0
                    ? "Add at least one item"
                    : undefined
              }
            >
              <i className="ti ti-clipboard-check me-1" />
              Review &amp; create bill
            </button>
          </div>
        )}
        {showActions && lines.length > 0 && reviewDisabled && reviewDisabledReason ? (
          <p className="small text-muted mb-0 mt-2">{reviewDisabledReason}</p>
        ) : null}
      </div>
    </div>
  );
}
