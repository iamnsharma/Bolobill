import { Link } from "react-router-dom";
import AuthScreenLayout from "../components/AuthScreenLayout";
import bolobillLogo from "../assets/images/bolobill-logo.png";

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";

export default function SignupPage() {
  const mailHref = contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent("BoloBill shop access")}` : undefined;

  return (
    <AuthScreenLayout
      title="Get BoloBill for your shop"
      subtitle="We onboard shops after subscription — no self-signup or OTP on this panel"
    >
      <div className="text-center mb-4">
        <Link to="/" className="d-inline-block" aria-label="BoloBill">
          <img src={bolobillLogo} alt="Bolo Bill" className="auth-logo mb-2" style={{ maxWidth: 80 }} />
        </Link>
      </div>

      <div className="rounded-3 bg-light p-4 mb-4 small">
        <ol className="mb-0 ps-3">
          <li className="mb-2">Contact us to subscribe for your kirana or retail shop.</li>
          <li className="mb-2">We create your business login (phone + temporary PIN).</li>
          <li>Sign in here and change your PIN under Settings.</li>
        </ol>
      </div>

      {contactEmail ? (
        <a
          href={mailHref}
          className="btn btn-primary btn-lg w-100 rounded-3 py-3 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
        >
          <i className="ti ti-mail" aria-hidden />
          Email {contactEmail}
        </a>
      ) : (
        <p className="text-center text-muted small mb-0">
          Set <code className="small">VITE_CONTACT_EMAIL</code> in your deployment env, or reach us through the
          contact section on the home page.
        </p>
      )}

      <p className="text-center small text-muted mt-4 mb-0">
        Already have credentials?{" "}
        <Link to="/login" className="fw-semibold text-decoration-none">
          Log in
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
