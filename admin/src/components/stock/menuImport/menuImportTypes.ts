import type {
  MenuImportAnalyzeResponse,
  MenuImportPreviewCategory,
  MenuImportPreviewItem,
} from "../../../api/admin";

export type EditableMenuImportItem = MenuImportPreviewItem & {
  /** Empty until user enters stock (new items only). */
  stockQty: string;
};

export type MenuImportDraft = {
  categories: MenuImportPreviewCategory[];
  items: EditableMenuImportItem[];
};

export function draftFromAnalyze(response: MenuImportAnalyzeResponse): MenuImportDraft {
  return {
    categories: response.categories.map(c => ({ ...c })),
    items: response.items.map(item => ({
      ...item,
      stockQty: "",
    })),
  };
}

export function computeDraftSummary(draft: MenuImportDraft) {
  const found = draft.items.length;
  const existsCount = draft.items.filter(i => i.duplicateStatus === "exists").length;
  const newCount = found - existsCount;
  return { found, newCount, existsCount };
}

export function getCategoryName(draft: MenuImportDraft, categoryTempId: string): string {
  return draft.categories.find(c => c.tempId === categoryTempId)?.name?.trim() ?? "";
}

export function newItemsReadyCount(draft: MenuImportDraft): number {
  return draft.items.filter(item => {
    if (item.duplicateStatus !== "new") return false;
    const cat = getCategoryName(draft, item.categoryTempId);
    if (!item.name.trim() || !cat) return false;
    if (item.unitPrice == null || Number.isNaN(item.unitPrice) || item.unitPrice < 0) return false;
    if (item.stockQty.trim() === "") return false;
    const qty = Number(item.stockQty);
    return !Number.isNaN(qty) && qty >= 0;
  }).length;
}

export function validateNewItemsForImport(draft: MenuImportDraft): string | null {
  const newItems = draft.items.filter(i => i.duplicateStatus === "new");
  if (newItems.length === 0) {
    return "All items already exist. Nothing new to import.";
  }
  for (const item of newItems) {
    const cat = getCategoryName(draft, item.categoryTempId);
    if (!cat) return `Choose a category for "${item.name || "item"}".`;
    if (!item.name.trim()) return "Every new item needs a name.";
    if (item.unitPrice == null || item.unitPrice < 0) return `Enter a price for "${item.name}".`;
    if (item.stockQty.trim() === "") return `Enter stock quantity for "${item.name}".`;
    const qty = Number(item.stockQty);
    if (Number.isNaN(qty) || qty < 0) return `Stock for "${item.name}" must be 0 or more.`;
  }
  return null;
}

export function buildCommitPayload(draft: MenuImportDraft): import("../../../api/admin").MenuImportCommitProduct[] {
  return draft.items
    .filter(i => i.duplicateStatus === "new")
    .map(item => ({
      tempId: item.tempId,
      categoryName: getCategoryName(draft, item.categoryTempId),
      name: item.name.trim(),
      unit: item.unit.trim() || "pcs",
      unitPrice: item.unitPrice ?? 0,
      quantityOnHand: Number(item.stockQty),
      quantityOnHandProvided: true as const,
      lowStockThreshold:
        item.lowStockThreshold != null && item.lowStockThreshold >= 0
          ? item.lowStockThreshold
          : undefined,
    }));
}
