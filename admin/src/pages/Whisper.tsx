import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type WhisperUsage } from "../api/admin";

export default function Whisper() {
  const { isSuperAdmin } = useAuth();
  const [data, setData] = useState<WhisperUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    adminApi
      .getWhisperUsage()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(
            (e as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ?? "Failed to load Whisper usage"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="mt-6 admin-page">
        <div className="alert alert-warning">
          Only super admins can view Whisper usage.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-6 admin-page">
        <div className="d-flex align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 admin-page">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const u = data!;

  return (
    <div className="mt-6 admin-page whisper-page">
      <div className="whisper-hero rounded-4 overflow-hidden mb-4">
        <div className="whisper-hero-inner">
          <span className="whisper-hero-badge">Voice / Whisper</span>
          <h1 className="whisper-hero-title">Whisper usage</h1>
          <p className="whisper-hero-sub mb-0">
            Platform-wide voice-to-text usage and estimated cost. Limits are set per plan in Manage subscriptions.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 whisper-stat-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="whisper-stat-icon rounded-2 d-flex align-items-center justify-content-center">
                  <i className="ti ti-microphone text-primary" />
                </span>
                <span className="fw-bold small text-muted">Total usage</span>
              </div>
              <p className="h3 mb-1 fw-bold">
                {u.totalMinutes.toLocaleString(undefined, { maximumFractionDigits: 1 })} min
              </p>
              <p className="small text-muted mb-0">
                {u.totalSeconds.toLocaleString()} seconds
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 whisper-stat-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="whisper-stat-icon rounded-2 d-flex align-items-center justify-content-center bg-success bg-opacity-10">
                  <i className="ti ti-currency-rupee text-success" />
                </span>
                <span className="fw-bold small text-muted">Cost (INR)</span>
              </div>
              <p className="h3 mb-1 fw-bold text-success">
                ₹{u.costINR.toLocaleString()}
              </p>
              <p className="small text-muted mb-0">Estimated total</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 whisper-stat-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="whisper-stat-icon rounded-2 d-flex align-items-center justify-content-center bg-info bg-opacity-10">
                  <i className="ti ti-currency-dollar text-info" />
                </span>
                <span className="fw-bold small text-muted">Cost (USD)</span>
              </div>
              <p className="h3 mb-1 fw-bold text-info">
                ${u.costUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <p className="small text-muted mb-0">Estimated total</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 h-100 whisper-stat-card">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="whisper-stat-icon rounded-2 d-flex align-items-center justify-content-center bg-warning bg-opacity-10">
                  <i className="ti ti-users text-warning" />
                </span>
                <span className="fw-bold small text-muted">Users with usage</span>
              </div>
              <p className="h3 mb-1 fw-bold">{u.usersWithUsage}</p>
              <p className="small text-muted mb-0">Used voice feature</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <h3 className="h6 fw-bold mb-2">
            <i className="ti ti-info-circle me-2" />
            Limits &amp; per-user usage
          </h3>
          <p className="small text-muted mb-2">
            Voice minutes limit is set <strong>per plan</strong> in{" "}
            <Link to="/subscriptions">Manage subscriptions</Link>. Each plan has an
            &quot;Voice minutes&quot; limit; users on that plan can use up to that
            amount per billing period.
          </p>
          <p className="small text-muted mb-0">
            To see how much each user has used, open{" "}
            <Link to="/users">Manage users</Link> → click a user → check
            &quot;Voice / Whisper usage&quot; in their profile. Pending limit
            (remaining minutes) is plan limit minus that user&apos;s usage.
          </p>
        </div>
      </div>
    </div>
  );
}
