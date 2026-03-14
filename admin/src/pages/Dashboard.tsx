export default function Dashboard() {
  return (
    <div className="mb-6">
      <h1 className="fs-3 mb-1 fw-bold">Dashboard</h1>
      <p className="text-muted mb-4">Overview of BoloBill platform</p>

      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-primary bg-opacity-10 border-start border-4 border-primary">
            <div className="d-flex gap-3 align-items-center">
              <div className="icon-shape icon-md bg-primary text-white rounded-2">
                <i className="ti ti-receipt fs-4" />
              </div>
              <div>
                <h2 className="fs-6 text-muted mb-1">Total Invoices</h2>
                <h3 className="fw-bold mb-0">—</h3>
                <small className="text-primary">Need backend API</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-success bg-opacity-10 border-start border-4 border-success">
            <div className="d-flex gap-3 align-items-center">
              <div className="icon-shape icon-md bg-success text-white rounded-2">
                <i className="ti ti-users fs-4" />
              </div>
              <div>
                <h2 className="fs-6 text-muted mb-1">Total Users</h2>
                <h3 className="fw-bold mb-0">—</h3>
                <small className="text-success">Need backend API</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-info bg-opacity-10 border-start border-4 border-info">
            <div className="d-flex gap-3 align-items-center">
              <div className="icon-shape icon-md bg-info text-white rounded-2">
                <i className="ti ti-crown fs-4" />
              </div>
              <div>
                <h2 className="fs-6 text-muted mb-1">Active Memberships</h2>
                <h3 className="fw-bold mb-0">—</h3>
                <small className="text-info">Need backend API</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 h-100 p-4 bg-warning bg-opacity-10 border-start border-4 border-warning">
            <div className="d-flex gap-3 align-items-center">
              <div className="icon-shape icon-md bg-warning text-white rounded-2">
                <i className="ti ti-user-off fs-4" />
              </div>
              <div>
                <h2 className="fs-6 text-muted mb-1">Blacklisted Users</h2>
                <h3 className="fw-bold mb-0">—</h3>
                <small className="text-warning">Need backend API</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <h3 className="h5 mb-3">Quick actions</h3>
          <p className="text-muted small mb-0">
            Use the sidebar to open Invoices, Users, Memberships, and Manage features. Where backend
            APIs are not implemented yet, you will see an alert: &quot;Need to implement APIs in backend yet&quot;.
          </p>
        </div>
      </div>
    </div>
  );
}
