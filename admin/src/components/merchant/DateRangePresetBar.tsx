import { useTranslation } from "react-i18next";
import type { DateRangePreset } from "../../utils/dateRangePresets";
import FilterApplyButton from "./FilterApplyButton";
import MerchantFilterField from "./MerchantFilterField";

const PRESETS: { id: DateRangePreset; labelKey: string }[] = [
  { id: "all", labelKey: "datePreset.all" },
  { id: "1d", labelKey: "datePreset.1d" },
  { id: "1w", labelKey: "datePreset.1w" },
  { id: "1m", labelKey: "datePreset.1m" },
  { id: "3m", labelKey: "datePreset.3m" },
  { id: "1y", labelKey: "datePreset.1y" },
  { id: "custom", labelKey: "datePreset.custom" },
];

type DateRangePresetBarProps = {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  draftFrom: string;
  draftTo: string;
  onDraftFromChange: (value: string) => void;
  onDraftToChange: (value: string) => void;
  onCustomApply: () => void;
  customApplyReady: boolean;
  customApplyLoading?: boolean;
  className?: string;
};

export default function DateRangePresetBar({
  preset,
  onPresetChange,
  draftFrom,
  draftTo,
  onDraftFromChange,
  onDraftToChange,
  onCustomApply,
  customApplyReady,
  customApplyLoading = false,
  className = "",
}: DateRangePresetBarProps) {
  const { t } = useTranslation();

  return (
    <div className={`date-range-preset-bar ${className}`.trim()}>
      <div className="date-range-preset-bar__chips d-flex flex-wrap gap-2" role="group" aria-label={t("pages.sales.dateRange")}>
        {PRESETS.map(({ id, labelKey }) => (
          <button
            key={id}
            type="button"
            className={`btn btn-sm date-range-preset-bar__chip${preset === id ? " btn-primary" : " btn-outline-secondary"}`}
            onClick={() => onPresetChange(id)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {preset === "custom" ? (
        <form
          className="merchant-filter-bar mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!customApplyReady) return;
            onCustomApply();
          }}
        >
          <MerchantFilterField label={t("common.fromDate")}>
            <input
              type="date"
              className="form-control"
              value={draftFrom}
              onChange={(e) => onDraftFromChange(e.target.value)}
            />
          </MerchantFilterField>
          <MerchantFilterField label={t("common.toDate")}>
            <input
              type="date"
              className="form-control"
              value={draftTo}
              onChange={(e) => onDraftToChange(e.target.value)}
            />
          </MerchantFilterField>
          <FilterApplyButton loading={customApplyLoading} disabled={!customApplyReady} />
        </form>
      ) : null}
    </div>
  );
}
