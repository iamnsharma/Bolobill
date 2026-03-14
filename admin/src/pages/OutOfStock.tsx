import { useState, useEffect } from "react";
import { adminApi, type OutOfStockItem } from "../api/admin";
import { VoiceRecorder, type RecordingResult } from "../components/VoiceRecorder";
import { exportOutOfStockPdf } from "../utils/exportOutOfStockPdf";

type AddMode = "voice" | "manual";

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
  const [addMode, setAddMode] = useState<AddMode>("manual");
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
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Out of Stock</h1>
      <p className="text-muted mb-4">
        Add items you need to restock. Use voice or manual entry. Share the list as a PDF with your
        supplier (e.g. via WhatsApp or email).
      </p>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Voice | Manual selector */}
      <div className="d-flex gap-2 mb-4">
        <button
          type="button"
          className={`btn flex-grow-1 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            addMode === "voice" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setAddMode("voice")}>
          <i className="ti ti-microphone fs-5" />
          Voice
        </button>
        <button
          type="button"
          className={`btn flex-grow-1 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            addMode === "manual" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setAddMode("manual")}>
          <i className="ti ti-edit fs-5" />
          Manual
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          {addMode === "voice" && (
            <>
              <p className="small text-muted mb-3">
                Record your out-of-stock items. Say them clearly, e.g. &quot;rice, salt, oil, 2 kg dal&quot;.
              </p>
              <VoiceRecorder
                onRecorded={(result) => {
                  setVoiceRecording(result);
                  setError(null);
                }}
                onError={setError}
              />
              {voiceRecording && (
                <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                    <i className="ti ti-check text-success fs-5" />
                    <span className="fw-semibold">Recorded {voiceRecording.durationSec}s</span>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleCreateFromVoice}
                      disabled={voiceLoading}>
                      {voiceLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Adding…
                        </>
                      ) : (
                        <>
                          <i className="ti ti-check me-1" />
                          Add to list from recording
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setVoiceRecording(null)}
                      disabled={voiceLoading}>
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {addMode === "manual" && (
            <>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <button
                  type="button"
                  className="btn btn-primary d-inline-flex align-items-center gap-1"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}>
                  <i className="ti ti-plus" />
                  Add item
                </button>
              </div>

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
            </>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end mb-2">
        <button
          type="button"
          className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={handleExportPdf}
          disabled={items.length === 0}>
          <i className="ti ti-file-export" />
          Export as PDF
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          {loading ? (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>
                      <i className="ti ti-package me-1" />
                      Item
                    </th>
                    <th>Quantity</th>
                    <th>Note</th>
                    <th style={{ width: 120 }}></th>
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
                        <td>
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
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
