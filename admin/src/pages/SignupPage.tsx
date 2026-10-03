import { Link } from "react-router-dom";
import AuthScreenLayout from "../components/AuthScreenLayout";
import ConnectWhatsAppButton from "../components/marketing/ConnectWhatsAppButton";
import {
  BOLOBILL_ACCESS_WHATSAPP_MESSAGE,
  BOLOBILL_CONTACT_EMAIL,
} from "../config/contact";

const STEPS = [
  {
    icon: "ti ti-message-circle",
    title: "Contact BoloBill",
    desc: "Tell us about your business and the plan you need.",
  },
  {
    icon: "ti ti-user-check",
    title: "Get credentials",
    desc: "We create your business login — phone number and temporary PIN.",
  },
  {
    icon: "ti ti-receipt",
    title: "Start billing",
    desc: "Log in here, change your PIN in Settings, and bill from the browser.",
  },
];

export default function SignupPage() {
  const mailHref = `mailto:${BOLOBILL_CONTACT_EMAIL}?subject=${encodeURIComponent("BoloBill business access")}`;

  return (
    <AuthScreenLayout
      badge="Business onboarding"
      title="Get BoloBill for your business"
      subtitle="We onboard your business after subscription — no self-signup or OTP on this panel."
      formHeading="Request access"
      formLead="Contact us to subscribe and receive your login credentials."
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

      <div className="d-flex flex-column gap-2">
        <ConnectWhatsAppButton prefillMessage={BOLOBILL_ACCESS_WHATSAPP_MESSAGE} />
        <a
          href={mailHref}
          className="btn w-100 marketing-submit-btn fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
        >
          <i className="ti ti-mail" aria-hidden />
          Email {BOLOBILL_CONTACT_EMAIL}
        </a>
      </div>

      <p className="text-center small marketing-muted mt-4 mb-0">
        Already have credentials?{" "}
        <Link to="/login" className="marketing-inline-link fw-semibold">
          Log in
        </Link>
      </p>
    </AuthScreenLayout>
  );
}
