import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { adminApi } from "../api/admin";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";
import AppModal from "./AppModal";
import BillCartPanel from "./pos/BillCartPanel";
import type { PosCartLine } from "./pos/CartLineStepper";
import SectionPanel from "./merchant/SectionPanel";
import { exceedsAvailableStock } from "./stock/StockStatusBadge";

export type ReviewInvoiceItem = {
  name: string;
  quantity: string;
  totalPrice: number;
  productId?: string;
  quantityNumeric?: number;
  unitPrice?: number;
  unit?: string;
  stockOnHand?: number;
};

export type ReviewInvoiceData = {
  customerName: string;
  customerPhone?: string;
  paymentMode?: "cash" | "credit";
  items: ReviewInvoiceItem[];
  transcript?: string;
  note?: string;
  durationSec?: number;
  source: "voice" | "manual";
};

const defaultItem: ReviewInvoiceItem = {
  name: "",
  quantity: "1 pcs",
  totalPrice: 0,
  quantityNumeric: 1,
  unit: "pcs",
};

function splitQuantityString(q: string): { numeric: number; unit: string } {
  const s = q.trim();
  const m = s.match(/^([\d.]+)\s*(.*)$/);
  if (m) {
    const n = parseFloat(m[1]);
    const unit = m[2].trim() || "pcs";
    return { numeric: Number.isFinite(n) && n > 0 ? n : 1, unit };
  }
  const n = parseFloat(s);
  return { numeric: Number.isFinite(n) && n > 0 ? n : 1, unit: "pcs" };
}

function normalizeItem(item: ReviewInvoiceItem): ReviewInvoiceItem {
  const parsed = splitQuantityString(item.quantity || "1");
  const qty = item.quantityNumeric ?? parsed.numeric;
  const unit = item.unit ?? parsed.unit;
  let unitPrice = item.unitPrice;
  if (unitPrice == null && qty > 0 && item.totalPrice > 0) {
    unitPrice = Math.round((item.totalPrice / qty) * 100) / 100;
  }
  const qtyStr =
    qty % 1 === 0 ? String(qty) : String(Math.round(qty * 1000) / 1000);
  return {
    ...item,
    quantityNumeric: qty,
    unit,
    unitPrice,
    quantity: `${qtyStr} ${unit}`,
  };
}

function applyQty(item: ReviewInvoiceItem, qty: number): ReviewInvoiceItem {
  const row = normalizeItem(item);
  const safeQty = qty > 0 ? qty : 1;
  const unit = row.unit ?? "pcs";
  const unitPrice = row.unitPrice ?? 0;
  const qtyStr =
    safeQty % 1 === 0 ? String(safeQty) : String(Math.round(safeQty * 1000) / 1000);
  const totalPrice =
    unitPrice > 0
      ? Math.round(unitPrice * safeQty * 100) / 100
      : row.totalPrice;
  return {
    ...row,
    quantityNumeric: safeQty,
    quantity: `${qtyStr} ${unit}`,
    totalPrice,
  };
}

function toPosLine(item: ReviewInvoiceItem): PosCartLine {
  const row = normalizeItem(item);
  return {
    name: row.name,
    productId: row.productId,
    quantityNumeric: row.quantityNumeric,
    unit: row.unit,
    totalPrice: String(row.totalPrice),
    quantityOnHand: row.stockOnHand,
  };
}

export default function ReviewInvoiceModal({
  open,
  initialData,
  onClose,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  initialData: ReviewInvoiceData | null;
  onClose: () => void;
  onConfirm: (data: ReviewInvoiceData) => void;
  loading?: boolean;
}) {
  const { formatMoney } = useFinancePrivacy();
  const { t } = useTranslation();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<ReviewInvoiceItem[]>([]);
  const [transcript, setTranscript] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!initialData) return;
    setCustomerName(initialData.customerName);
    setCustomerPhone(initialData.customerPhone ?? "");
    setItems(
      initialData.items.length
        ? initialData.items.map((i) => normalizeItem(i))
        : [{ ...defaultItem }],
    );
    setTranscript(initialData.transcript ?? "");
    setNote(initialData.note ?? "");
  }, [initialData]);

  const isVoice = initialData?.source === "voice";

  const posLines = items.map(toPosLine);
  const total = items.reduce((sum, i) => sum + (Number(i.totalPrice) || 0), 0);
  const validItems = items.filter((i) => (i.name ?? "").trim());
  const hasStockConflict = items.some((item) => {
    if (!item.productId) return false;
    const row = normalizeItem(item);
    return exceedsAvailableStock(row.quantityNumeric ?? 1, row.stockOnHand);
  });
  const isCredit = initialData?.paymentMode === "credit";
  const creditPhoneDigits = customerPhone.replace(/\D/g, "");
  const creditPhoneValid = creditPhoneDigits.length >= 10;
  const canSubmit =
    customerName.trim() &&
    validItems.length > 0 &&
    !hasStockConflict &&
    (!isCredit || creditPhoneValid);

  const setItemAt = useCallback((index: number, next: ReviewInvoiceItem) => {
    setItems((prev) => prev.map((row, i) => (i === index ? next : row)));
  }, []);

  const decrement = (index: number) => {
    const row = items[index];
    if (!row) return;
    const qty = row.quantityNumeric ?? 1;
    if (qty <= 1) return;
    setItemAt(index, applyQty(row, qty - 1));
  };

  const increment = (index: number) => {
    const row = items[index];
    if (!row) return;
    const normalized = normalizeItem(row);
    const qty = normalized.quantityNumeric ?? 1;
    const onHand = normalized.stockOnHand;
    if (onHand != null && qty + 1 > onHand) return;
    setItemAt(index, applyQty(row, qty + 1));
  };

  const remove = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => setItems((p) => [...p, { ...defaultItem }]);

  const handleNameChange = (index: number, name: string) => {
    const row = items[index];
    if (!row) return;
    setItemAt(index, { ...row, name });
  };

  const handleTotalChange = (index: number, totalPrice: number) => {
    const row = normalizeItem(items[index]);
    if (!row) return;
    const qty = row.quantityNumeric ?? 1;
    setItemAt(index, {
      ...row,
      totalPrice,
      unitPrice: qty > 0 ? Math.round((totalPrice / qty) * 100) / 100 : row.unitPrice,
    });
  };

  const getStockOnHand = (line: PosCartLine) => line.quantityOnHand;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData || !canSubmit) return;
    const payload: ReviewInvoiceData = {
      ...initialData,
      customerName: customerName.trim(),
      items: validItems.map((i) => {
        const row = normalizeItem(i);
        return {
          name: row.name.trim(),
          quantity: row.quantity,
          totalPrice: Number(row.totalPrice) || 0,
          productId: row.productId,
          quantityNumeric: row.quantityNumeric,
          unitPrice: row.unitPrice,
          unit: row.unit,
        };
      }),
      transcript: initialData.source === "voice" ? transcript : undefined,
      note: initialData.source === "manual" ? note : undefined,
      customerPhone: isCredit ? customerPhone.trim() : undefined,
    };
    onConfirm(payload);
  };

  const lookupPhoneContact = async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10) return;
    try {
      const res = await adminApi.lookupAddressBookContact(raw);
      if (res.found && res.contact?.name) {
        setCustomerName((prev) => (prev.trim() ? prev : res.contact!.name));
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <AppModal
      show={open}
      title="Review bill before creating"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Back
          </button>
          <button
            type="submit"
            form="review-invoice-form"
            className="btn btn-primary"
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creating…
              </>
            ) : (
              <>
                <i className="ti ti-check me-1" />
                Create bill
              </>
            )}
          </button>
        </>
      }
    >
      <form id="review-invoice-form" onSubmit={handleSubmit}>
        <p className="small text-muted mb-3">
          Same cart as Create Bill—adjust quantities here. This is what goes on the PDF.
        </p>

        {isCredit && (
          <div className="alert alert-info py-2 small mb-3 d-flex align-items-center gap-2">
            <i className="ti ti-credit-card" aria-hidden />
            <span>On credit — customer phone required for khata</span>
          </div>
        )}

        <div className="row g-2 mb-3">
          <div className={isCredit ? "col-md-4" : "col-md-6"}>
            <label className="form-label fw-semibold small mb-1">
              Customer name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer name"
            />
          </div>
          {isCredit && (
            <div className="col-md-4">
              <label className="form-label fw-semibold small mb-1">
                {t("pages.createBill.customerPhone")} <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                className={`form-control${customerPhone && !creditPhoneValid ? " is-invalid" : ""}`}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onBlur={() => lookupPhoneContact(customerPhone)}
                placeholder={t("pages.createBill.phonePlaceholder")}
              />
            </div>
          )}
          {initialData?.source === "manual" && (
            <div className={isCredit ? "col-md-4" : "col-md-6"}>
              <label className="form-label small mb-1">Note (optional)</label>
              <input
                type="text"
                className="form-control"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note on bill"
              />
            </div>
          )}
        </div>

        <SectionPanel title="Cart" icon="ti-shopping-cart" flush bodyClassName="p-0">
          <div className="p-3">
            <BillCartPanel
              lines={posLines}
              formatMoney={formatMoney}
              getStockOnHand={getStockOnHand}
              onDecrement={decrement}
              onIncrement={increment}
              onRemove={remove}
              total={total}
              onReview={() => undefined}
              showActions={false}
              compact
              editableName={isVoice}
              onNameChange={isVoice ? handleNameChange : undefined}
              editableLineTotal={isVoice}
              onLineTotalChange={isVoice ? handleTotalChange : undefined}
            />
          </div>
        </SectionPanel>

        {hasStockConflict ? (
          <div className="alert alert-danger py-2 small mt-3 mb-0" role="alert">
            One or more items exceed available stock. Lower quantities before creating the bill.
          </div>
        ) : null}

        {isVoice && (
          <div className="mt-3 d-flex flex-wrap gap-2 align-items-center">
            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addRow}>
              <i className="ti ti-plus me-1" />
              Add item
            </button>
          </div>
        )}

      </form>
    </AppModal>
  );
}
