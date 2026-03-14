import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminUser } from '../api/admin';

export default function Users() {
  const [data, setData] = useState<{
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({ page, limit: 20, search: search || undefined });
      setData({
        users: res.users,
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      });
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load users');
      setData({ users: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <div className="mb-6">
      <h1 className="fs-3 mb-1 fw-bold">Users</h1>
      <p className="text-muted mb-4">View users and blacklist (no delete).</p>

      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-body">
          <form className="d-flex gap-2 flex-wrap" onSubmit={onSearch}>
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 260 }}
              placeholder="Name, phone, or business"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Business</th>
                      <th>Bills count</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          {error ? 'API unavailable or error. Check backend.' : 'No users found.'}
                        </td>
                      </tr>
                    ) : (
                      data.users.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-medium">{u.name}</td>
                          <td>{u.phone}</td>
                          <td>{u.businessName || '—'}</td>
                          <td>{u.usage?.invoiceRequestSuccessCount ?? 0}</td>
                          <td>
                            {u.isBlacklisted ? (
                              <span className="badge bg-danger">Blacklisted</span>
                            ) : (
                              <span className="badge bg-success">Active</span>
                            )}
                          </td>
                          <td className="small text-muted">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td>
                            <Link to={`/users/${u.id}`} className="btn btn-sm btn-outline-primary">
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {data.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                  <small className="text-muted">
                    {data.total} total · page {data.page} of {data.totalPages}
                  </small>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={data.page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={data.page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
