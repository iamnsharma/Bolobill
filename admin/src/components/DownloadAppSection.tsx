import { useState, useEffect } from "react";
import { adminApi } from "../api/admin";

const DEFAULT_PLAY = "https://play.google.com/store/apps";
const DEFAULT_APPLE = "https://apps.apple.com/app";

export function DownloadAppSection() {
  const [links, setLinks] = useState<{ playStoreUrl: string; appStoreUrl: string } | null>(null);

  useEffect(() => {
    adminApi
      .getStoreLinks()
      .then(setLinks)
      .catch(() => setLinks({ playStoreUrl: "", appStoreUrl: "" }));
  }, []);

  const playUrl = links?.playStoreUrl?.trim() || DEFAULT_PLAY;
  const appStoreUrl = links?.appStoreUrl?.trim() || DEFAULT_APPLE;

  return (
    <div className="download-app-section card border-0 shadow-sm rounded-4 overflow-hidden">
      <div className="download-app-bg" />
      <div className="card-body position-relative p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span className="download-app-badge">Get the app</span>
            <h2 className="download-app-title mb-2">BoloBill on mobile</h2>
            <p className="download-app-text mb-0">
              Create bills with voice, share invoices on WhatsApp, and manage out-of-stock lists — all from your phone. Download for Android or iOS.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="d-flex flex-wrap gap-3 justify-content-lg-end">
              <a
                href={playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="download-app-btn download-app-btn--play rounded-4 text-decoration-none d-inline-flex align-items-center gap-3"
              >
                <img src="/playstore.png" alt="Get it on Google Play" className="download-app-btn-icon" />
                <div className="text-start">
                  <span className="d-block small opacity-90">Get it on</span>
                  <span className="fw-bold">Google Play</span>
                </div>
              </a>
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="download-app-btn download-app-btn--apple rounded-4 text-decoration-none d-inline-flex align-items-center gap-3"
              >
                <img src="/app-store.png" alt="Download on the App Store" className="download-app-btn-icon" />
                <div className="text-start">
                  <span className="d-block small opacity-90">Download on the</span>
                  <span className="fw-bold">App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
