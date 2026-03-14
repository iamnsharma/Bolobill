import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminUser } from "../api/admin";

type GainedFilter = "all" | "1d" | "7d" | "30d" | "1y" | "custom";

function filterUsersByGained(users: AdminUser[], filter: GainedFilter, customFrom?: string, customTo?: string): AdminUser[] {
  if (filter === "all") return users;
  const now = new Date();
  let start = new Date(now);
  if (filter === "1d") start.setDate(start.getDate() - 1);
  else if (filter === "7d") start.setDate(start.getDate() - 7);
  else if (filter === "30d") start.setMonth(start.getMonth() - 1);
  else if (filter === "1y") start.setFullYear(start.getFullYear() - 1);
  else if (filter === "custom" && customFrom) start = new Date(customFrom);
  const end = filter === "custom" && customTo ? new Date(customTo) : now;
  return users.filter((u) => {
    const t = u.createdAt ? new Date(u.createdAt).getTime() : 0;
    return t >= start.getTime() && t <= end.getTime();
  });
}

export default function Users() {
  const { isSuperAdmin } = useAuth();
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
  const [search, setSearch] = useState("");
  const [gainedFilter, setGainedFilter] = useState<GainedFilter>("all");
  const [gainedFrom, setGainedFrom] = useState("");
  const [gainedTo, setGainedTo] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        page,
        limit: 20,
        search: search || undefined,
      });
      setData({
        users: res.users,
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      });
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load users",
      );
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

  const displayedUsers = useMemo(() => {
    if (!data?.users) return [];
    if (!isSuperAdmin) return data.users;
    return filterUsersByGained(data.users, gainedFilter, gainedFrom || undefined, gainedTo || undefined);
  }, [data?.users, isSuperAdmin, gainedFilter, gainedFrom, gainedTo]);

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">{isSuperAdmin ? "Manage users" : "Users"}</h1>
      <p className="text-muted mb-4">
        {isSuperAdmin
          ? "View all app users. Search, filter by signup date, open a user to add/remove subscription or blacklist."
          : "View all app users (shopkeepers and personal). Search by name, phone, or business. You can blacklist a user to revoke access; data is not deleted."}
      </p>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <form
            className="d-flex gap-2 flex-wrap align-items-center"
            onSubmit={onSearch}>
            <span className="d-flex align-items-center text-muted me-1">
              <i className="ti ti-search" />
            </span>
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 280 }}
              placeholder="Name, phone, or business"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center gap-1">
              <i className="ti ti-search" />
              Search
            </button>
            {isSuperAdmin && (
              <>
                <span className="text-muted ms-2 me-1">·</span>
                <span className="small text-muted me-1">Gained:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                  value={gainedFilter}
                  onChange={(e) => setGainedFilter(e.target.value as GainedFilter)}
                >
                  <option value="all">All</option>
                  <option value="1d">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="1y">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
                {gainedFilter === "custom" && (
                  <>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      style={{ width: 140 }}
                      value={gainedFrom}
                      onChange={(e) => setGainedFrom(e.target.value)}
                      placeholder="From"
                    />
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      style={{ width: 140 }}
                      value={gainedTo}
                      onChange={(e) => setGainedTo(e.target.value)}
                      placeholder="To"
                    />
                  </>
                )}
              </>
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
                      <th>
                        <i className="ti ti-user me-1" />
                        Name
                      </th>
                      <th>
                        <i className="ti ti-phone me-1" />
                        Phone
                      </th>
                      <th>
                        <i className="ti ti-building-store me-1" />
                        Business
                      </th>
                      <th>
                        <i className="ti ti-receipt me-1" />
                        Bills
                      </th>
                      <th>
                        <i className="ti ti-circle-check me-1" />
                        Status
                      </th>
                      <th>
                        <i className="ti ti-calendar me-1" />
                        Created
                      </th>
                      <th style={{ width: 100 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          {error
                            ? "API unavailable or error. Check backend."
                            : "No users found."}
                        </td>
                      </tr>
                    ) : displayedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted py-4">
                          No users in selected period. Try &quot;All&quot; or another range.
                        </td>
                      </tr>
                    ) : (
                      displayedUsers.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-medium">{u.name}</td>
                          <td>{u.phone}</td>
                          <td>{u.businessName || "—"}</td>
                          <td>{u.usage?.invoiceRequestSuccessCount ?? 0}</td>
                          <td>
                            {u.isBlacklisted ? (
                              <span className="badge bg-danger">
                                Blacklisted
                              </span>
                            ) : (
                              <span className="badge bg-success">Active</span>
                            )}
                          </td>
                          <td className="small text-muted">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            <Link
                              to={`/dashboard/users/${u.id}`}
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                              <i className="ti ti-eye" />
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {data && data.totalPages > 1 ? (
                <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                  <small className="text-muted">
                    {data?.total} total · page {data?.page} of{" "}
                    {data?.totalPages}
                  </small>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={(data?.page ?? 1) <= 1}
                      onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={(data?.page ?? 1) >= (data?.totalPages ?? 0)}
                      onClick={() => setPage((p) => p + 1)}>
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
