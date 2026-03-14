import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import bolobillLogo from "../assets/images/bolobill-logo.png";

const LOGO_CLICK_WINDOW_MS = 4000;
const LOGO_CLICKS_NEEDED = 4;
const RESEND_OTP_COOLDOWN_SEC = 60;

type Tab = "login" | "register";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithOtp, registerWithOtp } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
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
    logoClickTimer.current = setTimeout(() => {
      clearLogoTimer();
    }, LOGO_CLICK_WINDOW_MS);
  }, [clearLogoTimer]);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_OTP_COOLDOWN_SEC);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
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

  const sendOtpForRegister = async () => {
    setError("");
    if (phone.trim().length < 10) return;
    setLoading(true);
    try {
      await authApi.sendOtp(phone.trim());
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
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) {
        setError("Access denied. Use the admin login (secret) for business dashboard.");
      } else if (status === 404) {
        setError("Phone not registered. Please register first.");
      } else {
        setError(msg || "Invalid OTP or login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep1 = (e: React.FormEvent) => {
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

  const handleRegisterSendOtp = async (e: React.FormEvent) => {
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

  const handleRegisterWithOtp = async (e: React.FormEvent) => {
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
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. OTP may be wrong or number already registered.");
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
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) {
        setError("Access denied. Use the phone and PIN from your BoloBill business account.");
      } else {
        setError(msg || "Invalid phone or PIN.");
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setTab("login");
    setError("");
    setLoginOtpSent(false);
    setOtp("");
  };

  const switchToRegister = () => {
    setTab("register");
    setError("");
    setRegisterStep(1);
    setOtp("");
    setPin("");
  };

  const hideAdminForm = () => {
    setShowAdminForm(false);
    setError("");
    setPin("");
    clearLogoTimer();
  };

  return (
    <div className="auth-page min-vh-100 d-flex align-items-center justify-content-center">
      <div className="auth-card card border-0 shadow rounded-4 overflow-hidden">
        <div className="auth-card-bg" />
        <div className="card-body position-relative p-4 p-md-5">
          <div className="text-center mb-4">
            <button
              type="button"
              className="border-0 bg-transparent p-0 d-inline-block"
              onClick={handleLogoClick}
              aria-label="BoloBill logo">
              <img
                src={bolobillLogo}
                alt="BoloBill"
                className="auth-logo mb-3"
              />
            </button>
            <h1 className="h4 fw-bold text-dark mb-1">BoloBill</h1>
            <p className="text-muted small mb-0">
              {showAdminForm
                ? "Admin sign in (phone + PIN)"
                : tab === "login"
                  ? loginOtpSent
                    ? "Enter OTP sent to your number"
                    : "Sign in with OTP"
                  : registerStep === 1
                    ? "Set up your business"
                    : registerStep === 2
                      ? "Send OTP to your number"
                      : "Enter OTP and set PIN"}
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {error}
            </div>
          )}

          {showAdminForm ? (
            <>
              <form onSubmit={handleAdminLogin}>
                <div className="mb-3">
                  <label htmlFor="admin-phone" className="form-label small fw-semibold text-muted">
                    Phone number
                  </label>
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
                  <label htmlFor="admin-pin" className="form-label small fw-semibold text-muted">
                    PIN
                  </label>
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
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-3 py-3 flex-grow-1"
                    onClick={hideAdminForm}>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 py-3 flex-grow-1 fw-semibold"
                    disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm" /> : null}
                    Sign in (Admin)
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="d-flex rounded-3 bg-light p-1 mb-4">
                <button
                  type="button"
                  className={`btn flex-grow-1 rounded-2 py-2 fw-semibold ${tab === "login" ? "btn-primary" : "btn-link text-muted text-decoration-none"}`}
                  onClick={switchToLogin}>
                  Sign in
                </button>
                <button
                  type="button"
                  className={`btn flex-grow-1 rounded-2 py-2 fw-semibold ${tab === "register" ? "btn-primary" : "btn-link text-muted text-decoration-none"}`}
                  onClick={switchToRegister}>
                  Register
                </button>
              </div>

              {/* Normal Login: phone → OTP */}
              {tab === "login" && !loginOtpSent && (
                <form onSubmit={handleSendOtpLogin}>
                  <div className="mb-4">
                    <label htmlFor="login-phone" className="form-label small fw-semibold text-muted">
                      Phone number
                    </label>
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
                    disabled={loading || phone.trim().length < 10}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    Send OTP
                  </button>
                </form>
              )}

              {tab === "login" && loginOtpSent && (
                <form onSubmit={handleLoginWithOtp}>
                  <div className="p-2 mb-2 small text-muted">+91 {phone}</div>
                  <div className="mb-3">
                    <label htmlFor="login-otp" className="form-label small fw-semibold text-muted">
                      OTP (6 digits)
                    </label>
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
                      disabled={resendCooldown > 0 || loading}>
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 flex-grow-1 fw-semibold"
                      disabled={loading || otp.trim().length < 6}>
                      {loading ? <span className="spinner-border spinner-border-sm" /> : null}
                      Verify & Sign in
                    </button>
                  </div>
                  <button type="button" className="btn btn-link p-0 small" onClick={() => { setLoginOtpSent(false); setOtp(""); }}>
                    Change number
                  </button>
                </form>
              )}

              {/* Register: step 1 */}
              {tab === "register" && registerStep === 1 && (
                <form onSubmit={handleRegisterStep1}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Full name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={40}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">Phone number</label>
                    <input
                      type="tel"
                      className="form-control form-control-lg rounded-3"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted">Business / Branch name</label>
                    <input
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

              {/* Register: step 2 – Send OTP */}
              {tab === "register" && registerStep === 2 && (
                <form onSubmit={handleRegisterSendOtp}>
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <div className="text-muted">+91 {phone}</div>
                    <div className="fw-medium">{name}</div>
                    <div className="text-muted">{businessName}</div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold"
                    disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                    Send OTP
                  </button>
                  <button type="button" className="btn btn-link w-100 mt-2" onClick={() => setRegisterStep(1)}>
                    Back
                  </button>
                </form>
              )}

              {/* Register: step 3 – OTP + PIN */}
              {tab === "register" && registerStep === 3 && (
                <form onSubmit={handleRegisterWithOtp}>
                  <div className="p-2 mb-2 small text-muted">+91 {phone}</div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted">OTP (6 digits)</label>
                    <input
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
                    <label className="form-label small fw-semibold text-muted">Create PIN (4–8 digits)</label>
                    <input
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
                      onClick={sendOtpForRegister}
                      disabled={resendCooldown > 0 || loading}>
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend OTP"}
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 flex-grow-1 fw-semibold"
                      disabled={loading || otp.trim().length < 6 || pin.trim().length < 4}>
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
                {tab === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button type="button" className="btn btn-link p-0 align-baseline fw-semibold" onClick={switchToRegister}>
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" className="btn btn-link p-0 align-baseline fw-semibold" onClick={switchToLogin}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
