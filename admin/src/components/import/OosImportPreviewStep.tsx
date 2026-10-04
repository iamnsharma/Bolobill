import type { OosImportPreviewItem } from "../../api/admin";
import ImportIconButton from "./ImportIconButton";
import { shareOutOfStockListOnWhatsApp } from "../../utils/shareOutOfStockListWhatsApp";

export type OosImportDraft = {
  items: OosImportPreviewItem[];
};

export function computeOosSummary(draft: OosImportDraft) {
  const found = draft.items.length;
  const existsCount = draft.items.filter(i => i.duplicateStatus === "exists").length;
  return { found, newCount: found - existsCount, existsCount };
}

export default function OosImportPreviewStep({
  draft,
  onDraftChange,
  onContinue,
  onBack,
  onShareWhatsApp,
}: {
  draft: OosImportDraft;
  onDraftChange: (d: OosImportDraft) => void;
  onContinue: () => void;
  onBack: () => void;
  onShareWhatsApp?: () => void;
}) {
  const { found, newCount, existsCount } = computeOosSummary(draft);
  const newItems = draft.items.filter(i => i.duplicateStatus === "new");
  const existsItems = draft.items.filter(i => i.duplicateStatus === "exists");

  const update = (tempId: string, patch: Partial<OosImportPreviewItem>) => {
    onDraftChange({
      items: draft.items.map(i => (i.tempId === tempId ? { ...i, ...patch } : i)),
    });
  };

  const shareItems = newItems.length ? newItems : draft.items;

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        <span className="badge text-bg-secondary">{found} found</span>
        <span className="badge text-bg-primary">{newCount} new</span>
        <span className="badge text-bg-light text-dark border">{existsCount} on list already</span>
        <ImportIconButton
          icon="ti-brand-whatsapp"
          label="Share list on WhatsApp"
          variant="success"
          className="ms-auto"
          onClick={() => {
            shareOutOfStockListOnWhatsApp(
              shareItems.map(i => ({ name: i.name, quantity: i.quantity, note: i.note })),
            );
            onShareWhatsApp?.();
          }}
        />
      </div>

      {newItems.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 mb-3">
          <div className="card-header bg-white fw-semibold">Ready to import</div>
          <div className="table-responsive">
            <table className="table table-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Note</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {newItems.map(item => (
                  <tr key={item.tempId}>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={item.name}
                        onChange={e => update(item.tempId, { name: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={item.quantity}
                        onChange={e => update(item.tempId, { quantity: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="form-control form-control-sm"
                        value={item.note}
                        onChange={e => update(item.tempId, { note: e.target.value })}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          onDraftChange({ items: draft.items.filter(i => i.tempId !== item.tempId) })
                        }
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {existsItems.length > 0 && (
        <div className="card border-0 shadow-sm rounded-3 mb-3">
          <div className="card-header bg-light small fw-semibold">Already on list — skipped</div>
          <ul className="list-group list-group-flush">
            {existsItems.map(item => (
              <li key={item.tempId} className="list-group-item text-muted small">
                {item.name}
                {item.matchedItemName && item.matchedItemName !== item.name && (
                  <span className="ms-1">(matches {item.matchedItemName})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="d-flex justify-content-between gap-2">
        <button type="button" className="btn btn-outline-secondary" onClick={onBack}>Back</button>
        <button type="button" className="btn btn-primary" onClick={onContinue} disabled={newCount === 0}>
          Continue
        </button>
      </div>
    </div>
  );
}
