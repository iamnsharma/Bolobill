/** Common retail units (India shop / POS). Custom values still allowed via picker input. */
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
  "pair",
  "set",
  "roll",
  "sheet",
  "tube",
  "can",
  "pkt",
  "tray",
  "crate",
] as const;

export const POPULAR_UNITS = ["pcs", "kg", "ltr", "box", "pack", "dozen", "bag", "bottle"] as const;

export function filterStockUnits(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...STOCK_UNIT_OPTIONS];
  return STOCK_UNIT_OPTIONS.filter((u) => u.includes(q) || u.startsWith(q));
}
