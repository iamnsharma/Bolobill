import { useRef } from "react";
const CSV_ACCEPT = ".csv,text/csv";
const EXCEL_ACCEPT = ".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export default function StockImportFileStep({
  source,
  loading,
  error,
  onFile,
}: {
  source: "csv" | "excel";
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const accept = source === "csv" ? CSV_ACCEPT : EXCEL_ACCEPT;
  const label = source === "csv" ? "Choose CSV file" : "Choose Excel file";

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4 p-md-5 text-center">
        <i className={`ti ${source === "csv" ? "ti-file-type-csv" : "ti-file-spreadsheet"} fs-1 text-primary mb-3 d-block`} />
        <h2 className="h5 fw-bold mb-2">{source === "csv" ? "Upload CSV" : "Upload Excel"}</h2>
        <p className="text-muted small mb-4">
          Use columns: category, name, unit, unitPrice, quantityOnHand. Stock can be filled in review.
        </p>
        {error && <div className="alert alert-danger text-start">{error}</div>}
        {loading ? (
          <div className="py-4">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-muted mt-2 mb-0">Reading file…</p>
          </div>
        ) : (
          <>
            <input
              ref={ref}
              type="file"
              accept={accept}
              className="d-none"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
            <button type="button" className="btn btn-primary" onClick={() => ref.current?.click()}>
              <i className="ti ti-upload me-1" />
              {label}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function OosImportFileStep({
  source,
  loading,
  error,
  onFile,
}: {
  source: "csv" | "excel";
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const accept = source === "csv" ? CSV_ACCEPT : EXCEL_ACCEPT;
  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4 text-center">
        {error && <div className="alert alert-danger">{error}</div>}
        {loading ? (
          <div className="spinner-border text-primary" role="status" />
        ) : (
          <>
            <input
              ref={ref}
              type="file"
              accept={accept}
              className="d-none"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
            <button type="button" className="btn btn-primary" onClick={() => ref.current?.click()}>
              <i className="ti ti-upload me-1" />
              Choose file
            </button>
          </>
        )}
      </div>
    </div>
  );
}
