export type GainedFilter = "all" | "1d" | "7d" | "30d" | "1y" | "custom";

/** Map superadmin “Gained” UI to API date params (ISO strings). */
export function gainedFilterToCreatedRange(
  filter: GainedFilter,
  customFrom?: string,
  customTo?: string,
): { createdFrom?: string; createdTo?: string } {
  if (filter === "all") return {};

  const end = new Date();
  if (filter === "custom") {
    if (!customFrom?.trim()) return {};
    const start = new Date(customFrom);
    const endDate = customTo?.trim() ? new Date(customTo) : new Date(end);
    endDate.setHours(23, 59, 59, 999);
    return { createdFrom: start.toISOString(), createdTo: endDate.toISOString() };
  }

  const start = new Date(end);
  if (filter === "1d") start.setDate(start.getDate() - 1);
  else if (filter === "7d") start.setDate(start.getDate() - 7);
  else if (filter === "30d") start.setMonth(start.getMonth() - 1);
  else if (filter === "1y") start.setFullYear(start.getFullYear() - 1);

  return { createdFrom: start.toISOString(), createdTo: end.toISOString() };
}
