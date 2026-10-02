import { Link } from "react-router-dom";
import LegalPageLayout from "../components/marketing/LegalPageLayout";

export default function TermsConditions() {
  const updated = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <LegalPageLayout title="Terms & Conditions">
      <p className="text-muted small mb-4">Last updated: {updated}</p>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">1. Acceptance of terms</h2>
        <p className="small text-secondary mb-0">
          By accessing or using Bolo Bill (&quot;the Service&quot;), you agree to be bound by these Terms & Conditions. If you do not agree, do not use the Service.
        </p>
      </section>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">2. Description of service</h2>
        <p className="small text-secondary mb-0">
          Bolo Bill provides digital billing, voice-to-invoice, and related tools for businesses. We may change, suspend, or discontinue features with reasonable notice where feasible.
        </p>
      </section>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">3. Account and use</h2>
        <p className="small text-secondary mb-0">
          You must provide accurate information when signing up. You are responsible for keeping your account credentials secure and for all activity under your account. You must use the Service in compliance with applicable laws and not misuse or attempt to harm the Service or other users.
        </p>
      </section>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">4. Free trial and subscriptions</h2>
        <p className="small text-secondary mb-0">
          We may offer a free trial (e.g. 2 days) with limits such as a cap on invoices or voice usage. After the trial, paid plans may be required to continue. Subscription terms, pricing, and limits are as described at the time of sign-up or on our app/website.
        </p>
      </section>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">5. Intellectual property</h2>
        <p className="small text-secondary mb-0">
          Bolo Bill and its content, branding, and technology are owned by us or our licensors. You may not copy, modify, or reverse-engineer our Service except as permitted by us or by law.
        </p>
      </section>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">6. Limitation of liability</h2>
        <p className="small text-secondary mb-0">
          The Service is provided &quot;as is&quot;. To the fullest extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid us in the twelve months before the claim.
        </p>
      </section>

      <section className="legal-section mb-4">
        <h2 className="h6 fw-bold mb-2">7. Changes to terms</h2>
        <p className="small text-secondary mb-0">
          We may update these Terms from time to time. We will post the updated Terms on this page and update the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance of the updated Terms.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="h6 fw-bold mb-2">8. Contact</h2>
        <p className="small text-secondary mb-0">
          For questions about these Terms & Conditions, contact us at{" "}
          <a href="mailto:useaifasthere@gmail.com" className="marketing-inline-link">useaifasthere@gmail.com</a>.
        </p>
      </section>

      <p className="mt-4 pt-3 border-top small text-muted mb-0">
        <Link to="/" className="marketing-inline-link">← Back to Bolo Bill</Link>
      </p>
    </LegalPageLayout>
  );
}
