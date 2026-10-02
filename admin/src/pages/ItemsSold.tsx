import { useState, useEffect } from "react";
import { adminApi, type ItemSold } from "../api/admin";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import FilterApplyButton from "../components/merchant/FilterApplyButton";
import { ItemsSoldChartsSection } from "../components/ItemsSoldChartsSection";
import ChartToggleButton from "../components/merchant/ChartToggleButton";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import {
  canApplyDateRangeFilter,
  isDateRangeComplete,
} from "../utils/dateRangeFilters";

export default function ItemsSold() {
  const { formatFinance } = useFinancePrivacy();
  const [items, setItems] = useState<ItemSold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [showGraph, setShowGraph] = useState(false);
  const [appliedTo, setAppliedTo] = useState("");

  const dateApplyReady = canApplyDateRangeFilter(
    draftFrom,
    draftTo,
    appliedFrom,
    appliedTo,
  );
  const rangeFiltered = isDateRangeComplete(appliedFrom, appliedTo);

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
  }, [appliedFrom, appliedTo]);

  const onApplyDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateApplyReady) return;
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
  };

  return (
    <PageShell>
      <PageHeader
        title="Items Sold"
        icon="ti-package"
        subtitle="What sold, how much quantity, and revenue per item for any date range."
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
            Leave dates empty and Apply clears the filter (shows all). Both dates required to filter.
          </p>
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
