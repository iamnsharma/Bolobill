const NEED_BACKEND_ALERT = 'Need to implement APIs in backend yet';

export default function Memberships() {
  const showAlert = () => alert(NEED_BACKEND_ALERT);

  return (
    <div className="mb-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Memberships</h1>
      <p className="text-muted mb-4">
        Manage subscription or membership plans for the app. When implemented, you will see active plans and can update offerings here.
      </p>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-5 text-center">
          <div className="icon-shape icon-xxl bg-info bg-opacity-10 text-info rounded-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center">
            <i className="ti ti-crown fs-1" />
          </div>
          <h3 className="h5 mb-2">Membership details &amp; manage plans</h3>
          <p className="text-muted small mb-4">
            Backend needs admin endpoints for membership overview and plan management (e.g.{' '}
            <code>GET /api/admin/memberships</code>, update plans).
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
