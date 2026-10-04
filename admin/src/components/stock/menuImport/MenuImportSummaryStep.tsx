import type { MenuImportDraft } from "./menuImportTypes";
import { computeDraftSummary, newItemsReadyCount } from "./menuImportTypes";

export default function MenuImportSummaryStep({
  draft,
  importing,
  error,
  onImport,
  onBack,
}: {
  draft: MenuImportDraft;
  importing: boolean;
  error: string | null;
  onImport: () => void;
  onBack: () => void;
}) {
  const { found, newCount, existsCount } = computeDraftSummary(draft);
  const ready = newItemsReadyCount(draft);
  const canImport = newCount > 0 && ready === newCount && !importing;

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4 p-md-5">
        <h2 className="h5 fw-bold mb-3">Import summary</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <ul className="list-unstyled mb-4">
          <li className="mb-2">
            <span className="text-muted">Items found:</span>{" "}
            <strong>{found}</strong>
          </li>
          <li className="mb-2">
            <span className="text-muted">Already exist:</span>{" "}
            <strong>{existsCount}</strong>
          </li>
          <li className="mb-2">
            <span className="text-muted">New items:</span>{" "}
            <strong>{newCount}</strong>
          </li>
          <li>
            <span className="text-muted">Ready to import:</span>{" "}
            <strong className="text-success">{ready}</strong>
          </li>
        </ul>

        {newCount === 0 ? (
          <div className="alert alert-info" role="status">
            All items already exist. Nothing new to import.
          </div>
        ) : ready < newCount ? (
          <div className="alert alert-warning" role="alert">
            Some new items still need a price or stock quantity. Go back to review.
          </div>
        ) : (
          <p className="text-muted">
            Only <strong>{ready}</strong> new item{ready === 1 ? "" : "s"} will be added. Existing
            items are not duplicated.
          </p>
        )}

        <div className="d-flex flex-wrap gap-2 justify-content-between mt-4">
          <button type="button" className="btn btn-outline-secondary" onClick={onBack} disabled={importing}>
            Back to review
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onImport}
            disabled={!canImport}
          >
            {importing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Importing…
              </>
            ) : (
              <>
                <i className="ti ti-check me-1" />
                Import items
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
