import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import AuthScreenLayout from "../components/AuthScreenLayout";
import bolobillLogo from "../assets/images/bolobill-logo.png";

const RESEND_OTP_COOLDOWN_SEC = 60;

export default function SignupPage() {
  const navigate = useNavigate();
  const { registerWithOtp } = useAuth();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_OTP_COOLDOWN_SEC);
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? (clearInterval(interval), 0) : prev - 1));
    }, 1000);
  }, []);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Enter at least 2 characters for full name.");
      return;
    }
    if (businessName.trim().length < 2) {
      setError("Enter your business or branch name.");
      return;
    }
    if (phone.trim().length < 10) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    setRegisterStep(2);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.sendOtp(phone.trim());
      setRegisterStep(3);
      startResendCooldown();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 6) {
      setError("Enter the 6-digit OTP.");
      return;
    }
    if (pin.trim().length < 4) {
      setError("PIN should be at least 4 digits.");
      return;
    }
    setLoading(true);
    try {
      await registerWithOtp({
        phone: phone.trim(),
        otp: otp.trim(),
        name: name.trim(),
        businessName: businessName.trim(),
        pin: pin.trim(),
      });
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. OTP may be wrong or number already registered.");
    } finally {
      setLoading(false);
    }
  };

  const subtitle =
    registerStep === 1
      ? "Set up your business"
      : registerStep === 2
        ? "Send OTP to your number"
        : "Enter OTP and set PIN";

  return (
    <AuthScreenLayout title="Quick sign up" subtitle={subtitle}>
      <div className="text-center mb-4">
        <Link to="/" className="d-inline-block" aria-label="BoloBill">
          <img src={bolobillLogo} alt="Bolo Bill" className="auth-logo mb-2" style={{ maxWidth: 80 }} />
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {error}
        </div>
      )}

      {registerStep === 1 && (
        <form onSubmit={handleStep1}>
          <div className="mb-3">
            <label htmlFor="signup-name" className="form-label small fw-semibold text-muted">Full name</label>
            <input
              id="signup-name"
              type="text"
              className="form-control form-control-lg rounded-3"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signup-phone" className="form-label small fw-semibold text-muted">Phone number</label>
            <input
              id="signup-phone"
              type="tel"
              className="form-control form-control-lg rounded-3"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={10}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="signup-business" className="form-label small fw-semibold text-muted">Business / Branch name</label>
            <input
              id="signup-business"
              type="text"
              className="form-control form-control-lg rounded-3"
              placeholder="e.g. Sharma Kirana – Jaipur Branch"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              maxLength={60}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold">
            Continue
          </button>
        </form>
      )}

      {registerStep === 2 && (
        <form onSubmit={handleSendOtp}>
          <div className="p-3 bg-light rounded-3 mb-3 small">
            <div className="text-muted">+91 {phone}</div>
            <div className="fw-medium">{name}</div>
            <div className="text-muted">{businessName}</div>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold"
            disabled={loading}
          >
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
            Send OTP
          </button>
          <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setRegisterStep(1)}>
            Back
          </button>
        </form>
      )}

      {registerStep === 3 && (
        <form onSubmit={handleRegister}>
          <div className="p-2 mb-2 small text-muted">+91 {phone}</div>
          <div className="mb-3">
            <label htmlFor="signup-otp" className="form-label small fw-semibold text-muted">OTP (6 digits)</label>
            <input
              id="signup-otp"
              type="text"
              inputMode="numeric"
              className="form-control form-control-lg rounded-3"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="signup-pin" className="form-label small fw-semibold text-muted">Create PIN (4–8 digits)</label>
            <input
              id="signup-pin"
              type="password"
              className="form-control form-control-lg rounded-3"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={8}
            />
          </div>
          <div className="d-flex gap-2 mb-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-3 flex-grow-1"
              onClick={handleSendOtp}
              disabled={resendCooldown > 0 || loading}
            >
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-3 flex-grow-1 fw-semibold"
              disabled={loading || otp.trim().length < 6 || pin.trim().length < 4}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : null}
              Create account
            </button>
          </div>
          <button type="button" className="btn btn-link p-0 small" onClick={() => setRegisterStep(2)}>
            Back
          </button>
        </form>
      )}

      <p className="text-center small text-muted mt-4 mb-0">
        Already have an account?{" "}
        <Link to="/login" className="fw-semibold text-decoration-none">Log in</Link>
      </p>
    </AuthScreenLayout>
  );
}
