import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminInvoice } from "../api/admin";
import InvoiceViewModal from "../components/InvoiceViewModal";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import FilterApplyButton from "../components/merchant/FilterApplyButton";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import { canSubmitListFilters } from "../utils/dateRangeFilters";

export default function Invoices() {
  const { isSuperAdmin } = useAuth();
  const { formatFinance } = useFinancePrivacy();
  const [searchParams] = useSearchParams();
  const userIdFromQuery = searchParams.get("userId") ?? "";
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
  const [draftSearch, setDraftSearch] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getInvoices({
        page,
        limit: 20,
        search: appliedSearch || undefined,
        userId: isSuperAdmin ? userIdFromQuery || undefined : undefined,
        from: appliedFrom || undefined,
        to: appliedTo || undefined,
      });
      setData({
        invoices: res.invoices,
        total: res.total,
        page: res.page,
        limit: res.limit,
        totalPages: res.totalPages,
      });
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load invoices",
      );
      setData({ invoices: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, isSuperAdmin, userIdFromQuery, appliedSearch, appliedFrom, appliedTo]);

  const filtersApplyReady = canSubmitListFilters({
    draftFrom,
    draftTo,
    appliedFrom,
    appliedTo,
    draftSearch,
    appliedSearch,
  });

  const onApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filtersApplyReady) return;
    setPage(1);
    setAppliedSearch(draftSearch);
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
  };

  return (
    <PageShell>
      <PageHeader
        title={isSuperAdmin ? "Invoices" : "Bills & Invoices"}
        icon="ti-receipt"
        subtitle={
          isSuperAdmin
            ? userIdFromQuery
              ? "Invoices for this user."
              : "All invoices across the platform."
            : "Search bills by customer or date. Saved bills cannot be edited."
        }
        actions={
          !isSuperAdmin ? (
            <Link
              to="/dashboard/invoices/new"
              className="btn btn-primary d-inline-flex align-items-center gap-1">
              <i className="ti ti-plus" />
              New bill
            </Link>
          ) : undefined
        }
      />

      <SectionPanel title="Search & filter" icon="ti-filter" className="mb-4">
          <form
            className="d-flex flex-wrap gap-3 align-items-end"
            onSubmit={onApplyFilters}>
            <div className="d-flex align-items-center gap-2">
              <i className="ti ti-search text-muted" />
              <input
                type="search"
                className="form-control"
                style={{ maxWidth: 260 }}
                placeholder="Customer name or invoice ID"
                value={draftSearch}
                onChange={(e) => setDraftSearch(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted mb-0">From</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 140 }}
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted mb-0">To</label>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: 140 }}
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </div>
            <FilterApplyButton loading={loading} disabled={!filtersApplyReady} />
          </form>
          <p className="small text-muted mb-0 mt-2">
            Search works without dates. If you use dates, pick both before Apply.
          </p>
      </SectionPanel>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <SectionPanel title="All bills" icon="ti-list" flush bodyClassName="p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <>
              <MerchantDataTable>
                  <thead className="bg-light">
                    <tr>
                      <th scope="col">
                        <MerchantTableHeadLabel>Invoice ID</MerchantTableHeadLabel>
                      </th>
                      <th scope="col">
                        <MerchantTableHeadLabel>Customer</MerchantTableHeadLabel>
                      </th>
                      <th scope="col" className="merchant-data-table__num">
                        <MerchantTableHeadLabel numeric>Total</MerchantTableHeadLabel>
                      </th>
                      <th scope="col">
                        <MerchantTableHeadLabel>Source</MerchantTableHeadLabel>
                      </th>
                      {isSuperAdmin && (
                        <th scope="col">
                          <MerchantTableHeadLabel>User</MerchantTableHeadLabel>
                        </th>
                      )}
                      <th scope="col">
                        <MerchantTableHeadLabel>Created</MerchantTableHeadLabel>
                      </th>
                      <th scope="col" className="merchant-data-table__num" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {!data || data.invoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={isSuperAdmin ? 7 : 6}
                          className="text-center text-muted py-4">
                          {error
                            ? "API unavailable or error. Check backend."
                            : "No invoices found."}
                        </td>
                      </tr>
                    ) : (
                      data.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="fw-medium">{inv.invoiceId}</td>
                          <td>{inv.customerName}</td>
                          <td className="merchant-data-table__num">{formatFinance(inv.total)}</td>
                          <td>
                            <span
                              className={`badge ${inv.source === "voice" ? "bg-primary" : "bg-secondary"}`}>
                              {inv.source}
                            </span>
                          </td>
                          {isSuperAdmin && (
                            <td>
                              {inv.user ? (
                                <Link
                                  to={`/dashboard/users/${inv.user.id}`}
                                  className="text-decoration-none">
                                  {inv.user.name ?? inv.user.phone}
                                </Link>
                              ) : (
                                "—"
                              )}
                            </td>
                          )}
                          <td className="small text-muted">
                            {inv.createdAt
                              ? new Date(inv.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="merchant-data-table__num">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => setViewInvoiceId(inv.id)}>
                              <i className="ti ti-eye" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
              </MerchantDataTable>
              {data && data.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center merchant-data-table__footer border-top">
                  <small className="text-muted">
                    {data.total} total · page {data.page} of {data.totalPages}
                  </small>
                  <div className="btn-group btn-group-sm">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={data.page <= 1}
                      onClick={() => setPage((p) => p - 1)}>
                      Previous
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={data.page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
      </SectionPanel>

      <InvoiceViewModal
        invoiceId={viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
      />
    </PageShell>
  );
}
