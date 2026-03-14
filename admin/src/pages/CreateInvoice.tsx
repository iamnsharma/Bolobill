import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../api/admin";
import {
  VoiceRecorder,
  type RecordingResult,
} from "../components/VoiceRecorder";
import ReviewInvoiceModal, {
  type ReviewInvoiceData,
} from "../components/ReviewInvoiceModal";

type LineItem = { name: string; quantity: string; totalPrice: string };

const defaultLine: LineItem = { name: "", quantity: "", totalPrice: "" };

type CreateMode = "voice" | "manual";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CreateMode>("voice");
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<LineItem[]>([{ ...defaultLine }]);
  const [error, setError] = useState<string | null>(null);
  const [voiceRecording, setVoiceRecording] = useState<RecordingResult | null>(
    null,
  );
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewInvoiceData | null>(null);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);

  const addLine = () => setLines((prev) => [...prev, { ...defaultLine }]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof LineItem, value: string) => {
    setLines((prev) => {
      const next = [...prev];
      (next[index] as Record<string, string>)[field] = value;
      return next;
    });
  };

  const total = lines.reduce(
    (sum, l) => sum + (parseFloat(l.totalPrice) || 0),
    0,
  );

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

  const handleReviewConfirm = async (data: ReviewInvoiceData) => {
    setReviewSubmitLoading(true);
    setError(null);
    setVoiceError(null);
    try {
      if (data.source === "voice") {
        await adminApi.createFromVoicePreview({
          customerName: data.customerName,
          items: data.items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
          })),
          transcript: data.transcript,
          durationSec: data.durationSec,
        });
      } else {
        await adminApi.createInvoice({
          customerName: data.customerName,
          items: data.items.map((i) => ({
            name: i.name,
            quantity: String(i.quantity),
            totalPrice: i.totalPrice,
          })),
          note: data.note,
        });
      }
      setReviewOpen(false);
      setReviewData(null);
      resetForm();
      navigate("/dashboard/invoices", { replace: true });
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
    setLines([{ ...defaultLine }]);
    setVoiceRecording(null);
    setError(null);
    setVoiceError(null);
  };

  const canRecord = customerName.trim().length > 0;

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Create Bill</h1>
      <p className="text-muted mb-4">
        Create a bill with voice or by adding items manually. Customer name is
        required for voice bills.
      </p>

      {(error || voiceError) && (
        <div
          className="alert alert-danger d-flex align-items-center gap-2"
          role="alert">
          <i className="ti ti-alert-circle" />
          {voiceError || error}
        </div>
      )}

      {/* Mode selector: Voice or Manual */}
      <div className="d-flex gap-2 mb-4">
        <button
          type="button"
          className={`btn flex-grow-1 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            mode === "voice" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setMode("voice")}>
          <i className="ti ti-microphone fs-5" />
          Voice
        </button>
        <button
          type="button"
          className={`btn flex-grow-1 py-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2 ${
            mode === "manual" ? "btn-secondary" : "btn-outline-secondary"
          }`}
          onClick={() => setMode("manual")}>
          <i className="ti ti-edit fs-5" />
          Manual
        </button>
      </div>

      {/* Voice form — shown only when Voice is selected */}
      {mode === "voice" && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-4">
            <p className="small text-muted mb-4">
              Add customer name first, then record. Speak items like &quot;2 kg
              rice 100 rupees, 1 packet salt 30 rupees&quot;.
            </p>
            <div className="row align-items-end">
              <div className="col-md-4 mb-3 mb-md-0">
                <label className="form-label fw-semibold">
                  Customer name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setVoiceError(null);
                  }}
                />
                <small className="text-muted">Required for voice bills</small>
              </div>
            </div>
            <div className="mt-4">
              <VoiceRecorder
                onRecorded={handleVoiceRecorded}
                onError={setVoiceError}
                disabled={!canRecord}
              />
            </div>
            {voiceRecording && (
              <div className="mt-4 p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                  <i className="ti ti-check text-success fs-5" />
                  <span className="fw-semibold">
                    Recorded {voiceRecording.durationSec}s
                  </span>
                </div>
                <p className="small text-muted mb-2">
                  Review and edit the parsed items before creating the bill.
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleReviewFromVoice}
                    disabled={voiceLoading || !customerName.trim()}>
                    {voiceLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Parsing…
                      </>
                    ) : (
                      <>
                        <i className="ti ti-clipboard-check me-1" />
                        Review &amp; create bill
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
          </div>
        </div>
      )}

      {/* Manual form — shown only when Manual is selected */}
      {mode === "manual" && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="card-body p-4">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label">
                  Customer name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setError(null);
                  }}
                />
                <small className="text-muted">Required for every bill</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Note (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0 fw-bold">Items</label>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={addLine}>
                <i className="ti ti-plus me-1" />
                Add row
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40%" }}>Item name</th>
                    <th style={{ width: "15%" }}>Qty</th>
                    <th style={{ width: "25%" }}>Total price (₹)</th>
                    <th style={{ width: "100px" }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i}>
                      <td className="pe-2">
                        <input
                          type="text"
                          className="form-control create-invoice-input"
                          placeholder="Item name"
                          value={line.name}
                          onChange={(e) =>
                            updateLine(i, "name", e.target.value)
                          }
                        />
                      </td>
                      <td className="pe-2">
                        <input
                          type="text"
                          className="form-control create-invoice-input"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(i, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td className="pe-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control create-invoice-input"
                          placeholder="0"
                          value={line.totalPrice}
                          onChange={(e) =>
                            updateLine(i, "totalPrice", e.target.value)
                          }
                        />
                      </td>
                      <td className="ps-1">
                        <div className="d-flex gap-1 justify-content-center align-items-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary create-invoice-row-btn"
                            onClick={addLine}
                            aria-label="Add item">
                            <i className="ti ti-plus" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger create-invoice-row-btn"
                            onClick={() => removeLine(i)}
                            disabled={lines.length <= 1}
                            aria-label="Remove row">
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end align-items-center mt-3 pt-3 border-top">
              <span className="me-3 fw-bold">Total: ₹{total.toFixed(2)}</span>
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => navigate("/dashboard/invoices")}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  if (!customerName.trim()) {
                    setError("Customer name is required.");
                    return;
                  }
                  const validLines = lines.filter((l) => l.name.trim());
                  if (validLines.length === 0) {
                    setError("Add at least one item with a name.");
                    return;
                  }
                  setError(null);
                  setReviewData({
                    customerName: customerName.trim(),
                    items: validLines.map((l) => ({
                      name: l.name.trim(),
                      quantity: l.quantity.trim() || "1",
                      totalPrice: parseFloat(l.totalPrice) || 0,
                    })),
                    note: note.trim() || undefined,
                    source: "manual",
                  });
                  setReviewOpen(true);
                }}>
                Review & create bill
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
