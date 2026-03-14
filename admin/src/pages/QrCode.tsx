import { useState, useEffect } from "react";
import { adminApi } from "../api/admin";

export default function QrCode() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const loadQr = () => {
    setLoading(true);
    adminApi
      .getQrCode()
      .then((data) => setQrUrl(data.url))
      .catch(() => setQrUrl(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQr();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please choose a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError("Image must be under 2MB.");
      return;
    }
    setFileError(null);
    const formData = new FormData();
    formData.append("qr", file);
    setUploading(true);
    adminApi
      .uploadQrCode(formData)
      .then((data) => {
        setQrUrl(data.url);
        setMessage({ type: "success", text: qrUrl ? "QR code updated. It will appear on new bills." : "QR code added. It will appear on new bills." });
      })
      .catch(() => setMessage({ type: "danger", text: "Upload failed. Try again." }))
      .finally(() => {
        setUploading(false);
        e.target.value = "";
      });
  };

  const handleDelete = async () => {
    if (!qrUrl) return;
    if (!window.confirm("Remove this QR code from your account? It will no longer appear on new bills.")) return;
    setMessage(null);
    setDeleting(true);
    try {
      await adminApi.deleteQrCode();
      setQrUrl(null);
      setMessage({ type: "success", text: "QR code removed." });
    } catch {
      setMessage({ type: "danger", text: "Failed to remove. Try again." });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 admin-page">
      <h1 className="fs-3 mb-1 fw-bold">QR Code</h1>
      <p className="text-muted mb-4">
        Upload your payment QR (e.g. UPI) so it appears on every bill PDF. Customers can scan it to pay.
      </p>

      {message && (
        <div className={`alert alert-${message.type} mb-4`} role="alert">
          {message.text}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          {qrUrl ? (
            <>
              <div className="d-flex flex-wrap align-items-start gap-4">
                <div className="border rounded-3 p-3 bg-light text-center" style={{ width: 160 }}>
                  <img src={qrUrl} alt="Your QR code" className="img-fluid" style={{ maxHeight: 140 }} />
                </div>
                <div>
                  <p className="fw-semibold mb-2">Current QR code</p>
                  <p className="text-muted small mb-3">This image is shown on your invoice PDFs as &quot;Scan to pay&quot;.</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <label className="btn btn-outline-primary mb-0">
                      Replace (upload new)
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="d-none"
                        onChange={handleFileChange}
                        disabled={uploading}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Removing…" : "Remove QR code"}
                    </button>
                  </div>
                </div>
              </div>
              {uploading && (
                <div className="mt-3 text-muted small">
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Uploading…
                </div>
              )}
            </>
          ) : (
            <>
              <p className="fw-semibold mb-2">No QR code yet</p>
              <p className="text-muted small mb-3">Upload a PNG, JPG or WebP image (max 2MB). It will appear on all new bills.</p>
              {fileError && <div className="alert alert-warning mb-3">{fileError}</div>}
              <label className="btn btn-primary">
                Upload QR image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="d-none"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <span className="ms-3 text-muted small">
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Uploading…
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
