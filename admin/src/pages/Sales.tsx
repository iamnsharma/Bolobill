import { useState, useEffect } from "react";
import { adminApi, type SalesSummary as SalesSummaryType } from "../api/admin";
import { SalesChartsSection } from "../components/SalesChartsSection";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MetricTile from "../components/merchant/MetricTile";
import FilterApplyButton from "../components/merchant/FilterApplyButton";
import { canApplyDateRangeFilter, isDateRangeComplete } from "../utils/dateRangeFilters";

export default function Sales() {
  const { formatFinance } = useFinancePrivacy();
  const [summary, setSummary] = useState<SalesSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSalesSummary({
        from: appliedFrom || undefined,
        to: appliedTo || undefined,
      });
      setSummary(data);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load sales",
      );
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [appliedFrom, appliedTo]);

  const dateApplyReady = canApplyDateRangeFilter(
    draftFrom,
    draftTo,
    appliedFrom,
    appliedTo,
  );
  const showFilteredTile = isDateRangeComplete(appliedFrom, appliedTo);

  const onApplyDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateApplyReady) return;
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
  };

  return (
    <PageShell>
      <PageHeader
        title="Sales Summary"
        icon="ti-chart-bar"
        subtitle="Revenue for today, week, month, and year. Use dates for a custom range."
      />

      <SectionPanel title="Date range" icon="ti-calendar" className="mb-4">
          <form
            className="d-flex flex-wrap gap-3 align-items-end"
            onSubmit={onApplyDates}
          >
            <div>
              <label className="form-label small text-muted mb-1">
                From date
              </label>
              <input
                type="date"
                className="form-control"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label small text-muted mb-1">
                To date
              </label>
              <input
                type="date"
                className="form-control"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
              />
            </div>
            <FilterApplyButton loading={loading} disabled={!dateApplyReady} />
          </form>
          <p className="small text-muted mb-0 mt-2">
            Pick both dates to filter, or clear both and Apply to show all-time totals again.
          </p>
      </SectionPanel>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-4">
          <MetricTile
            label="Today"
            value={loading ? "…" : summary != null ? formatFinance(summary.today) : "—"}
            icon="ti-sun"
            tone="primary"
          />
        </div>
        <div className="col-md-6 col-lg-4">
          <MetricTile
            label="This week"
            value={loading ? "…" : summary != null ? formatFinance(summary.thisWeek) : "—"}
            icon="ti-calendar-week"
            tone="success"
          />
        </div>
        <div className="col-md-6 col-lg-4">
          <MetricTile
            label="This month"
            value={loading ? "…" : summary != null ? formatFinance(summary.thisMonth) : "—"}
            icon="ti-calendar-month"
            tone="info"
          />
        </div>
        <div className="col-md-6 col-lg-4">
          <MetricTile
            label="This year"
            value={loading ? "…" : summary != null ? formatFinance(summary.thisYear) : "—"}
            icon="ti-calendar-year"
            tone="warning"
          />
        </div>
        <div className="col-md-6 col-lg-4">
          <MetricTile
            label="All time"
            value={loading ? "…" : summary != null ? formatFinance(summary.total) : "—"}
            icon="ti-infinity"
            tone="primary"
          />
        </div>
        {showFilteredTile && (
          <div className="col-md-6 col-lg-4">
            <MetricTile
              label="Filtered range"
              value={
                loading ? "…" : summary != null ? formatFinance(summary.filteredTotal) : "—"
              }
              icon="ti-filter"
              tone="success"
            />
          </div>
        )}
      </div>

      <SectionPanel title="Charts" icon="ti-chart-area-line" flush bodyClassName="p-3 p-md-4">
        <SalesChartsSection />
      </SectionPanel>
    </PageShell>
  );
}
