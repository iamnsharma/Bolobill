/** Both ends of a range must be set (no partial from-only / to-only). */
export function isDateRangeComplete(from: string, to: string): boolean {
  return Boolean(from?.trim() && to?.trim());
}

/** Reject partial ranges (one date filled, one empty). */
export function canApplyOptionalDateRange(from: string, to: string): boolean {
  const hasFrom = Boolean(from?.trim());
  const hasTo = Boolean(to?.trim());
  if (hasFrom !== hasTo) return false;
  return true;
}

/**
 * Date-range Apply: enabled when both dates are selected, or when clearing an active range (both draft empty).
 */
export function canApplyDateRangeFilter(
  draftFrom: string,
  draftTo: string,
  appliedFrom: string,
  appliedTo: string,
): boolean {
  if (!canApplyOptionalDateRange(draftFrom, draftTo)) return false;
  if (isDateRangeComplete(draftFrom, draftTo)) return true;
  if (isDateRangeComplete(appliedFrom, appliedTo)) return true;
  return false;
}

/** Invoices / combined filters: dates must be complete if any date field is used; search-only still allowed. */
export function canSubmitListFilters(input: {
  draftFrom: string;
  draftTo: string;
  appliedFrom: string;
  appliedTo: string;
  draftSearch: string;
  appliedSearch: string;
}): boolean {
  const { draftFrom, draftTo, appliedFrom, appliedTo, draftSearch, appliedSearch } = input;
  if (!canApplyOptionalDateRange(draftFrom, draftTo)) return false;

  const searchChanged = draftSearch.trim() !== appliedSearch.trim();
  const datesChanged = draftFrom !== appliedFrom || draftTo !== appliedTo;
  if (!searchChanged && !datesChanged) return false;

  if (draftFrom.trim() || draftTo.trim()) {
    return isDateRangeComplete(draftFrom, draftTo);
  }

  return true;
}
