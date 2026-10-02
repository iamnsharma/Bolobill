import { useState, useEffect } from "react";
import { adminApi, type OutOfStockItem } from "../api/admin";
import { VoiceRecorder, type RecordingResult, MicIconButton } from "../components/VoiceRecorder";
import AppModal from "../components/AppModal";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MerchantDataTable, { MerchantTableHeadLabel } from "../components/merchant/MerchantDataTable";
import { exportOutOfStockPdf } from "../utils/exportOutOfStockPdf";

export default function OutOfStock() {
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
          ?.message ?? "Failed to load list",
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
        title="Out of Stock"
        icon="ti-alert-circle"
        subtitle="Items to reorder. Share the list as PDF with your supplier."
        actions={
          <MicIconButton title="Speak items" onClick={() => setShowVoiceModal(true)} />
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
                        placeholder="Quantity (e.g. 2 kg)"
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
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={handleExportPdf}
            disabled={items.length === 0}>
            <i className="ti ti-file-export me-1" />
            Export PDF
          </button>
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
                        create a list to share with your supplier.
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
