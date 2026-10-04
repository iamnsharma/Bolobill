import { useMemo } from "react";
import type { MenuImportDraft, EditableMenuImportItem } from "./menuImportTypes";
import { computeDraftSummary, getCategoryName, newItemsReadyCount } from "./menuImportTypes";

function SummaryChips({ draft }: { draft: MenuImportDraft }) {
  const { found, newCount, existsCount } = computeDraftSummary(draft);
  const ready = newItemsReadyCount(draft);
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <span className="badge rounded-pill text-bg-secondary">{found} found</span>
      <span className="badge rounded-pill text-bg-primary">{newCount} new</span>
      <span className="badge rounded-pill text-bg-light text-dark border">{existsCount} already exist</span>
      {newCount > 0 && (
        <span className="badge rounded-pill text-bg-success">{ready} ready to import</span>
      )}
    </div>
  );
}

export default function MenuImportPreviewStep({
  draft,
  showStockErrors,
  onDraftChange,
  onAddCategory,
  onRemoveCategory,
  onAddItem,
  onRemoveItem,
  onItemNameBlur,
  onContinue,
  onReupload,
  onBack,
}: {
  draft: MenuImportDraft;
  showStockErrors: boolean;
  onDraftChange: (next: MenuImportDraft) => void;
  onAddCategory: () => void;
  onRemoveCategory: (tempId: string) => void;
  onAddItem: (categoryTempId: string) => void;
  onRemoveItem: (tempId: string) => void;
  onItemNameBlur: (tempId: string) => void;
  onContinue: () => void;
  onReupload: () => void;
  onBack: () => void;
}) {
  const sortedCategories = useMemo(
    () => [...draft.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [draft.categories],
  );

  const existsItems = draft.items.filter(i => i.duplicateStatus === "exists");
  const newItems = draft.items.filter(i => i.duplicateStatus === "new");

  const updateItem = (tempId: string, patch: Partial<EditableMenuImportItem>) => {
    onDraftChange({
      ...draft,
      items: draft.items.map(i => (i.tempId === tempId ? { ...i, ...patch } : i)),
    });
  };

  const updateCategoryName = (tempId: string, name: string) => {
    onDraftChange({
      ...draft,
      categories: draft.categories.map(c => (c.tempId === tempId ? { ...c, name } : c)),
    });
  };

  const renderItemRow = (
    item: EditableMenuImportItem,
    readOnly: boolean,
    showCategoryColumn: boolean,
  ) => {
    const stockMissing =
      showStockErrors && !readOnly && item.duplicateStatus === "new" && item.stockQty.trim() === "";
    const priceMissing =
      showStockErrors && !readOnly && item.duplicateStatus === "new" && (item.unitPrice == null || item.unitPrice < 0);

    return (
      <tr key={item.tempId} className={readOnly ? "table-light text-muted" : undefined}>
        <td>
          {readOnly ? (
            <span>{item.name}</span>
          ) : (
            <input
              type="text"
              className="form-control form-control-sm"
              value={item.name}
              onChange={e => updateItem(item.tempId, { name: e.target.value })}
              onBlur={() => onItemNameBlur(item.tempId)}
            />
          )}
          {readOnly && item.matchedProductName && (
            <div className="small">Matches: {item.matchedProductName}</div>
          )}
        </td>
        {showCategoryColumn && (
          <td>
            {readOnly ? (
              getCategoryName(draft, item.categoryTempId)
            ) : (
              <select
                className="form-select form-select-sm"
                value={item.categoryTempId}
                onChange={e => updateItem(item.tempId, { categoryTempId: e.target.value })}
                aria-label="Move to category"
              >
                {sortedCategories.map(c => (
                  <option key={c.tempId} value={c.tempId}>
                    {c.name || "Unnamed category"}
                  </option>
                ))}
              </select>
            )}
          </td>
        )}
        <td style={{ width: 72 }}>
          {readOnly ? (
            item.unit
          ) : (
            <input
              type="text"
              className="form-control form-control-sm"
              value={item.unit}
              onChange={e => updateItem(item.tempId, { unit: e.target.value })}
              list="menu-import-units"
            />
          )}
        </td>
        <td style={{ width: 96 }}>
          {readOnly ? (
            item.unitPrice != null ? `₹${item.unitPrice}` : "—"
          ) : (
            <input
              type="number"
              min={0}
              step="0.01"
              className={`form-control form-control-sm ${priceMissing ? "is-invalid" : ""}`}
              value={item.unitPrice ?? ""}
              onChange={e => {
                const v = e.target.value;
                updateItem(item.tempId, {
                  unitPrice: v === "" ? null : Number(v),
                });
              }}
            />
          )}
        </td>
        <td style={{ width: 96 }}>
          {readOnly ? (
            "—"
          ) : (
            <input
              type="number"
              min={0}
              step="1"
              className={`form-control form-control-sm ${stockMissing ? "is-invalid" : ""}`}
              placeholder="Qty"
              value={item.stockQty}
              onChange={e => updateItem(item.tempId, { stockQty: e.target.value })}
              aria-invalid={stockMissing}
            />
          )}
        </td>
        <td style={{ width: 120 }}>
          {readOnly ? (
            <span className="badge text-bg-secondary">Already exists — skipped</span>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onRemoveItem(item.tempId)}
              aria-label="Remove item"
            >
              <i className="ti ti-trash" />
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div>
      <datalist id="menu-import-units">
        {["pcs", "pack", "bottle", "kg", "g", "l", "ml", "box", "dozen", "strip"].map(u => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <SummaryChips draft={draft} />

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onReupload}>
          <i className="ti ti-photo me-1" />
          Upload different photo
        </button>
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={onAddCategory}>
          <i className="ti ti-plus me-1" />
          Add category
        </button>
      </div>

      {sortedCategories.map(cat => (
        <div key={cat.tempId} className="card border-0 shadow-sm rounded-3 mb-3">
          <div className="card-header bg-white border-bottom d-flex flex-wrap align-items-center gap-2 py-3">
            <input
              type="text"
              className="form-control form-control-sm fw-semibold"
              style={{ maxWidth: 280 }}
              value={cat.name}
              onChange={e => updateCategoryName(cat.tempId, e.target.value)}
              placeholder="Category name"
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-primary ms-auto"
              onClick={() => onAddItem(cat.tempId)}
            >
              Add item
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onRemoveCategory(cat.tempId)}
              title="Remove category and its items"
            >
              Remove
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {newItems
                  .filter(i => i.categoryTempId === cat.tempId)
                  .map(item => renderItemRow(item, false, false))}
                {newItems.filter(i => i.categoryTempId === cat.tempId).length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-muted small text-center py-3">
                      No new items in this category
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {existsItems.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 mb-3">
          <div className="card-header bg-light border-bottom py-3">
            <h3 className="h6 fw-bold mb-0">Already in your stock — won&apos;t be added</h3>
          </div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>{existsItems.map(item => renderItemRow(item, true, true))}</tbody>
            </table>
          </div>
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 justify-content-between mt-4">
        <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn btn-primary" onClick={onContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}
