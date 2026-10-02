import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthScreenLayout from "../components/AuthScreenLayout";
import bolobillLogo from "../assets/images/bolobill-logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 403) setError("This account cannot access the business dashboard.");
      else if (status === 404) setError("Phone not registered. Contact BoloBill to get access.");
      else setError(msg || "Invalid phone or PIN.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title="Log in"
      subtitle="Use the phone number and PIN we shared when your shop was onboarded"
    >
      <div className="text-center mb-4">
        <Link to="/" className="d-inline-block" aria-label="BoloBill home">
          <img src={bolobillLogo} alt="Bolo Bill" className="auth-logo mb-2" style={{ maxWidth: 80 }} />
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small mb-3" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label htmlFor="login-phone" className="form-label small fw-semibold text-muted">
            Phone number
          </label>
          <input
            id="login-phone"
            type="tel"
            className="form-control form-control-lg rounded-3"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            autoComplete="tel"
            maxLength={10}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="login-pin" className="form-label small fw-semibold text-muted">
            PIN
          </label>
          <input
            id="login-pin"
            type="password"
            className="form-control form-control-lg rounded-3"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoComplete="current-password"
            maxLength={8}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold"
          disabled={loading}
        >
          {loading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
          Sign in
        </button>
      </form>

      <p className="text-center small text-muted mt-4 mb-0">
        New to BoloBill?{" "}
        <Link to="/signup" className="fw-semibold text-decoration-none">
          Request access
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
