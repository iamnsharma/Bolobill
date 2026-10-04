import { isDateRangeComplete } from "./dateRangeFilters";

export type DateRangePreset = "all" | "1d" | "1w" | "1m" | "3m" | "1y" | "custom";

export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBeforeToday(days: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - days);
  return d;
}

/** Returns inclusive from/to in local calendar dates, or null for "all". */
export function rangeForPreset(preset: DateRangePreset): { from: string; to: string } | null {
  if (preset === "all" || preset === "custom") return null;
  const to = toLocalDateString(startOfToday());
  switch (preset) {
    case "1d":
      return { from: to, to };
    case "1w":
      return { from: toLocalDateString(daysBeforeToday(6)), to };
    case "1m":
      return { from: toLocalDateString(daysBeforeToday(29)), to };
    case "3m":
      return { from: toLocalDateString(daysBeforeToday(89)), to };
    case "1y":
      return { from: toLocalDateString(daysBeforeToday(364)), to };
    default:
      return null;
  }
}

export function isRangeFilterActive(
  preset: DateRangePreset,
  appliedFrom: string,
  appliedTo: string,
): boolean {
  if (preset === "all") return false;
  if (preset === "custom") return isDateRangeComplete(appliedFrom, appliedTo);
  return true;
}
