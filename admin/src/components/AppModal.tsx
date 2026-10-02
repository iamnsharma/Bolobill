import type { ReactNode } from "react";

export default function AppModal({
  show,
  title,
  onClose,
  children,
  size = "lg",
  footer,
}: {
  show: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
  footer?: ReactNode;
}) {
  if (!show) return null;

  return (
    <div
      className="modal d-block bg-dark bg-opacity-50 app-modal-backdrop"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 1055 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content shadow border-0 rounded-3">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body pt-3">{children}</div>
          {footer ? <div className="modal-footer border-top bg-light">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
