export type OosShareRow = { name: string; quantity?: string; note?: string };

export function buildOutOfStockShareMessage(
  items: OosShareRow[],
  shopName?: string,
): string {
  const header = shopName?.trim()
    ? `Restock list — ${shopName.trim()}`
    : "Restock list";
  const lines = items
    .filter(i => i.name.trim())
    .map((item, idx) => {
      const qty = item.quantity?.trim();
      const note = item.note?.trim();
      let line = `${idx + 1}. ${item.name.trim()}`;
      if (qty) line += ` — ${qty}`;
      if (note) line += ` (${note})`;
      return line;
    });
  return [header, "", ...lines].join("\n");
}

export function shareOutOfStockListOnWhatsApp(items: OosShareRow[], shopName?: string): void {
  const text = buildOutOfStockShareMessage(items, shopName);
  const encoded = encodeURIComponent(text);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = isMobile
    ? `https://wa.me/?text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
