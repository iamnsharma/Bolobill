import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  adminApi,
  type CreditAccountSummary,
  type CreditLedgerEntry,
  type AdminInvoice,
} from "../api/admin";
import AppModal from "../components/AppModal";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import InvoiceViewModal from "../components/InvoiceViewModal";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import { buildCreditReminderWhatsAppMessage } from "../utils/shareCreditReminderWhatsApp";
import { shareQrOnWhatsApp } from "../utils/shareQrOnWhatsApp";

function CreditList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatFinance, financeDataEpoch } = useFinancePrivacy();
  const [accounts, setAccounts] = useState<CreditAccountSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pendingOnly, setPendingOnly] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listCreditAccounts({
        q: search.trim() || undefined,
        pendingOnly,
        limit: 100,
      });
      setAccounts(res.accounts);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t("pages.credit.loadFail"),
      );
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [search, pendingOnly, t, financeDataEpoch]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchList(), search ? 300 : 0);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [search, pendingOnly, fetchList]);

  return (
    <PageShell>
      <PageHeader
        title={t("pages.credit.title")}
        subtitle={t("pages.credit.subtitle")}
        icon="ti-credit-card"
      />

      <SectionPanel title={t("pages.credit.searchTitle")} icon="ti-search" className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-8">
            <label className="form-label small mb-1">{t("pages.credit.searchPlaceholder")}</label>
            <input
              type="search"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("pages.credit.searchPlaceholder")}
            />
          </div>
          <div className="col-md-4">
            <div className="form-check mt-md-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="credit-pending-only"
                checked={pendingOnly}
                onChange={(e) => setPendingOnly(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="credit-pending-only">
                {t("pages.credit.pendingOnly")}
              </label>
            </div>
          </div>
        </div>
      </SectionPanel>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <SectionPanel title={t("pages.credit.accounts")} icon="ti-users" flush bodyClassName="p-0">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <MerchantDataTable>
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col">
                    <MerchantTableHeadLabel>{t("pages.credit.customer")}</MerchantTableHeadLabel>
                  </th>
                  <th scope="col">
                    <MerchantTableHeadLabel>{t("pages.credit.phone")}</MerchantTableHeadLabel>
                  </th>
                  <th scope="col" className="merchant-data-table__num">
                    <MerchantTableHeadLabel numeric>{t("pages.credit.totalCredit")}</MerchantTableHeadLabel>
                  </th>
                  <th scope="col" className="merchant-data-table__num">
                    <MerchantTableHeadLabel numeric>{t("pages.credit.paid")}</MerchantTableHeadLabel>
                  </th>
                  <th scope="col" className="merchant-data-table__num">
                    <MerchantTableHeadLabel numeric>{t("pages.credit.pending")}</MerchantTableHeadLabel>
                  </th>
                  <th scope="col" className="merchant-data-table__num" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      {t("pages.credit.empty")}
                    </td>
                  </tr>
                ) : (
                  accounts.map((a) => (
                    <tr key={a.phone}>
                      <td className="fw-medium">{a.customerName}</td>
                      <td>{a.phone}</td>
                      <td className="merchant-data-table__num">{formatFinance(a.totalCredited)}</td>
                      <td className="merchant-data-table__num">{formatFinance(a.totalPaid)}</td>
                      <td className="merchant-data-table__num fw-semibold text-danger">
                        {formatFinance(a.pendingBalance)}
                      </td>
                      <td className="merchant-data-table__num">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/dashboard/credit/${encodeURIComponent(a.phone)}`)}
                        >
                          {t("pages.credit.view")}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </MerchantDataTable>
        )}
      </SectionPanel>
    </PageShell>
  );
}

function CreditDetail({ phoneParam }: { phoneParam: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatFinance, formatMoney, hideFinance, financeDataEpoch } = useFinancePrivacy();
  const phone = decodeURIComponent(phoneParam);

  const [account, setAccount] = useState<CreditAccountSummary | null>(null);
  const [ledger, setLedger] = useState<CreditLedgerEntry[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCreditAccount(phone);
      setAccount(res.account);
      setLedger(res.ledger);
      setInvoices(res.invoices);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t("pages.credit.loadFail"),
      );
    } finally {
      setLoading(false);
    }
  }, [phone, t, financeDataEpoch]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const shopName = user?.businessName?.trim() || user?.name?.trim() || "Our business";

  const sendReminder = async () => {
    if (!account || hideFinance) return;
    const pending = account.pendingBalance ?? 0;
    if (pending <= 0) return;
    const msg = buildCreditReminderWhatsAppMessage({
      shopName,
      customerName: account.customerName,
      pendingFormatted: formatMoney(pending),
      totalCreditedFormatted: formatMoney(account.totalCredited ?? 0),
      totalPaidFormatted: formatMoney(account.totalPaid ?? 0),
    });
    const digits = phone.replace(/\D/g, "").slice(-10);
    await shareQrOnWhatsApp(digits, msg);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hideFinance) return;
    const amount = parseFloat(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setPayLoading(true);
    setError(null);
    try {
      await adminApi.recordCreditPayment(phone, {
        amount,
        note: payNote.trim() || undefined,
      });
      setPaymentOpen(false);
      setPayAmount("");
      setPayNote("");
      await loadDetail();
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t("pages.credit.paymentFail"),
      );
    } finally {
      setPayLoading(false);
    }
  };

  const pending = account?.pendingBalance ?? 0;

  return (
    <PageShell>
      <PageHeader
        title={account?.customerName ?? t("pages.credit.detailTitle")}
        subtitle={phone}
        icon="ti-credit-card"
        actions={
          <Link to="/dashboard/credit" className="btn btn-outline-secondary btn-sm">
            <i className="ti ti-arrow-left me-1" />
            {t("pages.credit.backToList")}
          </Link>
        }
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : account ? (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card border-0 bg-light h-100">
                <div className="card-body">
                  <div className="small text-muted">{t("pages.credit.totalCredit")}</div>
                  <div className="fs-5 fw-semibold">{formatFinance(account.totalCredited)}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-light h-100">
                <div className="card-body">
                  <div className="small text-muted">{t("pages.credit.paid")}</div>
                  <div className="fs-5 fw-semibold">{formatFinance(account.totalPaid)}</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-light h-100">
                <div className="card-body">
                  <div className="small text-muted">{t("pages.credit.pending")}</div>
                  <div className="fs-5 fw-semibold text-danger">{formatFinance(account.pendingBalance)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              className="btn btn-primary"
              disabled={hideFinance || pending <= 0}
              title={hideFinance ? t("pages.credit.unlockToPay") : undefined}
              onClick={() => setPaymentOpen(true)}
            >
              <i className="ti ti-cash me-1" />
              {t("pages.credit.recordPayment")}
            </button>
            <button
              type="button"
              className="btn btn-outline-success"
              disabled={hideFinance || pending <= 0}
              title={hideFinance ? t("pages.credit.unlockToRemind") : undefined}
              onClick={() => sendReminder()}
            >
              <i className="ti ti-brand-whatsapp me-1" />
              {t("pages.credit.sendReminder")}
            </button>
          </div>

          <SectionPanel title={t("pages.credit.ledger")} icon="ti-list" flush bodyClassName="p-0" className="mb-4">
            <MerchantDataTable>
              <table className="table table-sm align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>{t("pages.credit.ledgerDate")}</th>
                    <th>{t("pages.credit.ledgerType")}</th>
                    <th className="merchant-data-table__num">{t("pages.credit.ledgerAmount")}</th>
                    <th>{t("pages.credit.ledgerNote")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">
                        —
                      </td>
                    </tr>
                  ) : (
                    ledger.map((row) => (
                      <tr key={row.id}>
                        <td className="small text-muted">
                          {new Date(row.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${row.type === "sale" ? "bg-warning text-dark" : "bg-success"}`}
                          >
                            {row.type === "sale" ? t("pages.credit.typeSale") : t("pages.credit.typePayment")}
                          </span>
                          {row.invoicePublicId ? (
                            <span className="small text-muted ms-1">{row.invoicePublicId}</span>
                          ) : null}
                        </td>
                        <td className="merchant-data-table__num">{formatFinance(row.amount)}</td>
                        <td className="small">{row.note || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </MerchantDataTable>
          </SectionPanel>

          <SectionPanel title={t("pages.credit.creditBills")} icon="ti-receipt" flush bodyClassName="p-0">
            <MerchantDataTable>
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>{t("pages.invoices.invoiceId")}</th>
                    <th>{t("pages.invoices.created")}</th>
                    <th className="merchant-data-table__num">{t("pages.invoices.total")}</th>
                    <th className="merchant-data-table__num" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">—</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>{inv.invoiceId}</td>
                        <td className="small text-muted">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="merchant-data-table__num">{formatFinance(inv.total)}</td>
                        <td className="merchant-data-table__num">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setViewInvoiceId(inv.id)}
                          >
                            {t("common.view")}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </MerchantDataTable>
          </SectionPanel>
        </>
      ) : null}

      <AppModal
        show={paymentOpen}
        title={t("pages.credit.recordPayment")}
        onClose={() => !payLoading && setPaymentOpen(false)}
        size="md"
      >
        <form onSubmit={submitPayment}>
          <p className="small text-muted">
            {t("pages.credit.paymentHint", {
              pending: formatFinance(pending),
            })}
          </p>
          <div className="mb-3">
            <label className="form-label small fw-semibold">{t("pages.credit.paymentAmount")}</label>
            <input
              type="number"
              className="form-control"
              min="0.01"
              step="0.01"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small">{t("pages.credit.paymentNote")}</label>
            <input
              type="text"
              className="form-control"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setPaymentOpen(false)}
              disabled={payLoading}
            >
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn btn-primary" disabled={payLoading}>
              {payLoading ? t("common.saving") : t("pages.credit.confirmPayment")}
            </button>
          </div>
        </form>
      </AppModal>

      <InvoiceViewModal
        invoiceId={viewInvoiceId}
        onClose={() => setViewInvoiceId(null)}
      />
    </PageShell>
  );
}

export default function Credit() {
  const { phone } = useParams<{ phone?: string }>();
  if (phone) {
    return <CreditDetail phoneParam={phone} />;
  }
  return <CreditList />;
}
