import { IMPORT_SOURCES, type ImportSourceId } from "./importTypes";

export default function ImportSourcePicker({
  value,
  onChange,
}: {
  value: ImportSourceId;
  onChange: (id: ImportSourceId) => void;
}) {
  return (
    <div className="import-source-grid" role="radiogroup" aria-label="Import source">
      {IMPORT_SOURCES.map(src => {
        const selected = value === src.id;
        return (
          <button
            key={src.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`import-source-card ${selected ? "import-source-card--selected" : ""} ${
              src.ai ? "import-source-card--ai" : ""
            }`}
            onClick={() => onChange(src.id)}
          >
            {src.ai ? (
              <div className="import-source-card__inner">
                <i className={`ti ${src.icon} fs-3 d-block mb-2 text-primary`} aria-hidden />
                <span className="small fw-semibold">{src.label}</span>
              </div>
            ) : (
              <>
                <i className={`ti ${src.icon} fs-3 d-block mb-2`} aria-hidden />
                <span className="small fw-semibold">{src.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
