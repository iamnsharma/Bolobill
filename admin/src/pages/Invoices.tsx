import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminApi, type AdminInvoice } from '../api/admin';
import InvoiceViewModal from '../components/InvoiceViewModal';

export default function Invoices() {
  const { isSuperAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const userIdFromQuery = searchParams.get('userId') ?? '';
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [data, setData] = useState<{
    invoices: AdminInvoice[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getInvoices({
        page,
        limit: 20,
        search: search || undefined,
        userId: isSuperAdmin ? (userIdFromQuery || undefined) : undefined,
        from: dateFrom || undefined,
        to: dateTo || undefined,
      });
      setData({
        invoices: res.invoices,
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      });
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load invoices');
      setData({ invoices: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, isSuperAdmin, userIdFromQuery]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  return (
    <div className="mb-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">{isSuperAdmin ? 'Invoices' : 'Bills & Invoices'}</h1>
      <p className="text-muted mb-4">
        {isSuperAdmin
          ? (userIdFromQuery ? 'Invoices for this user.' : 'All app invoices across users.')
          : 'View and search your bills by customer name or date. Bills cannot be edited once created.'}
      </p>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <form className="d-flex flex-wrap gap-3 align-items-end" onSubmit={onSearch}>
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-search text-muted" />
              <input
                type="search"
                className="form-control"
                style={{ maxWidth: 260 }}
                placeholder="Customer name or invoice ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted mb-0">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 140 }}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted mb-0">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 140 }}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary d-flex align-items-center gap-1">
              <i className="ti ti-search" />
              Search
            </button>
            {!isSuperAdmin && (
              <Link to="/invoices/new" className="btn btn-success d-flex align-items-center gap-1">
                <i className="ti ti-plus" />
                Create Bill
              </Link>
            )}
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
                      <th><i className="ti ti-receipt me-1" />Invoice ID</th>
                      <th><i className="ti ti-user me-1" />Customer</th>
                      <th><i className="ti ti-cash me-1" />Total</th>
                      <th><i className="ti ti-tag me-1" />Source</th>
                      {isSuperAdmin && <th><i className="ti ti-users me-1" />User</th>}
                      <th><i className="ti ti-calendar me-1" />Created</th>
                      <th style={{ width: 90 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.invoices.length === 0 ? (
                      <tr>
                        <td colSpan={isSuperAdmin ? 7 : 6} className="text-center text-muted py-4">
                          {error ? 'API unavailable or error. Check backend.' : 'No invoices found.'}
                        </td>
                      </tr>
                    ) : (
                      data.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="fw-medium">{inv.invoiceId}</td>
                          <td>{inv.customerName}</td>
                          <td>₹{inv.total}</td>
                          <td>
                            <span className={`badge ${inv.source === 'voice' ? 'bg-primary' : 'bg-secondary'}`}>
                              {inv.source}
                            </span>
                          </td>
                          {isSuperAdmin && (
                            <td>
                              {inv.user ? (
                                <Link to={`/users/${inv.user.id}`} className="text-decoration-none">
                                  {inv.user.name ?? inv.user.phone}
                                </Link>
                              ) : (
                                '—'
                              )}
                            </td>
                          )}
                          <td className="small text-muted">
                            {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => setViewInvoiceId(inv.id)}
                            >
                              <i className="ti ti-eye" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {data && data.totalPages > 1 && (
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

      <InvoiceViewModal
        invoiceId={viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
      />
    </div>
  );
}
