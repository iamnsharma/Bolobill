import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/** Platform (super) admin — phone + PIN only (shown after easter-egg unlock on /login). */
export default function PlatformAdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.trim().length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!pin.trim()) {
      setError("Enter your platform admin PIN.");
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), pin.trim());
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      const status = ax.response?.status;
      const msg = ax.response?.data?.message;
      if (!ax.response) {
        setError("Cannot reach the API. Is bolobill-backend running on port 3011?");
      } else if (status === 403) {
        setError("This account cannot access the admin dashboard.");
      } else if (status === 404) {
        setError("Phone not registered. Run: npx tsx scripts/seed-admin.ts");
      } else if (status === 401) {
        setError(msg || "Invalid PIN.");
      } else {
        setError(msg || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="platform-admin-login mt-4 pt-4">
      <p className="platform-admin-login-label small fw-semibold mb-3">
        <i className="ti ti-shield-lock me-1" aria-hidden />
        Platform admin
      </p>
      {error ? (
        <div className="alert marketing-alert-danger py-2 small mb-3" role="alert">
          {error}
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="marketing-form">
        <div className="mb-3">
          <label htmlFor="platform-phone" className="form-label marketing-label">
            Admin phone
          </label>
          <div className="marketing-input-wrap">
            <span className="marketing-input-icon" aria-hidden>
              <i className="ti ti-phone" />
            </span>
            <input
              id="platform-phone"
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
          <label htmlFor="platform-pin" className="form-label marketing-label">
            PIN
          </label>
          <div className="marketing-input-wrap">
            <span className="marketing-input-icon" aria-hidden>
              <i className="ti ti-lock" />
            </span>
            <input
              id="platform-pin"
              type="password"
              className="form-control marketing-input"
              placeholder="Admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="current-password"
              maxLength={8}
            />
          </div>
        </div>
        <button type="submit" className="btn w-100 marketing-submit-btn fw-semibold" disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Sign in as platform admin
        </button>
      </form>
    </div>
  );
}
