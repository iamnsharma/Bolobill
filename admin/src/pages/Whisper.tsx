import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { adminApi, type WhisperUsage } from "../api/admin";
import PageShell from "../components/merchant/PageShell";
import PageHeader from "../components/merchant/PageHeader";
import SectionPanel from "../components/merchant/SectionPanel";
import MetricTile from "../components/merchant/MetricTile";

function WhisperContent() {
  const [data, setData] = useState<WhisperUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
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
              ?.message ?? "Failed to load Whisper usage",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  const u = data!;

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-3">
          <MetricTile
            label="Total usage"
            value={`${u.totalMinutes.toLocaleString(undefined, { maximumFractionDigits: 1 })} min`}
            hint={`${u.totalSeconds.toLocaleString()} seconds`}
            icon="ti-microphone"
            tone="primary"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <MetricTile
            label="Cost (INR)"
            value={`₹${u.costINR.toLocaleString()}`}
            hint="Estimated total"
            icon="ti-currency-rupee"
            tone="success"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <MetricTile
            label="Cost (USD)"
            value={`$${u.costUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            hint="Estimated total"
            icon="ti-currency-dollar"
            tone="info"
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <MetricTile
            label="Users with usage"
            value={u.usersWithUsage}
            hint="Used voice feature"
            icon="ti-users"
            tone="warning"
          />
        </div>
      </div>

      <SectionPanel title="Limits & per-user usage" icon="ti-info-circle">
        <p className="small text-muted mb-2">
          Voice minutes limit is set <strong>per plan</strong> in{" "}
          <Link to="/dashboard/subscriptions">Manage subscriptions</Link>. Each plan has a
          &quot;Voice minutes&quot; limit; users on that plan can use up to that amount per billing
          period.
        </p>
        <p className="small text-muted mb-0">
          To see how much each user has used, open{" "}
          <Link to="/dashboard/users">Manage users</Link> → select a user → check &quot;Voice /
          Whisper usage&quot; on their profile.
        </p>
      </SectionPanel>
    </>
  );
}

export default function Whisper() {
  const { isSuperAdmin } = useAuth();

  return (
    <PageShell>
      <PageHeader
        title="Whisper usage"
        icon="ti-microphone"
        subtitle="Platform-wide voice-to-text usage and estimated cost. Plan limits are set under Manage subscriptions."
      />
      {!isSuperAdmin ? (
        <div className="alert alert-warning" role="alert">
          Only super admins can view Whisper usage.
        </div>
      ) : (
        <WhisperContent />
      )}
    </PageShell>
  );
}
