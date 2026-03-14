const NEED_BACKEND_ALERT = "Need to implement APIs in backend yet";

export default function ManageFeatures() {
  const showAlert = () => alert(NEED_BACKEND_ALERT);

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Manage features</h1>
      <p className="text-muted mb-4">
        Enable or disable app features (e.g. voice billing, manual billing) and
        control visibility by version or plan. Backend integration pending.
      </p>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-5 text-center">
          <div className="icon-shape icon-xxl bg-secondary bg-opacity-10 text-secondary rounded-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center">
            <i className="ti ti-settings fs-1" />
          </div>
          <h3 className="h5 mb-2">Feature flags &amp; toggles</h3>
          <p className="text-muted small mb-4">
            Backend needs admin endpoints to manage feature flags (e.g.
            enable/disable voice billing, manual billing, membership plans per
            app version).
          </p>
          <button type="button" className="btn btn-primary" onClick={showAlert}>
            <i className="ti ti-alert-circle me-1" />
            {NEED_BACKEND_ALERT}
          </button>
        </div>
      </div>
    </div>
  );
}
