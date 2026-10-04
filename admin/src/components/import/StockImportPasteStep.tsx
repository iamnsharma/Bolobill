export default function StockImportPasteStep({
  value,
  onChange,
  loading,
  error,
  onSubmit,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  hint?: string;
}) {
  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4">
        <h2 className="h5 fw-bold mb-2">Paste list</h2>
        <p className="text-muted small mb-3">
          {hint ??
            "Paste from Excel or WhatsApp — one product per line. Example: Category, Name, Price, Unit, Stock"}
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <textarea
          className="form-control font-monospace small mb-3"
          rows={10}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="category,name,unit,unitPrice,quantity&#10;Snacks,Lays,pack,20,10"
        />
        <button type="button" className="btn btn-primary" disabled={loading || !value.trim()} onClick={onSubmit}>
          {loading ? "Reading…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
