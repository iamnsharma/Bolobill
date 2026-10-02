import { useMemo, useState } from "react";
import {
  filterStockUnits,
  POPULAR_UNITS,
  STOCK_UNIT_OPTIONS,
} from "../../constants/stockUnits";

export default function UnitPicker({
  value,
  onChange,
  id = "stock-unit",
}: {
  value: string;
  onChange: (unit: string) => void;
  id?: string;
}) {
  const [focused, setFocused] = useState(false);
  const listId = `${id}-list`;

  const suggestions = useMemo(() => filterStockUnits(value), [value]);

  return (
    <div className="unit-picker position-relative">
      <label className="form-label small fw-semibold mb-1" htmlFor={id}>
        Unit
      </label>
      <div className="input-group">
        <span className="input-group-text bg-light">
          <i className="ti ti-scale" aria-hidden />
        </span>
        <input
          id={id}
          type="search"
          className="form-control"
          placeholder="Search kg, pcs, ltr…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          list={listId}
          autoComplete="off"
        />
      </div>
      <datalist id={listId}>
        {STOCK_UNIT_OPTIONS.map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
      {focused && value.trim() && suggestions.length > 0 && (
        <div className="unit-picker-suggestions border rounded-2 bg-white shadow-sm mt-1 py-1 position-absolute start-0 end-0 z-1">
          {suggestions.slice(0, 10).map((u) => (
            <button
              key={u}
              type="button"
              className="dropdown-item btn btn-link btn-sm text-start text-dark text-decoration-none py-1 w-100"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(u)}
            >
              {u}
            </button>
          ))}
        </div>
      )}
      <div className="d-flex flex-wrap gap-1 mt-2">
        {POPULAR_UNITS.map((u) => (
          <button
            key={u}
            type="button"
            className={`btn btn-sm rounded-pill ${
              value === u ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => onChange(u)}
          >
            {u}
          </button>
        ))}
      </div>
    </div>
  );
}
