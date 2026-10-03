import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthScreenLayout from "../components/AuthScreenLayout";
import PlatformAdminLogin from "../components/auth/PlatformAdminLogin";
import { useEasterEggUnlock } from "../hooks/useEasterEggUnlock";
import { resolveApiOrigin } from "../config/deployUrls";
import PinInput from "../components/PinInput";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [platformUnlocked, setPlatformUnlocked] = useState(false);

  const registerBrandTap = useEasterEggUnlock(() => setPlatformUnlocked(true), 9, 6000);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.trim().length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!pin.trim()) {
      setError("Enter the PIN from your BoloBill welcome message.");
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), pin.trim());
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      if (err instanceof Error && !ax.response) {
        setError(err.message);
        return;
      }
      const status = ax.response?.status;
      const msg = ax.response?.data?.message;
      if (!ax.response) {
        const api = resolveApiOrigin();
        setError(
          import.meta.env.DEV
            ? "Cannot reach the API. Start bolobill-backend on port 3011, then try again."
            : `Cannot reach the API at ${api}. Wait ~1 min if Render was sleeping, then try again. On Vercel set VITE_API_URL and redeploy.`,
        );
      } else if (status === 403) {
        setError("This account cannot access the business dashboard.");
      } else if (status === 404) {
        setError("Phone not registered. Run seed-admin or contact BoloBill.");
      } else if (status === 401) {
        setError(msg || "Invalid PIN.");
      } else {
        setError(msg || "Login failed. Check phone and PIN.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (platformUnlocked) {
    return (
      <AuthScreenLayout
        variant="platform"
        badge="Platform admin"
        title="Super admin console"
        subtitle="Sign in with the platform administrator phone and PIN. This area is not for merchant staff."
        formHeading="Platform admin sign in"
        formLead="Manage users, subscriptions, and platform settings after you authenticate."
        onExitPlatformAdmin={() => setPlatformUnlocked(false)}
      >
        <PlatformAdminLogin />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Sign in with the phone number and PIN we sent when your business was onboarded."
      onBrandSecretTap={registerBrandTap}
    >
      {error ? (
        <div className="alert marketing-alert-danger py-2 small mb-3" role="alert">
          <i className="ti ti-alert-circle me-1" aria-hidden />
          {error}
        </div>
      ) : null}

      <form onSubmit={handleLogin} className="marketing-form">
        <div className="mb-3">
          <label htmlFor="login-phone" className="form-label marketing-label">
            Phone number
          </label>
          <div className="marketing-input-wrap">
            <span className="marketing-input-icon" aria-hidden>
              <i className="ti ti-phone" />
            </span>
            <input
              id="login-phone"
              type="tel"
              className="form-control marketing-input"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              autoComplete="tel"
              maxLength={10}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="login-pin" className="form-label marketing-label">
            PIN
          </label>
          <PinInput
            id="login-pin"
            value={pin}
            onChange={setPin}
            placeholder="Login PIN"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="btn w-100 marketing-submit-btn fw-semibold"
          disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Sign in to dashboard
        </button>
      </form>

      <p className="text-center small marketing-muted mt-4 mb-0">
        New to BoloBill?{" "}
        <Link to="/signup" className="marketing-inline-link fw-semibold">
          Request business access
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
