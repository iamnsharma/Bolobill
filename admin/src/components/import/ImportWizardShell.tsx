import type { ReactNode } from "react";
import PageShell from "../merchant/PageShell";
import PageHeader from "../merchant/PageHeader";
const STEP_LABELS = ["Choose source", "Review", "Import"];

export default function ImportWizardShell({
  title,
  backTo,
  backLabel,
  step,
  wizardStepIndex,
  actions,
  children,
}: {
  title: string;
  backTo: string;
  backLabel: string;
  step: "source" | "review" | "summary" | "success";
  wizardStepIndex?: number;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const idx =
    wizardStepIndex ??
    (step === "source" ? 0 : step === "review" ? 1 : step === "summary" ? 2 : 3);

  return (
    <PageShell className="menu-import-page import-gemini-page">
      <PageHeader
        title={title}
        icon="ti-download"
        subtitle="Upload → Review → Import"
        actions={
          actions ?? (
            <a href={backTo} className="btn btn-outline-secondary btn-sm">
              <i className="ti ti-arrow-left" aria-hidden />
              <span className="d-none d-sm-inline ms-1">{backLabel}</span>
            </a>
          )
        }
      />
      {step !== "success" && (
        <nav className="import-wizard-steps" aria-label="Import progress">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={i === Math.min(idx, 2) ? "import-wizard-steps__active" : ""}>
              {i + 1}. {label}
            </span>
          ))}
        </nav>
      )}
      {children}
    </PageShell>
  );
}

export function DownloadCsvTemplate({
  filename,
  content,
  label = "Download CSV template",
}: {
  filename: string;
  content: string;
  label?: string;
}) {
  const handleClick = () => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" className="btn btn-link btn-sm text-decoration-none px-0" onClick={handleClick}>
      <i className="ti ti-download me-1" aria-hidden />
      {label}
    </button>
  );
}
