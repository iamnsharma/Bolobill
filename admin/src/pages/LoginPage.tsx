import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import AuthScreenLayout from "../components/AuthScreenLayout";
import bolobillLogo from "../assets/images/bolobill-logo.png";

const LOGO_CLICK_WINDOW_MS = 4000;
const LOGO_CLICKS_NEEDED = 4;
const RESEND_OTP_COOLDOWN_SEC = 60;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithOtp } = useAuth();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLogoTimer = useCallback(() => {
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
      logoClickTimer.current = null;
    }
    logoClickCount.current = 0;
  }, []);

  const handleLogoClick = useCallback(() => {
    logoClickCount.current += 1;
    if (logoClickCount.current >= LOGO_CLICKS_NEEDED) {
      clearLogoTimer();
      setShowAdminForm(true);
      setError("");
      return;
    }
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(clearLogoTimer, LOGO_CLICK_WINDOW_MS);
  }, [clearLogoTimer]);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_OTP_COOLDOWN_SEC);
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? (clearInterval(interval), 0) : prev - 1));
    }, 1000);
  }, []);

  const handleSendOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.trim().length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(phone.trim());
      setLoginOtpSent(true);
      startResendCooldown();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtpForLogin = async () => {
    setError("");
    if (phone.trim().length < 10) return;
    setLoading(true);
    try {
      await authApi.sendOtp(phone.trim());
      setLoginOtpSent(true);
      startResendCooldown();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await loginWithOtp(phone.trim(), otp.trim());
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) setError("Access denied. Use the admin login (secret) for business dashboard.");
      else if (status === 404) setError("Phone not registered. Please register first.");
      else setError(msg || "Invalid OTP or login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone.trim() || !pin.trim()) {
      setError("Phone and PIN are required.");
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), pin.trim());
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) setError("Access denied. Use the phone and PIN from your BoloBill business account.");
      else setError(msg || "Invalid phone or PIN.");
    } finally {
      setLoading(false);
    }
  };

  const hideAdminForm = () => {
    setShowAdminForm(false);
    setError("");
    setPin("");
    clearLogoTimer();
  };

  const subtitle = showAdminForm
    ? "Admin sign in (phone + PIN)"
    : loginOtpSent
      ? "Enter OTP sent to your number"
      : "Quick sign in with OTP";

  return (
    <AuthScreenLayout title="Log in" subtitle={subtitle}>
      <div className="text-center mb-4">
        <button
          type="button"
          className="border-0 bg-transparent p-0 d-inline-block"
          onClick={handleLogoClick}
          aria-label="BoloBill logo"
        >
          <img src={bolobillLogo} alt="Bolo Bill" className="auth-logo mb-2" style={{ maxWidth: 80 }} />
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {error}
        </div>
      )}

      {showAdminForm ? (
        <form onSubmit={handleAdminLogin}>
          <div className="mb-3">
            <label htmlFor="admin-phone" className="form-label small fw-semibold text-muted">Phone number</label>
            <input
              id="admin-phone"
              type="tel"
              className="form-control form-control-lg rounded-3"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="admin-pin" className="form-label small fw-semibold text-muted">PIN</label>
            <input
              id="admin-pin"
              type="password"
              className="form-control form-control-lg rounded-3"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="off"
              maxLength={8}
            />
          </div>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary rounded-3 py-3 flex-grow-1" onClick={hideAdminForm}>
              Back
            </button>
            <button type="submit" className="btn btn-primary rounded-3 py-3 flex-grow-1 fw-semibold" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : null}
              Sign in (Admin)
            </button>
          </div>
        </form>
      ) : !loginOtpSent ? (
        <form onSubmit={handleSendOtpLogin}>
          <div className="mb-4">
            <label htmlFor="login-phone" className="form-label small fw-semibold text-muted">Phone number</label>
            <input
              id="login-phone"
              type="tel"
              className="form-control form-control-lg rounded-3"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold"
            disabled={loading || phone.trim().length < 10}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleLoginWithOtp}>
          <div className="p-2 mb-2 small text-muted">+91 {phone}</div>
          <div className="mb-3">
            <label htmlFor="login-otp" className="form-label small fw-semibold text-muted">OTP (6 digits)</label>
            <input
              id="login-otp"
              type="text"
              inputMode="numeric"
              className="form-control form-control-lg rounded-3"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
          </div>
          <div className="d-flex gap-2 mb-3">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 flex-grow-1"
              onClick={sendOtpForLogin}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-3 flex-grow-1 fw-semibold"
              disabled={loading || otp.trim().length < 6}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : null}
              Verify & Sign in
            </button>
          </div>
          <button type="button" className="btn btn-link p-0 small" onClick={() => { setLoginOtpSent(false); setOtp(""); }}>
            Change number
          </button>
        </form>
      )}

      <p className="text-center small text-muted mt-4 mb-0">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="fw-semibold text-decoration-none">Sign up</Link>
      </p>
    </AuthScreenLayout>
  );
}
