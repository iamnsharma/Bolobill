import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminUser } from "../api/admin";
import AppModal from "../components/AppModal";
import FilterApplyButton from "../components/merchant/FilterApplyButton";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import { canApplyDateRangeFilter } from "../utils/dateRangeFilters";
import {
  gainedFilterToCreatedRange,
  type GainedFilter,
} from "../utils/gainedUserFilter";

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
  const [draftSearch, setDraftSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [draftGainedFilter, setDraftGainedFilter] = useState<GainedFilter>("all");
  const [draftGainedFrom, setDraftGainedFrom] = useState("");
  const [draftGainedTo, setDraftGainedTo] = useState("");
  const [appliedGainedFilter, setAppliedGainedFilter] = useState<GainedFilter>("all");
  const [appliedGainedFrom, setAppliedGainedFrom] = useState("");
  const [appliedGainedTo, setAppliedGainedTo] = useState("");

  const [showCreateMerchant, setShowCreateMerchant] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createBusiness, setCreateBusiness] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPin, setCreatePin] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createdMerchant, setCreatedMerchant] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const gainedRange = isSuperAdmin
      ? gainedFilterToCreatedRange(
          appliedGainedFilter,
          appliedGainedFrom || undefined,
          appliedGainedTo || undefined,
        )
      : {};
    try {
      const res = await adminApi.getUsers({
        page,
        limit: 20,
        search: appliedSearch || undefined,
        ...gainedRange,
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
  }, [page, appliedSearch, appliedGainedFilter, appliedGainedFrom, appliedGainedTo, isSuperAdmin]);

  const hasFilterChanges =
    draftSearch.trim() !== appliedSearch.trim() ||
    draftGainedFilter !== appliedGainedFilter ||
    draftGainedFrom !== appliedGainedFrom ||
    draftGainedTo !== appliedGainedTo;

  const gainedDatesOk =
    draftGainedFilter !== "custom" ||
    canApplyDateRangeFilter(
      draftGainedFrom,
      draftGainedTo,
      appliedGainedFrom,
      appliedGainedTo,
    );

  const filtersApplyReady = hasFilterChanges && gainedDatesOk;

  const onApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtersApplyReady) return;
    setPage(1);
    setAppliedSearch(draftSearch);
    setAppliedGainedFilter(draftGainedFilter);
    setAppliedGainedFrom(draftGainedFrom);
    setAppliedGainedTo(draftGainedTo);
  };

  const users = data?.users ?? [];

  const resetCreateForm = () => {
    setCreateName("");
    setCreateBusiness("");
    setCreatePhone("");
    setCreatePin("");
    setCreateError(null);
    setCreatedMerchant(null);
  };

  const closeCreateModal = () => {
    setShowCreateMerchant(false);
    resetCreateForm();
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (createPhone.replace(/\D/g, "").length < 10) {
      setCreateError("Enter a valid 10-digit phone.");
      return;
    }
    if (createPin.length < 4) {
      setCreateError("Temporary PIN must be at least 4 characters.");
      return;
    }
    setCreateLoading(true);
    try {
      const user = await adminApi.createMerchant({
        name: createName.trim(),
        businessName: createBusiness.trim(),
        phone: createPhone.replace(/\D/g, "").slice(-10),
        pin: createPin,
      });
      setCreatedMerchant(user);
      await fetchUsers();
    } catch (err: unknown) {
      setCreateError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Could not create merchant",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={isSuperAdmin ? "Manage users" : "Users"}
        icon="ti-users"
        subtitle={
          isSuperAdmin
            ? "Onboard shops after payment, search users, and open detail for blacklist or plans."
            : "Search by name, phone, or business. Blacklist revokes access without deleting data."
        }
        actions={
          isSuperAdmin ? (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetCreateForm();
                setShowCreateMerchant(true);
              }}
            >
              <i className="ti ti-plus me-1" aria-hidden />
              Add shop
            </button>
          ) : undefined
        }
      />

      <SectionPanel title="Filters" icon="ti-filter" className="mb-4">
        <form className="d-flex gap-2 flex-wrap align-items-end" onSubmit={onApplyFilters}>
          <div>
            <label className="form-label small text-muted mb-1">Search</label>
            <input
              type="search"
              className="form-control"
              style={{ maxWidth: 280 }}
              placeholder="Name, phone, or business"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </div>
          {isSuperAdmin && (
            <>
              <div>
                <label className="form-label small text-muted mb-1">Gained</label>
                <select
                  className="form-select"
                  style={{ width: "auto", minWidth: 140 }}
                  value={draftGainedFilter}
                  onChange={(e) => setDraftGainedFilter(e.target.value as GainedFilter)}
                >
                  <option value="all">All</option>
                  <option value="1d">Last 24h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="1y">Last year</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
              {draftGainedFilter === "custom" && (
                <>
                  <div>
                    <label className="form-label small text-muted mb-1">From</label>
                    <input
                      type="date"
                      className="form-control"
                      value={draftGainedFrom}
                      onChange={(e) => setDraftGainedFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label small text-muted mb-1">To</label>
                    <input
                      type="date"
                      className="form-control"
                      value={draftGainedTo}
                      onChange={(e) => setDraftGainedTo(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}
          <FilterApplyButton loading={loading} disabled={!filtersApplyReady} />
        </form>
      </SectionPanel>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <SectionPanel flush bodyClassName="p-0">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <>
            <div className="table-responsive merchant-data-table">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Business</th>
                    <th scope="col" className="merchant-data-table__num">
                      Bills
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                    <th scope="col" className="merchant-data-table__num" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {error
                          ? "Could not load users. Check your connection."
                          : "No users match these filters."}
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="fw-medium">{u.name}</td>
                        <td>{u.phone}</td>
                        <td>{u.businessName || "—"}</td>
                        <td className="merchant-data-table__num">
                          {u.usage?.invoiceRequestSuccessCount ?? 0}
                        </td>
                        <td>
                          {u.isBlacklisted ? (
                            <span className="badge bg-danger">Blacklisted</span>
                          ) : (
                            <span className="badge bg-success">Active</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="merchant-data-table__num">
                          <Link
                            to={`/dashboard/users/${u.id}`}
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          >
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
              <div className="d-flex justify-content-between align-items-center merchant-data-table__footer border-top">
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
            ) : null}
          </>
        )}
      </SectionPanel>

      <AppModal
        show={showCreateMerchant}
        title={createdMerchant ? "Shop created" : "Onboard new shop"}
        onClose={closeCreateModal}
        size="md"
        footer={
          createdMerchant ? (
            <button type="button" className="btn btn-primary" onClick={closeCreateModal}>
              Done
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-outline-secondary" onClick={closeCreateModal}>
                Cancel
              </button>
              <button
                type="submit"
                form="create-merchant-form"
                className="btn btn-primary"
                disabled={createLoading}
              >
                {createLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Create account
              </button>
            </>
          )
        }
      >
        {createdMerchant ? (
          <div className="small">
            <p className="mb-2">Share these credentials securely with the shop owner:</p>
            <ul className="list-unstyled mb-0">
              <li>
                <strong>Phone:</strong> {createdMerchant.phone}
              </li>
              <li>
                <strong>Business:</strong> {createdMerchant.businessName || "—"}
              </li>
              <li>
                <strong>Temporary PIN:</strong> {createPin}
              </li>
            </ul>
            <p className="text-muted mt-3 mb-0">They can change PIN under Settings after first login.</p>
          </div>
        ) : (
          <>
            {createError ? <div className="alert alert-danger py-2 small">{createError}</div> : null}
            <form id="create-merchant-form" onSubmit={handleCreateMerchant}>
              <label className="form-label small fw-semibold">Owner name</label>
              <input
                className="form-control mb-3"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
                minLength={2}
              />
              <label className="form-label small fw-semibold">Business / branch name</label>
              <input
                className="form-control mb-3"
                value={createBusiness}
                onChange={(e) => setCreateBusiness(e.target.value)}
                required
                minLength={2}
              />
              <label className="form-label small fw-semibold">Phone (10 digits)</label>
              <input
                className="form-control mb-3"
                type="tel"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
                maxLength={10}
              />
              <label className="form-label small fw-semibold">Temporary PIN</label>
              <input
                className="form-control mb-0"
                type="text"
                value={createPin}
                onChange={(e) => setCreatePin(e.target.value.slice(0, 8))}
                required
                minLength={4}
                autoComplete="off"
              />
            </form>
          </>
        )}
      </AppModal>
    </PageShell>
  );
}
