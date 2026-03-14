import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { adminApi } from "../api/admin";

export default function StoreLinks() {
  const { isSuperAdmin } = useAuth();
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    adminApi
      .getStoreLinks()
      .then((data) => {
        setPlayStoreUrl(data.playStoreUrl || "");
        setAppStoreUrl(data.appStoreUrl || "");
      })
      .catch(() => {
        setPlayStoreUrl("");
        setAppStoreUrl("");
      })
      .finally(() => setLoading(false));
  }, [isSuperAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      await adminApi.updateStoreLinks({
        playStoreUrl: playStoreUrl.trim() || undefined,
        appStoreUrl: appStoreUrl.trim() || undefined,
      });
      setMessage({ type: "success", text: "Store links saved. All users will see these URLs in the Download app section." });
    } catch {
      setMessage({ type: "danger", text: "Failed to save. Try again." });
    } finally {
      setSaving(false);
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

  if (!isSuperAdmin) {
    return (
      <div className="admin-page">
        <div className="alert alert-warning">
          Only super admins can manage store links. This page is not available for your account.
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1 className="fs-3 mb-1 fw-bold">Store links</h1>
      <p className="text-muted mb-4">
        Set the Google Play and App Store URLs for the BoloBill app. These links are shown to all users in the &quot;Download app&quot; section on the dashboard.
      </p>

      {message && (
        <div className={`alert alert-${message.type} mb-4`} role="alert">
          {message.text}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4 p-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="playStoreUrl" className="form-label fw-semibold">
                Google Play Store URL
              </label>
              <input
                id="playStoreUrl"
                type="url"
                className="form-control form-control-lg rounded-3"
                placeholder="https://play.google.com/store/apps/details?id=..."
                value={playStoreUrl}
                onChange={(e) => setPlayStoreUrl(e.target.value)}
              />
              <small className="text-muted">Leave empty to use default Play Store search.</small>
            </div>
            <div className="mb-4">
              <label htmlFor="appStoreUrl" className="form-label fw-semibold">
                Apple App Store URL
              </label>
              <input
                id="appStoreUrl"
                type="url"
                className="form-control form-control-lg rounded-3"
                placeholder="https://apps.apple.com/app/..."
                value={appStoreUrl}
                onChange={(e) => setAppStoreUrl(e.target.value)}
              />
              <small className="text-muted">Leave empty to use default App Store search.</small>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg rounded-3 px-4"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="ti ti-device-floppy me-2" />
                  Save store links
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="card border-0 bg-light bg-opacity-50 rounded-4 mt-4 p-4">
        <p className="small text-muted mb-0">
          <i className="ti ti-info-circle me-1" />
          These URLs are used in the &quot;Get the app&quot; section on the dashboard. Business users will see the download buttons with your links when they log in.
        </p>
      </div>
    </div>
  );
}
