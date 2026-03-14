import React from 'react';

type Variant = 'danger' | 'warning' | 'primary';

const ICONS: Record<Variant, string> = {
  danger: 'ti ti-alert-triangle',
  warning: 'ti ti-alert-circle',
  primary: 'ti ti-info-circle',
};

const BTN_CLASS: Record<Variant, string> = {
  danger: 'btn-danger',
  warning: 'btn-warning',
  primary: 'btn-primary',
};

export default function ConfirmModal({
  show,
  title,
  message,
  icon,
  variant = 'warning',
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: {
  show: boolean;
  title: string;
  message: string;
  icon?: string;
  variant?: Variant;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!show) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const iconClass = icon ?? ICONS[variant];

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1060 }}
      onClick={handleBackdrop}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow border-0">
          <div className="modal-body text-center py-4 px-4">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 bg-${variant} bg-opacity-10`}
              style={{ width: 48, height: 48 }}
            >
              <i className={`ti ${iconClass} fs-3 text-${variant}`} />
            </div>
            <h5 className="modal-title fw-bold mb-2">{title}</h5>
            <p className="text-muted small mb-0">{message}</p>
          </div>
          <div className="modal-footer border-0 justify-content-center gap-2 pb-4 pt-0">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn ${BTN_CLASS[variant]}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : null}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
