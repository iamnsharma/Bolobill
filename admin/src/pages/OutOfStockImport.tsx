import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminApi, type OosImportPreviewResponse } from "../api/admin";
import ImportWizardShell, { DownloadCsvTemplate } from "../components/import/ImportWizardShell";
import ImportSourcePicker from "../components/import/ImportSourcePicker";
import { parseImportSourceParam, type ImportSourceId } from "../components/import/importTypes";
import MenuImportUploadStep, {
  validateMenuImportFile,
} from "../components/stock/menuImport/MenuImportUploadStep";
import { OosImportFileStep } from "../components/import/StockImportFileStep";
import StockImportPasteStep from "../components/import/StockImportPasteStep";
import OosImportPreviewStep, {
  computeOosSummary,
  type OosImportDraft,
} from "../components/import/OosImportPreviewStep";
import { shareOutOfStockListOnWhatsApp } from "../utils/shareOutOfStockListWhatsApp";

const OOS_TEMPLATE = `name,quantity,note
Rice 25kg,2 bags,Urgent
Cooking oil 1L,5,
`;

type Step = "source" | "review" | "summary" | "success";

export default function OutOfStockImport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [source, setSource] = useState<ImportSourceId>(() =>
    parseImportSourceParam(searchParams.get("source")),
  );
  const [step, setStep] = useState<Step>("source");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<OosImportDraft | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSource(parseImportSourceParam(searchParams.get("source")));
  }, [searchParams]);

  const goReview = useCallback((result: OosImportPreviewResponse) => {
    setDraft({ items: result.items.map(i => ({ ...i })) });
    setStep("review");
    setError(null);
  }, []);

  const handlePhoto = async (file: File) => {
    const err = validateMenuImportFile(file);
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      goReview(await adminApi.analyzeOosImport(fd));
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      goReview(await adminApi.parseOosImportFile(fd));
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    setLoading(true);
    try {
      goReview(await adminApi.parseOosImportPaste({ text: pasteText }));
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setDraft(null);
    setStep("source");
    setError(null);
    setSuccessMessage(null);
  };

  const commit = async () => {
    if (!draft) return;
    const newItems = draft.items.filter(i => i.duplicateStatus === "new" && i.name.trim());
    if (!newItems.length) {
      setError("All items already on your list.");
      return;
    }
    setImporting(true);
    try {
      const result = await adminApi.commitOosImport({
        items: newItems.map(i => ({
          name: i.name.trim(),
          quantity: i.quantity.trim() || undefined,
          note: i.note.trim() || undefined,
        })),
      });
      setSuccessMessage(result.message);
      setStep("success");
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <ImportWizardShell title="Import restock list" backTo="/dashboard/out-of-stock" backLabel="List" step={step}>
      {step === "source" && (
        <>
          <ImportSourcePicker value={source} onChange={setSource} />
          {(source === "csv" || source === "excel") && (
            <p className="small text-muted mb-2">
              <DownloadCsvTemplate filename="bolobill-restock-template.csv" content={OOS_TEMPLATE} />
            </p>
          )}
          {source === "photo" && (
            <MenuImportUploadStep
              analyzing={loading}
              error={error}
              onFileSelected={handlePhoto}
              onCancel={() => navigate("/dashboard/out-of-stock")}
            />
          )}
          {(source === "csv" || source === "excel") && (
            <OosImportFileStep source={source} loading={loading} error={error} onFile={handleFile} />
          )}
          {source === "paste" && (
            <StockImportPasteStep
              value={pasteText}
              onChange={setPasteText}
              loading={loading}
              error={error}
              onSubmit={handlePaste}
              hint="One item per line: name, quantity, note"
            />
          )}
        </>
      )}

      {step === "review" && draft && (
        <OosImportPreviewStep
          draft={draft}
          onDraftChange={setDraft}
          onContinue={() => {
            if (computeOosSummary(draft).newCount === 0) {
              setError("Nothing new to import.");
              return;
            }
            setError(null);
            setStep("summary");
          }}
          onBack={reset}
        />
      )}

      {step === "summary" && draft && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          <p>
            Import <strong>{computeOosSummary(draft).newCount}</strong> new item(s) to your restock list.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setStep("review")}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-outline-success"
              onClick={() =>
                shareOutOfStockListOnWhatsApp(
                  draft.items
                    .filter(i => i.duplicateStatus === "new")
                    .map(i => ({ name: i.name, quantity: i.quantity, note: i.note })),
                )
              }
            >
              <i className="ti ti-brand-whatsapp me-1" />
              Share preview
            </button>
            <button type="button" className="btn btn-primary" disabled={importing} onClick={commit}>
              {importing ? "Saving…" : "Import items"}
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="card border-0 shadow-sm rounded-3 text-center p-5">
          <p className="mb-4">{successMessage}</p>
          <Link to="/dashboard/out-of-stock" className="btn btn-primary">View list</Link>
        </div>
      )}
    </ImportWizardShell>
  );
}
