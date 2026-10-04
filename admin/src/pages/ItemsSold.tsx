import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { adminApi, type ItemSold } from "../api/admin";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import DateRangePresetBar from "../components/merchant/DateRangePresetBar";
import { ItemsSoldChartsSection } from "../components/ItemsSoldChartsSection";
import ChartToggleButton from "../components/merchant/ChartToggleButton";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import { useDateRangePresets } from "../hooks/useDateRangePresets";

export default function ItemsSold() {
  const { t } = useTranslation();
  const { formatFinance, financeDataEpoch } = useFinancePrivacy();
  const [items, setItems] = useState<ItemSold[]>([]);
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

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getItemsSold({
        from: appliedFrom || undefined,
        to: appliedTo || undefined,
      });
      setItems(res.items ?? []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load items",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [appliedFrom, appliedTo, financeDataEpoch]);

  return (
    <PageShell>
      <PageHeader
        title={t("pages.itemsSold.title")}
        icon="ti-package"
        subtitle={t("pages.itemsSold.subtitle")}
      />

      <SectionPanel title={t("pages.itemsSold.dateRange")} icon="ti-calendar" className="mb-4">
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
        <p className="small text-muted mb-0 mt-2">{t("pages.itemsSold.dateHint")}</p>
      </SectionPanel>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <SectionPanel
        title="Sold items"
        icon="ti-list"
        flush
        bodyClassName="p-0"
        actions={
          <ChartToggleButton
            open={showGraph}
            onToggle={() => setShowGraph((v) => !v)}
            disabled={loading || items.length === 0}
            closedLabel="View graph"
          />
        }
      >
          {showGraph ? (
            <div className="p-3 p-md-4 border-bottom bg-light bg-opacity-50">
              <ItemsSoldChartsSection items={items} loading={loading} />
            </div>
          ) : null}
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <MerchantDataTable>
                <thead className="bg-light">
                  <tr>
                    <th scope="col">
                      <MerchantTableHeadLabel>Item name</MerchantTableHeadLabel>
                    </th>
                    <th scope="col" className="merchant-data-table__num">
                      <MerchantTableHeadLabel numeric>
                        Quantity
                      </MerchantTableHeadLabel>
                    </th>
                    <th scope="col" className="merchant-data-table__num">
                      <MerchantTableHeadLabel numeric>
                        Amount (₹)
                      </MerchantTableHeadLabel>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-4">
                        {rangeFiltered
                          ? "No items found for the selected period."
                          : "No items sold yet."}
                      </td>
                    </tr>
                  ) : (
                    items.map((row, i) => (
                      <tr key={i}>
                        <td className="fw-medium">{row.itemName}</td>
                        <td className="merchant-data-table__num">{row.quantity}</td>
                        <td className="merchant-data-table__num">{formatFinance(row.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
            </MerchantDataTable>
          )}
      </SectionPanel>
    </PageShell>
  );
}
