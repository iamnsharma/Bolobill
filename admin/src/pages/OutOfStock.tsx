import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { adminApi, type OutOfStockItem } from "../api/admin";
import ImportIconButton from "../components/import/ImportIconButton";
import { VoiceRecorder, type RecordingResult, MicIconButton } from "../components/VoiceRecorder";
import AppModal from "../components/AppModal";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import { exportOutOfStockPdf } from "../utils/exportOutOfStockPdf";

export default function OutOfStock() {
  const { t } = useTranslation();
  const [items, setItems] = useState<OutOfStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formNote, setFormNote] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceRecording, setVoiceRecording] = useState<RecordingResult | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listOutOfStock();
      setItems(res.items ?? []);
    } catch (e: unknown) {
      setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t("pages.outOfStock.loadFail"),
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormQuantity("");
    setFormNote("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: OutOfStockItem) => {
    setEditingId(item._id);
    setFormName(item.name);
    setFormQuantity(item.quantity ?? "");
    setFormNote(item.note ?? "");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitLoading(true);
    try {
      if (editingId) {
        await adminApi.updateOutOfStock(editingId, {
          name: formName.trim(),
          quantity: formQuantity.trim() || undefined,
          note: formNote.trim() || undefined,
        });
      } else {
        await adminApi.createOutOfStock({
          name: formName.trim(),
          quantity: formQuantity.trim() || undefined,
          note: formNote.trim() || undefined,
        });
      }
      resetForm();
      fetchItems();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this item from the list?")) return;
    try {
      await adminApi.deleteOutOfStock(id);
      fetchItems();
      if (editingId === id) resetForm();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete",
      );
    }
  };

  const handleExportPdf = () => {
    exportOutOfStockPdf(items);
  };

  const handleCreateFromVoice = async () => {
    if (!voiceRecording) return;
    setVoiceLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      const ext = voiceRecording.mimeType.includes("webm") ? "webm" : "m4a";
      const file = new File([voiceRecording.blob], `voice.${ext}`, { type: voiceRecording.mimeType });
      formData.append("audio", file);
      formData.append("durationSec", String(voiceRecording.durationSec));
      formData.append("language", "en");
      await adminApi.createOutOfStockFromVoice(formData);
      setVoiceRecording(null);
      setShowVoiceModal(false);
      fetchItems();
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Failed to add items from recording.",
      );
    } finally {
      setVoiceLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title={t("pages.outOfStock.title")}
        icon="ti-alert-circle"
        subtitle={t("pages.outOfStock.subtitle")}
        actions={
          <div className="merchant-header-actions">
            <div className="btn-group" role="group" aria-label="Import restock list">
              <Link
                to="/dashboard/out-of-stock/import?source=photo"
                className="btn btn-sm import-ai-cta"
                title="Import list"
              >
                <i className="ti ti-sparkles" aria-hidden />
                <span className="d-none d-md-inline ms-1">{t("pages.outOfStock.import")}</span>
              </Link>
              <button
                type="button"
                className="btn btn-sm import-ai-cta dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="More import options"
              />
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/dashboard/out-of-stock/import?source=photo">
                    <i className="ti ti-sparkles me-2" />
                    Read from photo
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/dashboard/out-of-stock/import?source=csv">
                    <i className="ti ti-file-type-csv me-2" />
                    Upload CSV
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/dashboard/out-of-stock/import?source=excel">
                    <i className="ti ti-file-type-csv me-2" />
                    Upload Excel
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/dashboard/out-of-stock/import?source=paste">
                    <i className="ti ti-clipboard-text me-2" />
                    Paste list
                  </Link>
                </li>
              </ul>
            </div>
            <ImportIconButton
              icon="ti-plus"
              label="Add item"
              variant="primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            />
            <MicIconButton title="Speak items" onClick={() => setShowVoiceModal(true)} />
          </div>
        }
      />

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <SectionPanel title="Add or edit" icon="ti-plus" className="mb-4">
          <button
            type="button"
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}>
            <i className="ti ti-plus" />
            Add item
          </button>

          {showForm && (
                <form
                  onSubmit={handleSubmit}
                  className="mt-4 p-3 bg-light rounded-2">
                  <h6 className="mb-3">{editingId ? "Edit item" : "New item"}</h6>
                  <div className="row g-2">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Item name *"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Quantity (e.g. 2 units)"
                        value={formQuantity}
                        onChange={(e) => setFormQuantity(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Note"
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2 d-flex gap-1">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={submitLoading}>
                        {submitLoading ? "…" : editingId ? "Update" : "Add"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={resetForm}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
      </SectionPanel>

      <AppModal
        show={showVoiceModal}
        title="Speak out-of-stock items"
        onClose={() => {
          setShowVoiceModal(false);
          setVoiceRecording(null);
        }}
      >
        <VoiceRecorder
          onRecorded={(result) => {
            setVoiceRecording(result);
            setError(null);
          }}
          onError={setError}
        />
        {voiceRecording && (
          <div className="d-flex gap-2 mt-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateFromVoice}
              disabled={voiceLoading}
            >
              {voiceLoading ? "Adding…" : "Add to list"}
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

      <SectionPanel
        title="Restock list"
        icon="ti-list"
        flush
        bodyClassName="p-0"
        actions={
          <ImportIconButton
            icon="ti-file-type-pdf"
            label="Export PDF"
            variant="outline-primary"
            onClick={handleExportPdf}
            disabled={items.length === 0}
          />
        }
      >
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <MerchantDataTable>
                <thead className="bg-light">
                  <tr>
                    <th scope="col">
                      <MerchantTableHeadLabel>Item</MerchantTableHeadLabel>
                    </th>
                    <th scope="col">
                      <MerchantTableHeadLabel>Quantity</MerchantTableHeadLabel>
                    </th>
                    <th scope="col">
                      <MerchantTableHeadLabel>Note</MerchantTableHeadLabel>
                    </th>
                    <th scope="col" className="merchant-data-table__num" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        No out-of-stock items. Click &quot;Add item&quot; to
                        create a list to share with vendors or your team.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item._id}>
                        <td className="fw-medium">{item.name}</td>
                        <td>{item.quantity || "—"}</td>
                        <td className="small text-muted">{item.note || "—"}</td>
                        <td className="merchant-data-table__num text-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEdit(item)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
            </MerchantDataTable>
          )}
      </SectionPanel>
    </PageShell>
  );
}
