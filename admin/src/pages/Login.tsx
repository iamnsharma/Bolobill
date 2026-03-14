import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bolobillLogo from "../assets/images/bolobill-logo.png";

type Tab = "login" | "register";

export default function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleRegisterContinue = (e: React.FormEvent) => {
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pin.trim().length < 4) {
      setError("PIN should be at least 4 digits.");
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        businessName: businessName.trim(),
        phone: phone.trim(),
        pin: pin.trim(),
      });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. This number may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setTab("login");
    setError("");
    setRegisterStep(1);
    setPin("");
  };

  const switchToRegister = () => {
    setTab("register");
    setError("");
    setRegisterStep(1);
    setPin("");
  };

  return (
    <div className="auth-page min-vh-100 d-flex align-items-center justify-content-center">
      <div className="auth-card card border-0 shadow rounded-4 overflow-hidden">
        <div className="auth-card-bg" />
        <div className="card-body position-relative p-4 p-md-5">
          <div className="text-center mb-4">
            <img
              src={bolobillLogo}
              alt="BoloBill"
              className="auth-logo mb-3"
            />
            <h1 className="h4 fw-bold text-dark mb-1">BoloBill</h1>
            <p className="text-muted small mb-0">
              {tab === "login"
                ? "Sign in to your business account"
                : registerStep === 1
                  ? "Set up your business in two quick steps"
                  : "Create a secure PIN for your account"}
            </p>
          </div>

          {/* Tabs */}
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

          {error && (
            <div className="alert alert-danger py-2 small mb-3" role="alert">
              {error}
            </div>
          )}

          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label small fw-semibold text-muted">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="form-control form-control-lg rounded-3"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label htmlFor="pin" className="form-label small fw-semibold text-muted">
                  PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  className="form-control form-control-lg rounded-3"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoComplete="off"
                  maxLength={8}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold"
                disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : null}
                Sign in
              </button>
            </form>
          )}

          {tab === "register" && registerStep === 1 && (
            <form onSubmit={handleRegisterContinue}>
              <div className="mb-3">
                <label htmlFor="reg-name" className="form-label small fw-semibold text-muted">
                  Full name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="reg-phone" className="form-label small fw-semibold text-muted">
                  Phone number
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-control form-control-lg rounded-3"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="reg-business" className="form-label small fw-semibold text-muted">
                  Business / Branch name
                </label>
                <input
                  id="reg-business"
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  placeholder="e.g. Sharma Kirana – Jaipur Branch"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  maxLength={60}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold">
                Continue
              </button>
            </form>
          )}

          {tab === "register" && registerStep === 2 && (
            <form onSubmit={handleRegisterSubmit}>
              <div className="p-3 bg-light rounded-3 mb-3 small">
                <div className="text-muted">+91 {phone}</div>
                <div className="fw-medium">{name}</div>
                <div className="text-muted">{businessName}</div>
              </div>
              <div className="mb-4">
                <label htmlFor="reg-pin" className="form-label small fw-semibold text-muted">
                  Create PIN (4–8 digits)
                </label>
                <input
                  id="reg-pin"
                  type="password"
                  className="form-control form-control-lg rounded-3"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={8}
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-3 py-3 flex-grow-1"
                  onClick={() => setRegisterStep(1)}>
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-3 py-3 flex-grow-1 fw-semibold"
                  disabled={loading || pin.trim().length < 4}>
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : null}
                  Create account
                </button>
              </div>
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
        </div>
      </div>
    </div>
  );
}
