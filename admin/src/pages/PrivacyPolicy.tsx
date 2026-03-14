import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-white border-bottom py-3">
        <div className="container">
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-muted text-decoration-none small">
            <i className="ti ti-arrow-left" aria-hidden />
            Back to home
          </Link>
        </div>
      </header>
      <main className="container py-5">
        <div className="legal-page mx-auto" style={{ maxWidth: 720 }}>
          <h1 className="h3 fw-bold mb-2">Privacy Policy</h1>
          <p className="text-muted small mb-4">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

          <section className="mb-4">
            <h2 className="h6 fw-bold mb-2">1. Introduction</h2>
            <p className="small text-secondary mb-0">
              Bolo Bill (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use, store, and protect your information when you use our app and services.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h6 fw-bold mb-2">2. Information we collect</h2>
            <p className="small text-secondary mb-2">We may collect:</p>
            <ul className="small text-secondary mb-0">
              <li>Account information (e.g. phone number, name, business name) that you provide when you sign up.</li>
              <li>Usage data (e.g. how you use the app, invoices created, voice usage) to provide and improve our services.</li>
              <li>Device information (e.g. device type, OS) where necessary for the app to function.</li>
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="h6 fw-bold mb-2">3. How we use your information</h2>
            <p className="small text-secondary mb-0">
              We use the information to provide, maintain, and improve Bolo Bill; to process your requests; to send you service-related communications; and to comply with applicable law. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h6 fw-bold mb-2">4. Data storage and security</h2>
            <p className="small text-secondary mb-0">
              We store your data securely and take reasonable measures to protect it from unauthorized access, loss, or misuse. Data may be stored on servers that we or our service providers operate.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h6 fw-bold mb-2">5. Your rights</h2>
            <p className="small text-secondary mb-0">
              You may request access to, correction of, or deletion of your personal data where applicable by law. You can contact us at useaifasthere@gmail.com for any privacy-related requests.
            </p>
          </section>

          <section className="mb-4">
            <h2 className="h6 fw-bold mb-2">6. Changes to this policy</h2>
            <p className="small text-secondary mb-0">
              We may update this Privacy Policy from time to time. We will post the updated policy on this page and update the Last updated date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="h6 fw-bold mb-2">7. Contact</h2>
            <p className="small text-secondary mb-0">
              For questions about this Privacy Policy or our practices, contact us at <a href="mailto:useaifasthere@gmail.com" className="text-primary">useaifasthere@gmail.com</a>.
            </p>
          </section>

          <p className="mt-4 pt-3 border-top small text-muted">
            <Link to="/" className="text-decoration-none">← Back to Bolo Bill</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
