export type ImportSourceId = "photo" | "csv" | "excel" | "paste";

export const IMPORT_SOURCES: {
  id: ImportSourceId;
  label: string;
  icon: string;
  ai?: boolean;
}[] = [
  { id: "photo", label: "Read from photo", icon: "ti-sparkles", ai: true },
  { id: "csv", label: "Upload CSV", icon: "ti-file-type-csv" },
  { id: "excel", label: "Upload Excel", icon: "ti-file-spreadsheet" },
  { id: "paste", label: "Paste list", icon: "ti-clipboard-text" },
];

export function parseImportSourceParam(value: string | null): ImportSourceId {
  if (value === "csv" || value === "excel" || value === "paste" || value === "photo") {
    return value;
  }
  return "photo";
}
