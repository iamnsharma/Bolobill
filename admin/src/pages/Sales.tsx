import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ChartToggleButton from "../components/merchant/ChartToggleButton";
import { adminApi, type SalesSummary as SalesSummaryType } from "../api/admin";
import { SalesChartsSection } from "../components/SalesChartsSection";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MetricTile from "../components/merchant/MetricTile";
import DateRangePresetBar from "../components/merchant/DateRangePresetBar";
import { useDateRangePresets } from "../hooks/useDateRangePresets";

export default function Sales() {
  const { t } = useTranslation();
  const { formatFinance, financeDataEpoch } = useFinancePrivacy();
  const [summary, setSummary] = useState<SalesSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
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
    rangeFiltered,
  } = useDateRangePresets("all");

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
  }, [appliedFrom, appliedTo, financeDataEpoch]);

  return (
    <PageShell>
      <PageHeader
        title={t("pages.sales.title")}
        icon="ti-chart-bar"
        subtitle={t("pages.sales.subtitle")}
      />

      <SectionPanel title={t("pages.sales.dateRange")} icon="ti-calendar" className="mb-4">
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
        />
        <p className="small text-muted mb-0 mt-2">{t("pages.sales.dateHint")}</p>
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
        {rangeFiltered && (
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

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <p className="small text-muted mb-0">
          Totals above; open a graph for day / week / month trends or a custom range.
        </p>
        <ChartToggleButton
          open={showGraph}
          onToggle={() => setShowGraph((v) => !v)}
          closedLabel="View sales graph"
          openLabel="Hide graph"
        />
      </div>

      {showGraph ? (
        <SectionPanel title="Sales trends" icon="ti-chart-area-line" className="mb-4" bodyClassName="p-3 p-md-4">
          <SalesChartsSection preset={preset} appliedFrom={appliedFrom} appliedTo={appliedTo} />
        </SectionPanel>
      ) : null}
    </PageShell>
  );
}
