import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
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
        setError("Only project admin and business accounts can sign in here. If you registered as a business in the BoloBill app, use the same phone and PIN.");
      } else {
        setError(msg || "Invalid phone or PIN.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div
        className="card shadow-lg border-0 rounded-3"
        style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center gap-2 mb-3">
              <span className="icon-shape icon-md bg-primary text-white rounded-2">
                <i className="ti ti-receipt fs-4" />
              </span>
              <span className="fs-4 fw-bold text-dark">BoloBill Admin</span>
            </div>
            <p className="text-muted small mb-0">
              Superadmin: project owner. Business: sign in with the same phone and PIN you set in the BoloBill app.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-3">
            {error && (
              <div className="alert alert-danger py-2 small" role="alert">
                {error}
              </div>
            )}
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                className="form-control form-control-lg"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label htmlFor="pin" className="form-label">
                PIN
              </label>
              <input
                id="pin"
                type="password"
                className="form-control form-control-lg"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="off"
                maxLength={8}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 rounded-2"
              disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : null}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
