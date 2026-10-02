import { Link } from "react-router-dom";
import AuthScreenLayout from "../components/AuthScreenLayout";

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";

const STEPS = [
  {
    icon: "ti ti-message-circle",
    title: "Contact BoloBill",
    desc: "Tell us about your kirana or retail shop and subscription plan.",
  },
  {
    icon: "ti ti-user-check",
    title: "Get credentials",
    desc: "We create your merchant login — phone number and temporary PIN.",
  },
  {
    icon: "ti ti-receipt",
    title: "Start billing",
    desc: "Log in here, change your PIN in Settings, and bill from the browser.",
  },
];

export default function SignupPage() {
  const mailHref = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent("BoloBill shop access")}`
    : undefined;

  return (
    <AuthScreenLayout
      badge="Shop onboarding"
      title="Get BoloBill for your shop"
      subtitle="We onboard businesses after subscription — no self-signup or OTP on this panel."
      formHeading="Request access"
      formLead="Contact us to subscribe and receive your shop credentials."
    >
      <div className="marketing-steps mb-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="marketing-step-row">
            <span className="marketing-step-index">{i + 1}</span>
            <div>
              <p className="marketing-step-title mb-1">
                <i className={`${step.icon} me-1`} aria-hidden />
                {step.title}
              </p>
              <p className="marketing-step-desc mb-0">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {contactEmail ? (
        <a
          href={mailHref}
          className="btn w-100 marketing-submit-btn fw-semibold d-inline-flex align-items-center justify-content-center gap-2">
          <i className="ti ti-mail" aria-hidden />
          Email {contactEmail}
        </a>
      ) : (
        <div className="marketing-info-box small">
          Set <code>VITE_CONTACT_EMAIL</code> in your deployment env, or use the contact
          section on the home page.
        </div>
      )}

      <p className="text-center small marketing-muted mt-4 mb-0">
        Already have credentials?{" "}
        <Link to="/login" className="marketing-inline-link fw-semibold">
          Log in
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
