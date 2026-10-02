import StockStatusBadge from "../stock/StockStatusBadge";

export type PosCartLine = {
  name: string;
  productId?: string;
  quantityNumeric?: number;
  unit?: string;
  totalPrice: string;
  quantityOnHand?: number;
};

export default function CartLineStepper({
  line,
  lineTotalFormatted,
  stockOnHand,
  oversell,
  onDecrement,
  onIncrement,
  onRemove,
  incrementDisabled,
  editableName,
  onNameChange,
  editableTotal,
  onTotalChange,
}: {
  line: PosCartLine;
  lineTotalFormatted: string;
  stockOnHand?: number;
  oversell: boolean;
  onDecrement: () => void;
  onIncrement: () => void;
  onRemove: () => void;
  incrementDisabled?: boolean;
  editableName?: boolean;
  onNameChange?: (name: string) => void;
  editableTotal?: boolean;
  onTotalChange?: (total: number) => void;
}) {
  const qty = line.quantityNumeric ?? 1;
  const unit = line.unit ?? "pcs";

  return (
    <div className="pos-cart-line-row">
      <div className="pos-cart-line__body">
        <div className="pos-cart-line__name-row">
          {editableName && onNameChange ? (
            <input
              type="text"
              className="form-control form-control-sm"
              value={line.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Item name"
              aria-label="Item name"
            />
          ) : (
            <span className="fw-semibold small text-truncate">{line.name}</span>
          )}
          {oversell && <StockStatusBadge kind="out" />}
        </div>
        <div className="pos-cart-line__controls-row">
          <div className="btn-group btn-group-sm pos-cart-qty-stepper" role="group" aria-label={`Quantity for ${line.name}`}>
            <button type="button" className="btn btn-outline-secondary px-2" onClick={onDecrement}>
              −
            </button>
            <span className="btn btn-light disabled px-2 border pos-cart-qty-label">
              <span className="fw-semibold">{qty}</span>
              {stockOnHand != null ? (
                <span className={`font-monospace ms-1${oversell ? " text-danger" : " text-muted"}`}>
                  /{stockOnHand}
                </span>
              ) : null}
              <span className="text-muted ms-1">{unit}</span>
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary px-2"
              onClick={onIncrement}
              disabled={incrementDisabled}
              aria-label={`Increase quantity for ${line.name}`}
            >
              +
            </button>
          </div>
          <div className="fw-semibold small text-end">
            {editableTotal && onTotalChange ? (
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control form-control-sm text-end"
                style={{ width: "5.5rem" }}
                value={line.totalPrice || ""}
                onChange={(e) =>
                  onTotalChange(e.target.value ? parseFloat(e.target.value) : 0)
                }
                aria-label="Line total"
              />
            ) : (
              lineTotalFormatted
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="pos-cart-line__delete"
        onClick={onRemove}
        aria-label={`Delete ${line.name} from cart`}
      >
        <i className="ti ti-trash" aria-hidden />
      </button>
    </div>
  );
}
