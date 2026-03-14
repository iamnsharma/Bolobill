import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminApi, type AdminUser } from '../api/admin';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    adminApi
      .getUserById(id)
      .then(setUser)
      .catch((e: unknown) => {
        setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load user');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleBlacklist = async () => {
    if (!id || !user) return;
    const newValue = !user.isBlacklisted;
    setActionLoading(true);
    try {
      const updated = await adminApi.setBlacklist(id, newValue);
      setUser(updated);
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <Link to="/users" className="btn btn-link btn-sm text-muted text-decoration-none mb-2">
        <i className="ti ti-arrow-left me-1" />
        Back to Users
      </Link>
      <h1 className="fs-3 mb-1 fw-bold">User detail</h1>
      <p className="text-muted mb-4">{id}</p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : user ? (
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4">
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2"><strong>Name</strong> {user.name}</p>
                <p className="mb-2"><strong>Phone</strong> {user.phone}</p>
                <p className="mb-2"><strong>Business</strong> {user.businessName || '—'}</p>
                <p className="mb-2"><strong>Account type</strong> {user.accountType ?? '—'}</p>
                <p className="mb-2">
                  <strong>Status</strong>{' '}
                  {user.isBlacklisted ? (
                    <span className="badge bg-danger">Blacklisted</span>
                  ) : (
                    <span className="badge bg-success">Active</span>
                  )}
                </p>
                <p className="mb-2">
                  <strong>Bills created</strong> {user.usage?.invoiceRequestSuccessCount ?? 0}
                </p>
                <p className="mb-0 small text-muted">
                  Created {user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
            <hr />
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn ${user.isBlacklisted ? 'btn-success' : 'btn-warning'}`}
                disabled={actionLoading}
                onClick={toggleBlacklist}
              >
                {actionLoading ? (
                  <span className="spinner-border spinner-border-sm me-1" />
                ) : null}
                {user.isBlacklisted ? 'Remove from blacklist' : 'Blacklist user'}
              </button>
              <Link to={`/invoices?userId=${user.id}`} className="btn btn-outline-primary">
                View invoices
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
