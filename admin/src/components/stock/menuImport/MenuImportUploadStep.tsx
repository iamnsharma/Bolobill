import { useRef } from "react";

export const MENU_IMPORT_VALID_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
export const MENU_IMPORT_MAX_BYTES = 10 * 1024 * 1024;

export function validateMenuImportFile(file: File): string | null {
  if (!MENU_IMPORT_VALID_TYPES.includes(file.type)) {
    return "Please choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > MENU_IMPORT_MAX_BYTES) {
    return "Image must be under 10MB.";
  }
  return null;
}

export default function MenuImportUploadStep({
  analyzing,
  error,
  onFileSelected,
  onCancel,
}: {
  analyzing: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="card border-0 shadow-sm rounded-3">
      <div className="card-body p-4 p-md-5 text-center">
        <div className="mb-3">
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary"
            style={{ width: 64, height: 64 }}
          >
            <i className="ti ti-photo fs-2" aria-hidden />
          </span>
        </div>
        <h2 className="h5 fw-bold mb-2">Upload menu</h2>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 420 }}>
          Photo of your menu, price list, or product list. We&apos;ll read item names and prices — you
          add stock before importing.
        </p>

        {error && (
          <div className="alert alert-danger text-start" role="alert">
            {error}
          </div>
        )}

        {analyzing ? (
          <div className="py-4">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-muted mb-0">Reading your menu…</p>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="d-none"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onFileSelected(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn btn-lg px-4 import-ai-cta"
              onClick={() => inputRef.current?.click()}
            >
              <i className="ti ti-upload me-2" />
              Choose photo
            </button>
            <p className="small text-muted mt-3 mb-0">JPEG, PNG, or WebP · up to 10MB</p>
          </>
        )}

        <div className="mt-4">
          <button type="button" className="btn btn-link text-muted" onClick={onCancel} disabled={analyzing}>
            Back to stock
          </button>
        </div>
      </div>
    </div>
  );
}
