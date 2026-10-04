import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { adminApi, type StockCategory, type StockProduct } from "../api/admin";
import {
  VoiceRecorder,
  type RecordingResult,
  MicIconButton,
} from "../components/VoiceRecorder";
import ReviewInvoiceModal, {
  type ReviewInvoiceData,
} from "../components/ReviewInvoiceModal";
import ShareBillWhatsAppModal from "../components/ShareBillWhatsAppModal";
import type { AdminInvoice } from "../api/admin";
import AppModal from "../components/AppModal";
import ExpandableSearch from "../components/ExpandableSearch";
import CategoryChipBar from "../components/pos/CategoryChipBar";
import ProductCatalogList from "../components/pos/ProductCatalogList";
import BillCartPanel from "../components/pos/BillCartPanel";
import MobileCartBar from "../components/pos/MobileCartBar";
import type { PosCartLine } from "../components/pos/CartLineStepper";
import { exceedsAvailableStock } from "../components/stock/StockStatusBadge";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import { VOICE_MIC_FEATURE_ENABLED } from "../utils/voiceComingSoon";

type LineItem = {
  name: string;
  quantity: string;
  totalPrice: string;
  productId?: string;
  quantityNumeric?: number;
  unitPrice?: number;
  unit?: string;
  /** Snapshot of stock when line was added (live value from picker when shown) */
  quantityOnHand?: number;
  /** Raw qty while user is typing (avoids "12" when changing 1 → 2) */
  qtyInput?: string;
};

const applyQtyToLine = (row: LineItem, qty: number): LineItem => {
  const unit = row.unit ?? "pcs";
  const unitPrice = row.unitPrice ?? 0;
  const safeQty = qty > 0 ? qty : 1;
  const qtyStr =
    safeQty % 1 === 0 ? String(safeQty) : String(Math.round(safeQty * 1000) / 1000);
  return {
    ...row,
    qtyInput: qtyStr,
    quantityNumeric: safeQty,
    quantity: `${qtyStr} ${unit}`,
    totalPrice: String(Math.round(unitPrice * safeQty * 100) / 100),
  };
};

const commitLineQtyInput = (row: LineItem): LineItem => {
  const raw = (row.qtyInput ?? String(row.quantityNumeric ?? "")).trim();
  if (raw === "" || raw === ".") {
    return applyQtyToLine(row, 1);
  }
  const parsed = parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return applyQtyToLine(row, 1);
  }
  return applyQtyToLine(row, parsed);
};


export default function CreateInvoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatMoney } = useFinancePrivacy();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState<RecordingResult | null>(
    null,
  );
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewInvoiceData | null>(null);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [createdInvoiceForShare, setCreatedInvoiceForShare] = useState<AdminInvoice | null>(
    null,
  );

  const [stockSearch, setStockSearch] = useState("");
  const [stockCategoryId, setStockCategoryId] = useState("");
  const [stockCategories, setStockCategories] = useState<StockCategory[]>([]);
  const [stockProducts, setStockProducts] = useState<StockProduct[]>([]);
  const [stockPickerLoading, setStockPickerLoading] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const stockPickerLoaded = useRef(false);

  const loadStockPicker = useCallback(async (background = false) => {
    if (!background || !stockPickerLoaded.current) {
      setStockPickerLoading(true);
    }
    try {
      const [cats, prodRes] = await Promise.all([
        adminApi.listStockCategories(),
        adminApi.listStockProducts({
          q: stockSearch.trim() || undefined,
          categoryId: stockCategoryId || undefined,
          limit: 80,
        }),
      ]);
      setStockCategories(cats);
      setStockProducts(prodRes.products);
      stockPickerLoaded.current = true;
    } catch {
      setStockProducts([]);
    } finally {
      setStockPickerLoading(false);
    }
  }, [stockSearch, stockCategoryId]);

  useEffect(() => {
    const t = window.setTimeout(
      () => loadStockPicker(stockPickerLoaded.current),
      stockSearch ? 300 : 0,
    );
    return () => window.clearTimeout(t);
  }, [loadStockPicker, stockSearch, stockCategoryId]);

  const addProductToBill = (product: StockProduct, qty = 1) => {
    const q = qty > 0 ? qty : 1;
    const inCart = lines.find((l) => l.productId === product._id);
    const currentQty = inCart?.quantityNumeric ?? 0;
    const nextQty = currentQty + q;
    const onHand = product.quantityOnHand;

    if (onHand <= 0 && currentQty === 0) {
      setError(`"${product.name}" is out of stock.`);
      return;
    }
    if (nextQty > onHand) {
      setError(
        `Only ${onHand} ${product.unit} of "${product.name}" in stock.`,
      );
      return;
    }

    setLines((prev) => {
      const idx = prev.findIndex((l) => l.productId === product._id);
      if (idx >= 0) {
        const row = prev[idx];
        const nextQty = (row.quantityNumeric ?? 1) + q;
        const unitPrice = row.unitPrice ?? product.unitPrice;
        const next = [...prev];
        next[idx] = applyQtyToLine(
          { ...row, unitPrice, unit: product.unit },
          nextQty,
        );
        return next;
      }
      return [
        ...prev,
        applyQtyToLine(
          {
            name: product.name,
            totalPrice: "0",
            productId: product._id,
            unitPrice: product.unitPrice,
            unit: product.unit,
            quantityOnHand: product.quantityOnHand,
            quantity: "",
          },
          q,
        ),
      ];
    });
    setError(null);
    setRecentlyAddedId(product._id);
    window.setTimeout(() => setRecentlyAddedId(null), 1200);
  };

  const incrementLine = (index: number) => {
    setLines((prev) => {
      const row = prev[index];
      if (!row) return prev;
      const onHand = stockOnHandForLine(row);
      const nextQty = (row.quantityNumeric ?? 1) + 1;
      if (onHand != null && nextQty > onHand) {
        setError(
          `Only ${onHand} ${row.unit ?? "pcs"} of "${row.name}" in stock.`,
        );
        return prev;
      }
      const next = [...prev];
      next[index] = applyQtyToLine(row, nextQty);
      return next;
    });
  };

  const decrementLine = (index: number) => {
    setLines((prev) => {
      const row = prev[index];
      if (!row) return prev;
      const current = row.quantityNumeric ?? 1;
      if (current <= 1) {
        return prev.filter((_, i) => i !== index);
      }
      const next = [...prev];
      next[index] = applyQtyToLine(row, current - 1);
      return next;
    });
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const linesWithCommittedQty = (items: LineItem[]) =>
    items.map((row) => commitLineQtyInput(row));

  const total = lines.reduce(
    (sum, l) => sum + (parseFloat(l.totalPrice) || 0),
    0,
  );

  const cartQtyByProductId = lines.reduce<Record<string, number>>((acc, l) => {
    if (l.productId) {
      acc[l.productId] = l.quantityNumeric ?? 1;
    }
    return acc;
  }, {});

  const getStockOnHandForCartLine = (line: PosCartLine, index: number) =>
    stockOnHandForLine(lines[index] ?? line);

  const handleVoiceRecorded = (result: RecordingResult) => {
    setVoiceRecording(result);
    setVoiceError(null);
  };

  const handleReviewFromVoice = async () => {
    if (!voiceRecording || !customerName.trim()) return;
    setVoiceLoading(true);
    setVoiceError(null);
    try {
      const formData = new FormData();
      const ext = voiceRecording.mimeType.includes("webm") ? "webm" : "m4a";
      const file = new File([voiceRecording.blob], `voice.${ext}`, {
        type: voiceRecording.mimeType,
      });
      formData.append("audio", file);
      formData.append("language", "en");
      const result = await adminApi.previewVoiceInvoice(formData);
      setReviewData({
        customerName: customerName.trim(),
        items: result.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          totalPrice: i.totalPrice,
        })),
        transcript: result.transcript,
        durationSec: voiceRecording.durationSec,
        source: "voice",
      });
      setReviewOpen(true);
    } catch (err: unknown) {
      setVoiceError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to parse recording. Try again or speak clearly.",
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  const stockOnHandForLine = (line: LineItem) => {
    if (!line.productId) return undefined;
    const live = stockProducts.find((p) => p._id === line.productId);
    return live?.quantityOnHand ?? line.quantityOnHand;
  };

  const lineExceedsStock = (line: LineItem) => {
    if (!line.productId) return false;
    const qty = line.quantityNumeric ?? 1;
    return exceedsAvailableStock(qty, stockOnHandForLine(line));
  };

  const hasStockConflict = linesWithCommittedQty(lines).some(lineExceedsStock);

  const openManualReview = () => {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    const stockLines = linesWithCommittedQty(lines).filter(
      (l) => l.productId && l.name.trim(),
    );
    if (stockLines.length === 0) {
      setError("Add at least one product from your stock below.");
      return;
    }
    if (stockLines.some(lineExceedsStock)) {
      setError("Fix out-of-stock items in the cart before creating the bill.");
      return;
    }
    setError(null);
    setReviewData({
      customerName: customerName.trim(),
      items: stockLines.map((l) => ({
        name: l.name.trim(),
        quantity: l.quantity.trim() || "1",
        totalPrice: parseFloat(l.totalPrice) || 0,
        productId: l.productId,
        quantityNumeric: l.quantityNumeric ?? 1,
        unitPrice: l.unitPrice,
        unit: l.unit,
        stockOnHand: stockOnHandForLine(l),
      })),
      note: note.trim() || undefined,
      source: "manual",
    });
    setReviewOpen(true);
  };

  const handleReviewConfirm = async (data: ReviewInvoiceData) => {
    setReviewSubmitLoading(true);
    setError(null);
    setVoiceError(null);
    try {
      let invoice: AdminInvoice;
      if (data.source === "voice") {
        invoice = await adminApi.createFromVoicePreview({
          customerName: data.customerName,
          items: data.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
            productId: i.productId,
            quantityNumeric: i.quantityNumeric,
          })),
          transcript: data.transcript,
          durationSec: data.durationSec,
        });
      } else {
        invoice = await adminApi.createInvoice({
          customerName: data.customerName,
          items: data.items.map((i) => ({
            name: i.name,
            quantity: String(i.quantity),
            totalPrice: i.totalPrice,
            productId: i.productId,
            quantityNumeric: i.quantityNumeric,
          })),
          note: data.note,
        });
      }
      setReviewOpen(false);
      setReviewData(null);
      resetForm();
      setCreatedInvoiceForShare(invoice);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create bill",
      );
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setCustomerName("");
    setNote("");
    setLines([]);
    setVoiceRecording(null);
    setError(null);
    setVoiceError(null);
  };

  const canRecord = customerName.trim().length > 0;
  const needsCustomerName = lines.length > 0 && !customerName.trim();
  const reviewBlockedByStock = hasStockConflict && lines.length > 0;
  const reviewDisabledReason = needsCustomerName
    ? "Enter customer name above to enable Review & create bill."
    : reviewBlockedByStock
      ? "Some items exceed stock on hand. Reduce quantities or remove them to continue."
      : undefined;

  return (
    <PageShell className="pos-create-bill-page">
      <PageHeader
        title={t("pages.createBill.title")}
        icon="ti-receipt-2"
        subtitle={t("pages.createBill.subtitle")}
        actions={
          VOICE_MIC_FEATURE_ENABLED ? (
            <MicIconButton
              active={showVoiceModal}
              onClick={() => setShowVoiceModal(true)}
              title="Speak bill"
            />
          ) : undefined
        }
      />

      {hasStockConflict && lines.length > 0 && !error && !voiceError && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="ti ti-alert-circle" />
          {t("pages.createBill.stockConflict")}
        </div>
      )}

      {(error || voiceError) && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2 mb-4"
          role="alert">
          <i className="ti ti-alert-circle" />
          {voiceError || error}
        </div>
      )}

      <SectionPanel
        title={t("pages.createBill.billDetails")}
        icon="ti-shopping-cart"
        className="pos-create-bill-manual pos-create-bill-panel"
      >
            <div className="row g-2 mb-3 pos-create-bill-customer-row">
              <div className="col-md-6">
                <label className="form-label fw-semibold small mb-1">
                  {t("pages.createBill.customerName")} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control${needsCustomerName ? " is-invalid" : ""}`}
                  placeholder={t("pages.createBill.customerPlaceholder")}
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setError(null);
                  }}
                  aria-invalid={needsCustomerName}
                />
                {needsCustomerName ? (
                  <div className="invalid-feedback d-block">{t("pages.createBill.customerRequired")}</div>
                ) : null}
              </div>
              <div className="col-md-6">
                <label className="form-label small mb-1">{t("pages.createBill.noteOptional")}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={t("pages.createBill.notePlaceholder")}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="pos-create-bill-split">
              <div className="pos-create-bill-split__left">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-3 flex-wrap pos-create-bill-picker-tools">
                  <CategoryChipBar
                    categories={stockCategories}
                    value={stockCategoryId}
                    onChange={setStockCategoryId}
                    className="flex-grow-1 mb-0"
                  />
                  <ExpandableSearch
                    value={stockSearch}
                    onChange={setStockSearch}
                    placeholder={t("pages.createBill.searchItems")}
                  />
                </div>
                <div className="pos-create-bill-catalog-scroll">
                  <ProductCatalogList
                    products={stockProducts}
                    loading={stockPickerLoading && stockProducts.length === 0}
                    subtleLoading={stockPickerLoading && stockProducts.length > 0}
                    formatMoney={formatMoney}
                    cartQtyByProductId={cartQtyByProductId}
                    recentlyAddedId={recentlyAddedId}
                    onAdd={(p) => addProductToBill(p, 1)}
                    emptyAction={
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate("/dashboard/stock")}
                      >
                        {t("pages.stock.addInStock")}
                      </button>
                    }
                  />
                </div>
              </div>

              <div className="pos-create-bill-split__right d-none d-lg-flex">
                <div className="card bg-light border-0 h-100 w-100">
                  <div className="card-body">
                    <BillCartPanel
                      lines={lines}
                      formatMoney={formatMoney}
                      getStockOnHand={getStockOnHandForCartLine}
                      onDecrement={decrementLine}
                      onIncrement={incrementLine}
                      onRemove={removeLine}
                      total={total}
                      onCancel={() => navigate("/dashboard/invoices")}
                      onReview={openManualReview}
                      reviewDisabled={!customerName.trim() || hasStockConflict}
                      reviewDisabledReason={reviewDisabledReason}
                    />
                  </div>
                </div>
              </div>
            </div>

          <MobileCartBar
            lines={lines}
            total={total}
            formatMoney={formatMoney}
            getStockOnHand={getStockOnHandForCartLine}
            onDecrement={decrementLine}
            onIncrement={incrementLine}
            onRemove={removeLine}
            onReview={openManualReview}
            onCancel={() => navigate("/dashboard/invoices")}
            reviewDisabled={!customerName.trim() || hasStockConflict}
            reviewDisabledReason={reviewDisabledReason}
          />
      </SectionPanel>

      {VOICE_MIC_FEATURE_ENABLED ? (
      <AppModal
        show={showVoiceModal}
        title="Speak your bill"
        onClose={() => {
          setShowVoiceModal(false);
          setVoiceRecording(null);
        }}
        size="md"
      >
        <div className="mb-3">
          <label className="form-label fw-semibold small">
            Customer name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setVoiceError(null);
            }}
          />
        </div>
        <VoiceRecorder
          onRecorded={handleVoiceRecorded}
          onError={setVoiceError}
          disabled={!canRecord}
        />
        {voiceRecording && (
          <div className="d-flex gap-2 flex-wrap mt-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setShowVoiceModal(false);
                handleReviewFromVoice();
              }}
              disabled={voiceLoading || !customerName.trim()}
            >
              {voiceLoading ? "Parsing…" : "Review bill"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setVoiceRecording(null)}
              disabled={voiceLoading}
            >
              Discard
            </button>
          </div>
        )}
      </AppModal>
      ) : null}

      <ReviewInvoiceModal
        open={reviewOpen}
        initialData={reviewData}
        onClose={() => {
          setReviewOpen(false);
          setReviewData(null);
        }}
        onConfirm={handleReviewConfirm}
        loading={reviewSubmitLoading}
      />

      <ShareBillWhatsAppModal
        invoice={createdInvoiceForShare}
        onClose={() => setCreatedInvoiceForShare(null)}
      />
    </PageShell>
  );
}
