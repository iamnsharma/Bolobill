import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../api/admin";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
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

type Step = "upload" | "review" | "summary" | "success";

export default function MenuImport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("upload");
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MenuImportDraft | null>(null);
  const [showStockErrors, setShowStockErrors] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (file: File) => {
    const validationError = validateMenuImportFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setAnalyzing(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const result = await adminApi.analyzeMenuImport(formData);
      setDraft(draftFromAnalyze(result));
      setShowStockErrors(false);
      setStep("review");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Couldn't read this photo — try a clearer picture.";
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  }, []);

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
        /* keep previous flags */
      }
    },
    [draft],
  );

  const handleAddCategory = () => {
    if (!draft) return;
    const tempId = crypto.randomUUID();
    setDraft({
      ...draft,
      categories: [
        ...draft.categories,
        { tempId, name: "New category", sortOrder: draft.categories.length },
      ],
    });
  };

  const handleRemoveCategory = (tempId: string) => {
    if (!draft) return;
    if (!window.confirm("Remove this category and all items in it?")) return;
    setDraft({
      categories: draft.categories.filter(c => c.tempId !== tempId),
      items: draft.items.filter(i => i.categoryTempId !== tempId),
    });
  };

  const handleAddItem = (categoryTempId: string) => {
    if (!draft) return;
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
          duplicateStatus: "new",
          matchedProductId: null,
          matchedProductName: null,
          stockQty: "",
        },
      ],
    });
  };

  const handleRemoveItem = (tempId: string) => {
    if (!draft) return;
    setDraft({ ...draft, items: draft.items.filter(i => i.tempId !== tempId) });
  };

  const handleContinueToSummary = () => {
    if (!draft) return;
    setShowStockErrors(true);
    const validationError = validateNewItemsForImport(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep("summary");
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
      const result = await adminApi.commitMenuImport({
        products: buildCommitPayload(draft),
      });
      setSuccessMessage(result.message);
      setStep("success");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Import failed. Try again.";
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  const resetToUpload = () => {
    setDraft(null);
    setStep("upload");
    setError(null);
    setShowStockErrors(false);
    setSuccessMessage(null);
  };

  const stepSubtitle =
    step === "upload"
      ? "Upload menu → Review items → Add stock → Import"
      : step === "review"
        ? "Review items and enter stock for each new product"
        : step === "summary"
          ? "Confirm and import new items only"
          : "Done";

  return (
    <PageShell className="menu-import-page">
      <PageHeader
        title="Import with AI"
        icon="ti-sparkles"
        subtitle={stepSubtitle}
        actions={
          <Link to="/dashboard/stock" className="btn btn-outline-secondary">
            <i className="ti ti-arrow-left me-1" />
            Stock
          </Link>
        }
      />

      {step === "upload" && (
        <MenuImportUploadStep
          analyzing={analyzing}
          error={error}
          onFileSelected={handleFileSelected}
          onCancel={() => navigate("/dashboard/stock")}
        />
      )}

      {step === "review" && draft && (
        <>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <MenuImportPreviewStep
            draft={draft}
            showStockErrors={showStockErrors}
            onDraftChange={setDraft}
            onAddCategory={handleAddCategory}
            onRemoveCategory={handleRemoveCategory}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemNameBlur={rematchItem}
            onContinue={handleContinueToSummary}
            onReupload={resetToUpload}
            onBack={resetToUpload}
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
        <div className="card border-0 shadow-sm rounded-3">
          <div className="card-body p-4 p-md-5 text-center">
            <div className="text-success mb-3">
              <i className="ti ti-circle-check fs-1" aria-hidden />
            </div>
            <h2 className="h5 fw-bold mb-2">Success</h2>
            <p className="text-muted mb-4">{successMessage ?? "Items added to your inventory."}</p>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button type="button" className="btn btn-primary" onClick={() => navigate("/dashboard/stock")}>
                View stock
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={resetToUpload}>
                Import another menu
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
