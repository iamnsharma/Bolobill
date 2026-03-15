import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminUser, type UserLimits } from "../api/admin";
import ConfirmModal from "../components/ConfirmModal";
import { api } from "../api/client";

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="d-flex align-items-start gap-3 py-3 border-bottom border-light">
      <span
        className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 bg-light text-muted"
        style={{ width: 40, height: 40 }}>
        <i className={`ti ${icon}`} />
      </span>
      <div className="flex-grow-1 min-w-0">
        <p className="mb-0 small text-muted text-uppercase fw-semibold">
          {label}
        </p>
        <p className="mb-0 mt-1">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSuperAdmin } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showBlacklistConfirm, setShowBlacklistConfirm] = useState(false);
  
  // Plan assignment state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");

  const fetchUserData = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    adminApi
      .getUserById(id)
      .then((res) => {
        setUser(res.user);
        setLimits(res.limits);
      })
      .catch((e: unknown) => {
        setError(
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Failed to load user",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUserData();
    if (isSuperAdmin) {
      api.get('/plans/admin').then(res => setPlans(res.data.plans)).catch(console.error);
    }
  }, [id, isSuperAdmin]);

  const toggleBlacklist = async () => {
    if (!id || !user) return;
    const newValue = !user.isBlacklisted;
    setActionLoading(true);
    try {
      const result = await adminApi.setBlacklist(id, newValue);
      setUser(result);
      setShowBlacklistConfirm(false);
    } catch (e: unknown) {
      alert(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignPlan = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await adminApi.assignPlan(id, selectedPlanId || null, selectedExpiry || undefined);
      setShowPlanModal(false);
      fetchUserData(); // reload to get new limits
    } catch (e: unknown) {
      alert((e as any)?.response?.data?.message ?? "Failed to assign plan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mt-6 admin-page">
      <Link
        to="/dashboard/users"
        className="btn btn-link btn-sm text-muted text-decoration-none mb-3 d-inline-flex align-items-center">
        <i className="ti ti-arrow-left me-1" />
        Back to {isSuperAdmin ? "Manage users" : "Users"}
      </Link>
      <h1 className="fs-3 mb-1 fw-bold">User details</h1>
      <p className="text-muted mb-4">View and manage this user.</p>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert">
          <i className="ti ti-alert-circle me-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : user ? (
        <>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4 p-lg-5">
                  <InfoRow icon="ti-user" label="Name" value={user.name} />
                  <InfoRow icon="ti-phone" label="Phone" value={user.phone} />
                  <InfoRow
                    icon="ti-building-store"
                    label="Business"
                    value={user.businessName || "—"}
                  />
                  <InfoRow
                    icon="ti-badge"
                    label="Account type"
                    value={user.accountType ?? "—"}
                  />
                  <div className="d-flex align-items-start gap-3 py-3">
                    <span
                      className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 bg-light text-muted"
                      style={{ width: 40, height: 40 }}>
                      <i className="ti ti-receipt" />
                    </span>
                    <div className="flex-grow-1 min-w-0">
                      <p className="mb-0 small text-muted text-uppercase fw-semibold">
                        Bills created
                      </p>
                      <p className="mb-0 mt-1">
                        {user.usage?.invoiceRequestSuccessCount ?? 0}
                      </p>
                    </div>
                  </div>
                  {isSuperAdmin && user.usage?.voiceToTextSecondsUsed != null && (
                    <div className="d-flex align-items-start gap-3 py-3 border-bottom border-light">
                      <span
                        className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 bg-light text-muted"
                        style={{ width: 40, height: 40 }}>
                        <i className="ti ti-microphone" />
                      </span>
                      <div className="flex-grow-1 min-w-0">
                        <p className="mb-0 small text-muted text-uppercase fw-semibold">
                          Voice / Whisper usage
                        </p>
                        <p className="mb-0 mt-1">
                          {Math.round((user.usage.voiceToTextSecondsUsed ?? 0) / 60)} min
                        </p>
                      </div>
                    </div>
                  )}
                  <InfoRow
                    icon="ti-calendar"
                    label="Created"
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleString()
                        : "—"
                    }
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4">
                  <p className="small text-muted text-uppercase fw-semibold mb-2">
                    Status
                  </p>
                  {user.isBlacklisted ? (
                    <span className="badge bg-danger fs-6 px-3 py-2">
                      <i className="ti ti-user-off me-1" />
                      Blacklisted
                    </span>
                  ) : (
                    <span className="badge bg-success fs-6 px-3 py-2">
                      <i className="ti ti-circle-check me-1" />
                      Active
                    </span>
                  )}
                </div>
              </div>
              {isSuperAdmin && (
                <div className="card border-0 shadow-sm rounded-3 overflow-hidden mt-4">
                  <div className="card-body p-4">
                    <p className="small text-muted text-uppercase fw-semibold mb-2">
                      Subscription
                    </p>
                    <p className="small text-muted mb-3">
                      Plan: <span className={`badge ${limits?.isActive ? 'bg-primary' : 'bg-secondary'}`}>{limits?.isActive ? 'Active' : 'None/Expired'}</span>
                      <br/>
                      <br/>
                      Invoices used: <strong>{limits?.invoicesUsed ?? 0}</strong> / {(limits?.invoiceLimit ?? 0) || '∞'}
                      <br/>
                      Voice used: <strong>{Math.round(limits?.voiceMinutesUsed ?? 0)}</strong> / {(limits?.voiceMinutesLimit ?? 0) || '∞'} min
                      <br/>
                      Expiry: {limits?.expiresAt ? new Date(limits.expiresAt).toLocaleDateString() : '—'}
                    </p>
                    <div className="d-flex flex-column gap-2">
                      <button type="button" className="btn btn-outline-primary btn-sm w-100" onClick={() => setShowPlanModal(true)}>
                        <i className="ti ti-crown me-1" />
                        Manage subscription
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden mt-4">
                <div className="card-body p-4">
                  <p className="small text-muted text-uppercase fw-semibold mb-3">
                    Actions
                  </p>
                  <div className="d-flex flex-column gap-2">
                    <button
                      type="button"
                      className={`btn ${user.isBlacklisted ? "btn-success" : "btn-warning"} w-100 d-flex align-items-center justify-content-center gap-2`}
                      disabled={actionLoading}
                      onClick={() => setShowBlacklistConfirm(true)}>
                      {actionLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <i
                          className={`ti ${user.isBlacklisted ? "ti-user-check" : "ti-user-off"}`}
                        />
                      )}
                      {user.isBlacklisted
                        ? "Remove from blacklist"
                        : "Blacklist user"}
                    </button>
                    {!isSuperAdmin && (
                      <Link
                        to={`/dashboard/invoices?userId=${user.id}`}
                        className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2">
                        <i className="ti ti-receipt" />
                        View invoices
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <ConfirmModal
        show={showBlacklistConfirm}
        title={
          user?.isBlacklisted
            ? "Remove from blacklist?"
            : "Blacklist this user?"
        }
        message={
          user?.isBlacklisted
            ? "This user will be able to use the app again."
            : "This user will be blocked from using the app. You can remove them from the blacklist later."
        }
        variant={user?.isBlacklisted ? "primary" : "warning"}
        confirmLabel={user?.isBlacklisted ? "Remove" : "Blacklist"}
        cancelLabel="Cancel"
        onConfirm={toggleBlacklist}
        onCancel={() => setShowBlacklistConfirm(false)}
        loading={actionLoading}
      />

      {showPlanModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Manage subscription</h5>
                <button type="button" className="btn-close" onClick={() => setShowPlanModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-medium text-muted small text-uppercase">Select Plan</label>
                  <select 
                    className="form-select" 
                    value={selectedPlanId} 
                    onChange={e => setSelectedPlanId(e.target.value)}
                  >
                    <option value="">None (Remove subscription)</option>
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>
                    ))}
                  </select>
                </div>
                {selectedPlanId && (
                  <div className="mb-3">
                    <label className="form-label fw-medium text-muted small text-uppercase">Expiry Date</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={selectedExpiry}
                      onChange={e => setSelectedExpiry(e.target.value)}
                    />
                    <div className="form-text">If left blank, defaults to 30 days from now.</div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" onClick={() => setShowPlanModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleAssignPlan} disabled={actionLoading}>
                  {actionLoading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
