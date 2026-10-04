import { useCallback, useEffect, useRef, useState } from "react";
import AiVisionPinModal from "../components/import/AiVisionPinModal";
import { useAiVisionPinGate } from "../hooks/useAiVisionPinGate";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { adminApi } from "../api/admin";
import MenuImportUploadStep, {
  validateMenuImportFile,
} from "../components/stock/menuImport/MenuImportUploadStep";
import MenuImportPreviewStep from "../components/stock/menuImport/MenuImportPreviewStep";
import MenuImportSummaryStep from "../components/stock/menuImport/MenuImportSummaryStep";
import {
  buildCommitPayload,
  draftFromAnalyze,
  validateNewItemsForImport,
  type MenuImportDraft,
} from "../components/stock/menuImport/menuImportTypes";
import ImportWizardShell, { DownloadCsvTemplate } from "../components/import/ImportWizardShell";
import ImportSourcePicker from "../components/import/ImportSourcePicker";
import { parseImportSourceParam, type ImportSourceId } from "../components/import/importTypes";
import StockImportFileStep from "../components/import/StockImportFileStep";
import StockImportPasteStep from "../components/import/StockImportPasteStep";
const STOCK_TEMPLATE = `category,name,unit,unitPrice,quantityOnHand
Beverages,Coca Cola 500ml,bottle,40,
Snacks,Lays Classic,pack,20,
`;

type Step = "source" | "review" | "summary" | "success";

export default function MenuImport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [source, setSource] = useState<ImportSourceId>(() =>
    parseImportSourceParam(searchParams.get("source")),
  );
  const [step, setStep] = useState<Step>("source");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuImportDraft | null>(null);
  const [showStockErrors, setShowStockErrors] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const aiVisionPin = useAiVisionPinGate();

  useEffect(() => {
    setSource(parseImportSourceParam(searchParams.get("source")));
  }, [searchParams]);

  const goReview = useCallback((result: Awaited<ReturnType<typeof adminApi.analyzeMenuImport>>) => {
    setDraft(draftFromAnalyze(result));
    setShowStockErrors(false);
    setStep("review");
    setError(null);
  }, []);

  const handlePhotoFile = useCallback(async (file: File) => {
    const validationError = validateMenuImportFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);
    try {
      goReview(await adminApi.analyzeMenuImport(formData, aiVisionPin.getVisionPin()));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) aiVisionPin.clearUnlock();
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Couldn't read this photo.",
      );
    } finally {
      setLoading(false);
    }
  }, [goReview, aiVisionPin]);

  const handleChoosePhoto = useCallback(async () => {
    if (aiVisionPin.pinRequired && !aiVisionPin.unlocked) {
      const pin = await aiVisionPin.requestUnlock();
      if (!pin) return;
    }
    photoInputRef.current?.click();
  }, [aiVisionPin]);

  const handleSpreadsheetFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      try {
        goReview(await adminApi.parseStockImportFile(formData));
      } catch (err: unknown) {
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Could not read file.",
        );
      } finally {
        setLoading(false);
      }
    },
    [goReview],
  );

  const handlePasteSubmit = useCallback(async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      goReview(await adminApi.parseStockImportPaste({ text: pasteText }));
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Could not read pasted text.",
      );
    } finally {
      setLoading(false);
    }
  }, [pasteText, goReview]);

  const rematchItem = useCallback(
    async (tempId: string) => {
      if (!draft) return;
      const item = draft.items.find(i => i.tempId === tempId);
      if (!item?.name.trim()) return;
      try {
        const matches = await adminApi.matchMenuImportItems({
          items: [{ tempId: item.tempId, name: item.name.trim() }],
        });
        const m = matches[0];
        if (!m) return;
        setDraft(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map(i =>
              i.tempId === tempId
                ? {
                    ...i,
                    duplicateStatus: m.duplicateStatus,
                    matchedProductId: m.matchedProductId,
                    matchedProductName: m.matchedProductName,
                    stockQty: m.duplicateStatus === "exists" ? "" : i.stockQty,
                  }
                : i,
            ),
          };
        });
      } catch {
        /* noop */
      }
    },
    [draft],
  );

  const resetToSource = () => {
    setDraft(null);
    setStep("source");
    setError(null);
    setShowStockErrors(false);
    setSuccessMessage(null);
  };

  const handleImport = async () => {
    if (!draft) return;
    const validationError = validateNewItemsForImport(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const result = await adminApi.commitMenuImport({ products: buildCommitPayload(draft) });
      setSuccessMessage(result.message);
      setStep("success");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Import failed.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <ImportWizardShell
      title="Import products"
      backTo="/dashboard/stock"
      backLabel="Stock"
      step={step}
      actions={
        <Link to="/dashboard/stock" className="btn btn-outline-secondary btn-sm" title="Back to stock">
          <i className="ti ti-arrow-left" aria-hidden />
          <span className="d-none d-sm-inline ms-1">Stock</span>
        </Link>
      }
    >
      {step === "source" && (
        <>
          <ImportSourcePicker value={source} onChange={setSource} />
          {(source === "csv" || source === "excel") && (
            <p className="small text-muted mb-2">
              <DownloadCsvTemplate filename="bolobill-stock-template.csv" content={STOCK_TEMPLATE} />
              <span className="mx-2">·</span>
              From Google Sheets: File → Download → CSV
            </p>
          )}
          {source === "photo" && (
            <MenuImportUploadStep
              analyzing={loading}
              error={error}
              onFileSelected={handlePhotoFile}
              onCancel={() => navigate("/dashboard/stock")}
              visionPinRequired={aiVisionPin.pinRequired}
              visionUnlocked={aiVisionPin.unlocked}
              onChoosePhoto={handleChoosePhoto}
              fileInputRef={photoInputRef}
            />
          )}
          {(source === "csv" || source === "excel") && (
            <StockImportFileStep
              source={source}
              loading={loading}
              error={error}
              onFile={handleSpreadsheetFile}
            />
          )}
          {source === "paste" && (
            <StockImportPasteStep
              value={pasteText}
              onChange={setPasteText}
              loading={loading}
              error={error}
              onSubmit={handlePasteSubmit}
            />
          )}
        </>
      )}

      {step === "review" && draft && (
        <>
          {error && <div className="alert alert-danger">{error}</div>}
          <MenuImportPreviewStep
            draft={draft}
            showStockErrors={showStockErrors}
            onDraftChange={setDraft}
            onAddCategory={() => {
              const tempId = crypto.randomUUID();
              setDraft({
                ...draft,
                categories: [
                  ...draft.categories,
                  { tempId, name: "New category", sortOrder: draft.categories.length },
                ],
              });
            }}
            onRemoveCategory={tempId => {
              if (!window.confirm("Remove category and its items?")) return;
              setDraft({
                categories: draft.categories.filter(c => c.tempId !== tempId),
                items: draft.items.filter(i => i.categoryTempId !== tempId),
              });
            }}
            onAddItem={categoryTempId => {
              setDraft({
                ...draft,
                items: [
                  ...draft.items,
                  {
                    tempId: crypto.randomUUID(),
                    categoryTempId,
                    name: "",
                    unit: "pcs",
                    unitPrice: null,
                    lowStockThreshold: null,
                    prefillQuantityOnHand: null,
                    duplicateStatus: "new",
                    matchedProductId: null,
                    matchedProductName: null,
                    stockQty: "",
                  },
                ],
              });
            }}
            onRemoveItem={tempId =>
              setDraft({ ...draft, items: draft.items.filter(i => i.tempId !== tempId) })
            }
            onItemNameBlur={rematchItem}
            onContinue={() => {
              setShowStockErrors(true);
              const v = validateNewItemsForImport(draft);
              if (v) {
                setError(v);
                return;
              }
              setError(null);
              setStep("summary");
            }}
            onReupload={resetToSource}
            onBack={resetToSource}
          />
        </>
      )}

      {step === "summary" && draft && (
        <MenuImportSummaryStep
          draft={draft}
          importing={importing}
          error={error}
          onImport={handleImport}
          onBack={() => {
            setError(null);
            setStep("review");
            setShowStockErrors(true);
          }}
        />
      )}

      {step === "success" && (
        <div className="card border-0 shadow-sm rounded-3 text-center p-5">
          <i className="ti ti-circle-check fs-1 text-success mb-3 d-block" />
          <p className="mb-4">{successMessage}</p>
          <button type="button" className="btn btn-primary me-2" onClick={() => navigate("/dashboard/stock")}>
            View stock
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={resetToSource}>
            Import again
          </button>
        </div>
      )}
      <AiVisionPinModal
        open={aiVisionPin.modalOpen}
        onClose={aiVisionPin.handlePinModalCancel}
        onSubmit={aiVisionPin.handlePinModalSuccess}
      />
    </ImportWizardShell>
  );
}
