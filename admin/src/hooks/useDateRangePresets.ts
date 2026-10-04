import { useCallback, useState } from "react";
import { canApplyDateRangeFilter, isDateRangeComplete } from "../utils/dateRangeFilters";
import {
  type DateRangePreset,
  isRangeFilterActive,
  rangeForPreset,
} from "../utils/dateRangePresets";

export function useDateRangePresets(initialPreset: DateRangePreset = "all") {
  const [preset, setPreset] = useState<DateRangePreset>(initialPreset);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  const applyPresetRange = useCallback((p: DateRangePreset) => {
    const range = rangeForPreset(p);
    if (!range) {
      setAppliedFrom("");
      setAppliedTo("");
      return;
    }
    setAppliedFrom(range.from);
    setAppliedTo(range.to);
  }, []);

  const selectPreset = useCallback(
    (p: DateRangePreset) => {
      setPreset(p);
      if (p === "custom") {
        setDraftFrom(appliedFrom);
        setDraftTo(appliedTo);
        return;
      }
      applyPresetRange(p);
    },
    [appliedFrom, appliedTo, applyPresetRange],
  );

  const applyCustomRange = useCallback(() => {
    if (!isDateRangeComplete(draftFrom, draftTo)) return;
    setAppliedFrom(draftFrom.trim());
    setAppliedTo(draftTo.trim());
  }, [draftFrom, draftTo]);

  const customApplyReady =
    preset === "custom" &&
    canApplyDateRangeFilter(draftFrom, draftTo, appliedFrom, appliedTo);

  const rangeFiltered = isRangeFilterActive(preset, appliedFrom, appliedTo);

  return {
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
  };
}
