import { useCallback, useEffect, useRef, useState } from "react";
import {
  adminApi,
  type StockCategory,
  type StockProduct,
} from "../api/admin";
import { VoiceRecorder, type RecordingResult } from "../components/VoiceRecorder";
import { notifyVoiceComingSoon } from "../utils/voiceComingSoon";
import CategoryChipBar from "../components/pos/CategoryChipBar";
import StockStatusBadge, { productStockBadge } from "../components/stock/StockStatusBadge";
import UnitPicker from "../components/stock/UnitPicker";
import BulkStockForm, { type BulkStockRow } from "../components/stock/BulkStockForm";
import AppModal from "../components/AppModal";
import ConfirmModal from "../components/ConfirmModal";
import ExpandableSearch from "../components/ExpandableSearch";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import MetricTile from "../components/merchant/MetricTile";
import { useFinancePrivacy } from "../contexts/FinancePrivacyContext";

type AddStockMode = "voice" | "single" | "bulk";
const NEW_CATEGORY_VALUE = "__new__";

function categoryName(product: StockProduct): string {
  const c = product.categoryId;
  if (c && typeof c === "object" && "name" in c) return c.name;
  return "—";
}

function mergeStockProductUpdate(prev: StockProduct, updated: StockProduct): StockProduct {
  const hasCategoryName =
    updated.categoryId &&
    typeof updated.categoryId === "object" &&
    "name" in updated.categoryId;
  return {
    ...prev,
    ...updated,
    categoryId: hasCategoryName ? updated.categoryId : prev.categoryId,
  };
}

export default function Stock() {
  const { formatMoney, formatFinance } = useFinancePrivacy();
  const [summary, setSummary] = useState<{
    totalProducts: number;
    totalCategories: number;
    inventoryValue: number;
    lowStockCount: number;
  } | null>(null);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const hasLoadedOnce = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formCategoryName, setFormCategoryName] = useState("");
  const [formCategorySelect, setFormCategorySelect] = useState("");
  const [formName, setFormName] = useState("");
  const [formUnit, setFormUnit] = useState("pcs");
  const [formUnitPrice, setFormUnitPrice] = useState("");
  const [formQty, setFormQty] = useState("");
  const [formLowStock, setFormLowStock] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [showAddStockPanel, setShowAddStockPanel] = useState(false);
  const [addStockMode, setAddStockMode] = useState<AddStockMode>("single");
  const [voiceRecording, setVoiceRecording] = useState<RecordingResult | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<StockCategory | null>(null);
  const [deleteCategoryLoading, setDeleteCategoryLoading] = useState(false);

  const loadAll = useCallback(
    async (options?: { background?: boolean }) => {
      const background = options?.background === true && hasLoadedOnce.current;
      if (background) {
        setListRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const [sum, cats, prodRes] = await Promise.all([
          adminApi.getStockSummary(),
          adminApi.listStockCategories(),
          adminApi.listStockProducts({
            q: searchQ.trim() || undefined,
            categoryId: selectedCategoryId || undefined,
            limit: 100,
          }),
        ]);
        setSummary(sum);
        setCategories(cats);
        setProducts(prodRes.products);
        hasLoadedOnce.current = true;
      } catch (e: unknown) {
        setError(
          (e as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Failed to load stock",
        );
      } finally {
        setLoading(false);
        setListRefreshing(false);
      }
    },
    [searchQ, selectedCategoryId],
  );

  useEffect(() => {
    const t = window.setTimeout(
      () => {
        loadAll({ background: hasLoadedOnce.current });
      },
      searchQ ? 300 : 0,
    );
    return () => window.clearTimeout(t);
  }, [loadAll, searchQ, selectedCategoryId]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await adminApi.createStockCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
      loadAll();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create category",
      );
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeleteCategoryLoading(true);
    setError(null);
    try {
      await adminApi.deleteStockCategory(categoryToDelete._id);
      if (selectedCategoryId === categoryToDelete._id) {
        setSelectedCategoryId("");
      }
      setCategoryToDelete(null);
      loadAll();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete category",
      );
    } finally {
      setDeleteCategoryLoading(false);
    }
  };

  const resetProductFormFields = () => {
    setEditingProductId(null);
    setShowProductForm(false);
    setFormCategoryName("");
    setFormCategorySelect(categories[0]?._id ?? NEW_CATEGORY_VALUE);
    setFormName("");
    setFormUnit("pcs");
    setFormUnitPrice("");
    setFormQty("");
    setFormLowStock("");
  };

  const closeAddStockPanel = () => {
    resetProductFormFields();
    setShowAddStockPanel(false);
    setVoiceRecording(null);
    setAddStockMode("single");
  };

  const openEditProduct = (p: StockProduct) => {
    setEditingProductId(p._id);
    setFormName(p.name);
    setFormUnit(p.unit);
    setFormUnitPrice(String(p.unitPrice));
    setFormQty(String(p.quantityOnHand));
    setFormLowStock(p.lowStockThreshold != null ? String(p.lowStockThreshold) : "");
    const catName = categoryName(p);
    setFormCategoryName(catName);
    const cat = categories.find((c) => c.name === catName);
    setFormCategorySelect(cat?._id ?? NEW_CATEGORY_VALUE);
    setShowProductForm(true);
    setShowAddStockPanel(true);
    setAddStockMode("single");
  };

  const selectFormCategoryById = (categoryId: string) => {
    if (categoryId === NEW_CATEGORY_VALUE) {
      setFormCategorySelect(NEW_CATEGORY_VALUE);
      return;
    }
    setFormCategorySelect(categoryId);
    const cat = categories.find((c) => c._id === categoryId);
    if (cat) setFormCategoryName(cat.name);
  };

  const openAddStockPanel = (mode: AddStockMode = "single") => {
    resetProductFormFields();
    setShowAddStockPanel(true);
    setAddStockMode(mode);
    if (mode === "single") {
      setShowProductForm(true);
      setFormCategorySelect(categories[0]?._id ?? NEW_CATEGORY_VALUE);
      if (categories[0]) setFormCategoryName(categories[0].name);
    } else {
      setShowProductForm(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryName.trim()) return;
    const unitPrice = parseFloat(formUnitPrice);
    const quantityOnHand = parseFloat(formQty);
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      setError("Enter a valid unit price");
      return;
    }
    if (Number.isNaN(quantityOnHand) || quantityOnHand < 0) {
      setError("Enter a valid quantity");
      return;
    }
    setSubmitLoading(true);
    setError(null);
    try {
      const low = formLowStock.trim() ? parseFloat(formLowStock) : undefined;
      if (editingProductId) {
        await adminApi.updateStockProduct(editingProductId, {
          categoryName: formCategoryName.trim(),
          name: formName.trim(),
          unit: formUnit.trim() || "pcs",
          unitPrice,
          quantityOnHand,
          lowStockThreshold: low ?? null,
        });
      } else {
        await adminApi.createStockProduct({
          categoryName: formCategoryName.trim(),
          name: formName.trim(),
          unit: formUnit.trim() || "pcs",
          unitPrice,
          quantityOnHand,
          lowStockThreshold: low,
        });
      }
      resetProductFormFields();
      setShowAddStockPanel(false);
      loadAll();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save product",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAdjust = async (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? { ...p, quantityOnHand: Math.max(0, p.quantityOnHand + delta) }
          : p,
      ),
    );
    try {
      const updated = await adminApi.adjustStockProduct({ productId, delta });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? mergeStockProductUpdate(p, updated) : p)),
      );
      adminApi.getStockSummary().then(setSummary).catch(() => undefined);
    } catch (err: unknown) {
      loadAll({ background: true });
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to adjust quantity",
      );
    }
  };

  const handleVoiceIntake = async () => {
    if (!voiceRecording) return;
    setVoiceLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      const ext = voiceRecording.mimeType.includes("webm") ? "webm" : "m4a";
      const file = new File([voiceRecording.blob], `voice.${ext}`, {
        type: voiceRecording.mimeType,
      });
      formData.append("audio", file);
      formData.append("language", "en");
      await adminApi.intakeStockFromVoice(formData);
      setVoiceRecording(null);
      closeAddStockPanel();
      loadAll();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to add stock from recording.",
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleBulkSubmit = async (rows: BulkStockRow[], sharedCategoryName: string) => {
    if (!sharedCategoryName.trim()) {
      setError("Category is required for bulk entry");
      return;
    }
    const products = rows
      .filter((r) => r.name.trim())
      .map((r) => {
        const unitPrice = parseFloat(r.unitPrice);
        const quantityOnHand = parseFloat(r.quantityOnHand);
        if (Number.isNaN(unitPrice) || unitPrice < 0) return null;
        if (Number.isNaN(quantityOnHand) || quantityOnHand < 0) return null;
        const low = r.lowStockThreshold.trim() ? parseFloat(r.lowStockThreshold) : undefined;
        return {
          categoryName: sharedCategoryName.trim(),
          name: r.name.trim(),
          unit: r.unit.trim() || "pcs",
          unitPrice,
          quantityOnHand,
          ...(low != null && !Number.isNaN(low) ? { lowStockThreshold: low } : {}),
        };
      })
      .filter(Boolean) as {
      categoryName: string;
      name: string;
      unit: string;
      unitPrice: number;
      quantityOnHand: number;
      lowStockThreshold?: number;
    }[];

    if (products.length === 0) {
      setError("Add at least one product row with name, price, and in stock");
      return;
    }
    if (products.length > 50) {
      setError("Maximum 50 products per bulk save");
      return;
    }

    setBulkLoading(true);
    setError(null);
    try {
      await adminApi.bulkCreateStockProducts({ products });
      closeAddStockPanel();
      loadAll();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save bulk products",
      );
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <PageShell className="stock-page">
      <PageHeader
        title="Stock"
        icon="ti-box"
        subtitle="Categories, prices, and counts. Sales from Create Bill update stock automatically."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => openAddStockPanel("single")}>
            <i className="ti ti-plus me-1" />
            Add stock
          </button>
        }
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <MetricTile
              label="Products"
              value={summary.totalProducts}
              icon="ti-package"
              tone="primary"
            />
          </div>
          <div className="col-md-3 col-6">
            <MetricTile
              label="Categories"
              value={summary.totalCategories}
              icon="ti-category"
              tone="success"
            />
          </div>
          <div className="col-md-3 col-6">
            <MetricTile
              label="Inventory value"
              value={formatFinance(summary.inventoryValue)}
              icon="ti-cash"
              tone="info"
            />
          </div>
          <div className="col-md-3 col-6">
            <MetricTile
              label="Need restock"
              value={summary.lowStockCount}
              hint="Below alert level"
              icon="ti-alert-triangle"
              tone="warning"
            />
          </div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-3 d-none d-lg-block">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-3">
              <h2 className="h6 fw-bold mb-3">Categories</h2>
              <button
                type="button"
                className={`btn btn-sm w-100 mb-2 text-start ${selectedCategoryId === "" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setSelectedCategoryId("")}
              >
                All products
              </button>
              {categories.map((c) => (
                <div key={c._id} className="d-flex gap-1 mb-2">
                  <button
                    type="button"
                    className={`btn btn-sm flex-grow-1 text-start ${selectedCategoryId === c._id ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setSelectedCategoryId(c._id)}
                  >
                    {c.name}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger category-row-delete"
                    onClick={() => setCategoryToDelete(c)}
                    aria-label={`Delete category ${c.name}`}
                    title="Delete category"
                  >
                    <i className="ti ti-trash" />
                  </button>
                </div>
              ))}
              <form onSubmit={handleAddCategory} className="mt-3 pt-3 border-top">
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  placeholder="New category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button type="submit" className="btn btn-sm btn-outline-primary w-100">
                  Add category
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 pb-0">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <h2 className="h6 fw-bold mb-0 me-auto">Your stock</h2>
                <ExpandableSearch
                  value={searchQ}
                  onChange={setSearchQ}
                  placeholder="Search products…"
                />
              </div>
              <CategoryChipBar
                categories={categories}
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                className="d-lg-none mb-3"
              />
            </div>
            <div className="card-body p-0 pt-0">
              {loading ? (
                <div className="p-4 text-center text-muted">Loading…</div>
              ) : products.length === 0 ? (
                <div className="p-4 text-muted">
                  No products yet. Tap <strong>Add stock</strong> to add your first items.
                </div>
              ) : (
                <div
                  className={`table-responsive merchant-data-table stock-table-wrap${listRefreshing ? " is-refreshing" : ""}`}
                >
                  <table className="table table-hover mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Category</th>
                        <th scope="col" className="merchant-data-table__num">Price</th>
                        <th scope="col" className="merchant-data-table__num">In stock</th>
                        <th scope="col">Unit</th>
                        <th scope="col" className="merchant-data-table__num">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const badge = productStockBadge(p);
                        return (
                          <tr key={p._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-medium">{p.name}</span>
                                {badge && <StockStatusBadge kind={badge} />}
                              </div>
                            </td>
                            <td className="text-muted">{categoryName(p)}</td>
                            <td className="merchant-data-table__num">{formatMoney(p.unitPrice)}</td>
                            <td className="merchant-data-table__num fw-semibold font-monospace">
                              {p.quantityOnHand}
                            </td>
                            <td>{p.unit}</td>
                            <td className="merchant-data-table__num text-nowrap">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary me-1"
                                onClick={() => handleAdjust(p._id, -1)}
                                title="Decrease by 1"
                              >
                                −
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary me-1"
                                onClick={() => handleAdjust(p._id, 1)}
                                title="Increase by 1"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditProduct(p)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AppModal
        show={showAddStockPanel}
        title={editingProductId ? "Edit product" : "Add stock"}
        onClose={closeAddStockPanel}
        size="xl"
      >
        <div className="d-flex flex-wrap gap-2 mb-3 stock-add-modal-tabs">
          <button
            type="button"
            className={`btn btn-sm btn-icon-only rounded-circle ${addStockMode === "voice" ? "btn-dark" : "btn-outline-secondary"}`}
            onClick={() => notifyVoiceComingSoon(setError)}
            title="Speak to add"
            aria-label="Speak to add"
          >
            <i className="ti ti-microphone" />
          </button>
          <button
            type="button"
            className={`btn btn-sm ${addStockMode === "single" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => {
              setAddStockMode("single");
              setShowProductForm(true);
            }}
          >
            One product
          </button>
          <button
            type="button"
            className={`btn btn-sm ${addStockMode === "bulk" ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => {
              setAddStockMode("bulk");
              setShowProductForm(false);
            }}
          >
            <i className="ti ti-table me-1" />
            Bulk
          </button>
        </div>

        {addStockMode === "voice" && (
          <>
            <VoiceRecorder
              onRecorded={(r) => {
                setVoiceRecording(r);
                setError(null);
              }}
              onError={setError}
            />
            {voiceRecording && (
              <button
                type="button"
                className="btn btn-primary mt-3"
                disabled={voiceLoading}
                onClick={handleVoiceIntake}
              >
                {voiceLoading ? "Processing…" : "Save to stock"}
              </button>
            )}
          </>
        )}

        {addStockMode === "bulk" && (
          <BulkStockForm
            categories={categories}
            defaultCategoryName={categories[0]?.name ?? formCategoryName}
            loading={bulkLoading}
            onSubmit={handleBulkSubmit}
            onCancel={closeAddStockPanel}
          />
        )}

        {addStockMode === "single" && showProductForm && (
          <form onSubmit={handleProductSubmit} className="stock-product-form border-0 p-0 bg-transparent">
            <CategoryChipBar
              categories={categories}
              value={formCategorySelect === NEW_CATEGORY_VALUE ? "" : formCategorySelect}
              onChange={(id) => {
                if (id === "") {
                  selectFormCategoryById(NEW_CATEGORY_VALUE);
                } else {
                  selectFormCategoryById(id);
                }
              }}
              className="mb-3"
            />
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Category</label>
                <select
                  className="form-select"
                  value={
                    categories.length === 0 ? NEW_CATEGORY_VALUE : formCategorySelect
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === NEW_CATEGORY_VALUE) {
                      setFormCategorySelect(NEW_CATEGORY_VALUE);
                      setFormCategoryName("");
                    } else {
                      selectFormCategoryById(v);
                    }
                  }}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY_VALUE}>— New category —</option>
                </select>
                {formCategorySelect === NEW_CATEGORY_VALUE && (
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="New category name"
                    value={formCategoryName}
                    onChange={(e) => setFormCategoryName(e.target.value)}
                    required
                  />
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Product name</label>
                <input
                  className="form-control"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <UnitPicker value={formUnit} onChange={setFormUnit} id="stock-form-unit" />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Selling price (₹)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  value={formUnitPrice}
                  onChange={(e) => setFormUnitPrice(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">In stock</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  value={formQty}
                  onChange={(e) => setFormQty(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Alert at stock</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="form-control"
                  value={formLowStock}
                  onChange={(e) => setFormLowStock(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                {submitLoading ? "Saving…" : editingProductId ? "Update" : "Save product"}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={closeAddStockPanel}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </AppModal>

      <ConfirmModal
        show={categoryToDelete != null}
        title="Delete category?"
        message={
          categoryToDelete
            ? `Delete "${categoryToDelete.name}"? This only works if the category has no products. This cannot be undone.`
            : ""
        }
        variant="danger"
        confirmLabel="Delete"
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
        loading={deleteCategoryLoading}
      />
    </PageShell>
  );
}
