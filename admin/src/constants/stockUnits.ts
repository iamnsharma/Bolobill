/** Common units for retail, services, and trades. Custom values still allowed via picker input. */
export const STOCK_UNIT_OPTIONS = [
  "pcs",
  "kg",
  "g",
  "ltr",
  "ml",
  "box",
  "pack",
  "dozen",
  "bag",
  "bottle",
  "carton",
  "meter",
  "m",
  "ft",
  "sq ft",
  "pair",
  "service",
  "set",
  "roll",
  "sheet",
  "tube",
  "can",
  "pkt",
  "tray",
  "crate",
] as const;

export const POPULAR_UNITS = [
  "pcs",
  "kg",
  "ltr",
  "sq ft",
  "pair",
  "service",
  "box",
  "pack",
] as const;

export function filterStockUnits(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...STOCK_UNIT_OPTIONS];
  return STOCK_UNIT_OPTIONS.filter((u) => u.includes(q) || u.startsWith(q));
}
