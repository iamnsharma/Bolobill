import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type AdminInvoice } from "../api/admin";
import InvoiceViewModal from "../components/InvoiceViewModal";
import { VOICE_MIC_FEATURE_ENABLED } from "../utils/voiceComingSoon";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import FilterApplyButton from "../components/merchant/FilterApplyButton";
import MerchantFilterField from "../components/merchant/MerchantFilterField";
import DateRangePresetBar from "../components/merchant/DateRangePresetBar";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import { useDateRangePresets } from "../hooks/useDateRangePresets";

export default function Invoices() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const { formatFinance, financeDataEpoch } = useFinancePrivacy();
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
  const [appliedSearch, setAppliedSearch] = useState("");
  const {
    preset,
    selectPreset,
    appliedFrom,
    appliedTo,
    draftFrom,
    setDraftFrom,
    draftTo,
    setDraftTo,
    applyCustomRange,
    customApplyReady,
  } = useDateRangePresets("all");

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
          ?.message ?? t("pages.invoices.loadFail"),
      );
      setData({ invoices: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, isSuperAdmin, userIdFromQuery, appliedSearch, appliedFrom, appliedTo, financeDataEpoch]);

  useEffect(() => {
    setPage(1);
  }, [appliedFrom, appliedTo, preset]);

  const searchApplyReady = draftSearch.trim() !== appliedSearch.trim();

  const onApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchApplyReady) return;
    setPage(1);
    setAppliedSearch(draftSearch);
  };

  return (
    <PageShell>
      <PageHeader
        title={isSuperAdmin ? t("pages.invoices.titleAdmin") : t("pages.invoices.title")}
        icon="ti-receipt"
        subtitle={
          isSuperAdmin
            ? userIdFromQuery
              ? "Invoices for this user."
              : t("pages.invoices.subtitleAdmin")
            : t("pages.invoices.subtitle")
        }
        actions={
          !isSuperAdmin ? (
            <Link
              to="/dashboard/invoices/new"
              className="btn btn-primary btn-icon btn-sm import-icon-btn"
              title={t("pages.invoices.newBill")}
              aria-label={t("pages.invoices.newBill")}
            >
              <i className="ti ti-plus" aria-hidden />
            </Link>
          ) : undefined
        }
      />

      <SectionPanel title={t("pages.invoices.searchFilter")} icon="ti-filter" className="mb-4">
        <DateRangePresetBar
          preset={preset}
          onPresetChange={selectPreset}
          draftFrom={draftFrom}
          draftTo={draftTo}
          onDraftFromChange={setDraftFrom}
          onDraftToChange={setDraftTo}
          onCustomApply={applyCustomRange}
          customApplyReady={customApplyReady}
          customApplyLoading={loading}
          className="mb-3"
        />
        <form className="merchant-filter-bar" onSubmit={onApplySearch}>
          <MerchantFilterField
            label={t("pages.invoices.customerOrInvoice")}
            className="merchant-filter-field--grow"
          >
            <input
              type="search"
              className="form-control"
              placeholder={t("pages.invoices.customerPlaceholder")}
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
            />
          </MerchantFilterField>
          <FilterApplyButton loading={loading} disabled={!searchApplyReady} />
        </form>
        <p className="small text-muted mb-0 mt-2">{t("pages.invoices.filterHint")}</p>
      </SectionPanel>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <SectionPanel title={t("pages.invoices.allBills")} icon="ti-list" flush bodyClassName="p-0">
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
                        <MerchantTableHeadLabel>{t("pages.invoices.invoiceId")}</MerchantTableHeadLabel>
                      </th>
                      <th scope="col">
                        <MerchantTableHeadLabel>{t("pages.invoices.customer")}</MerchantTableHeadLabel>
                      </th>
                      <th scope="col" className="merchant-data-table__num">
                        <MerchantTableHeadLabel numeric>{t("pages.invoices.total")}</MerchantTableHeadLabel>
                      </th>
                      <th scope="col">
                        <MerchantTableHeadLabel>{t("pages.invoices.source")}</MerchantTableHeadLabel>
                      </th>
                      {isSuperAdmin && (
                        <th scope="col">
                          <MerchantTableHeadLabel>User</MerchantTableHeadLabel>
                        </th>
                      )}
                      <th scope="col">
                        <MerchantTableHeadLabel>{t("pages.invoices.created")}</MerchantTableHeadLabel>
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
                            <span className="badge bg-secondary">
                              {inv.source === "voice" && VOICE_MIC_FEATURE_ENABLED
                                ? "Voice"
                                : t("pages.invoices.manual")}
                            </span>
                            {inv.paymentMode === "credit" ? (
                              <span className="badge bg-warning text-dark ms-1">
                                {t("pages.invoices.creditBadge")}
                              </span>
                            ) : null}
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
                              {t("common.view")}
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
