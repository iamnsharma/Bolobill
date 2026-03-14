import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import bolobillLogo from "../assets/images/bolobill-logo.png";
import feat1 from "../assets/images/features/bb1.png";
import feat2 from "../assets/images/features/bb2.png";
import feat3 from "../assets/images/features/bb3.png";
import feat4 from "../assets/images/features/bb4.png";
import feat7 from "../assets/images/features/bb7-analytics.png";
import feat9 from "../assets/images/features/bb9-whatsapp-bill-share.png";

const FEATURES = [
  {
    img: feat1,
    icon: "ti-microphone",
    title: "Voice to invoice",
    desc: "Just speak items and prices — your bill is ready in seconds. No typing, no register book.",
  },
  {
    img: feat2,
    icon: "ti-file-invoice",
    title: "Digital bills & PDF",
    desc: "Professional invoices every time. Download as PDF or share directly to your customer.",
  },
  {
    img: feat3,
    icon: "ti-package",
    title: "Manage stock",
    desc: "Know what's in and what's out. Out-of-stock lists and restock reminders made easy.",
  },
  {
    img: feat4,
    icon: "ti-dashboard",
    title: "One dashboard",
    desc: "Sales, bills, and reports in one place. No switching between apps or notebooks.",
  },
  {
    img: feat7,
    icon: "ti-chart-bar",
    title: "Sales & analytics",
    desc: "See your day, week, and month at a glance. Track what sells and when.",
  },
  {
    img: feat9,
    icon: "ti-brand-whatsapp",
    title: "Share on WhatsApp",
    desc: "Send the bill to your customer in one tap. They get it on their phone instantly.",
  },
];

const CONTACT_EMAIL = "useaifasthere@gmail.com";
const INSTAGRAM = "https://instagram.com";
const LINKEDIN = "https://linkedin.com";
const DEFAULT_PLAY = "https://play.google.com/store/apps";
const DEFAULT_APPLE = "https://apps.apple.com/app";

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.landingSection;
          if (entry.isIntersecting && id) setVisible((v) => new Set(v).add(id));
        });
      },
      { rootMargin: "-60px 0px -40px 0px", threshold: 0.08 },
    );
    const els = root.querySelectorAll("[data-landing-section]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page" ref={pageRef}>
      <header
        className={`landing-header ${scrolled ? "landing-header--scrolled" : ""}`}>
        <div className="container">
          <div className="landing-header-inner">
            <Link
              to="/"
              className="landing-logo text-decoration-none text-dark">
              {/* <img
                src={bolobillLogo}
                alt="Bolo Bill"
                className="landing-logo-img"
              /> */}
              <span className="landing-logo-text">Bolo Bill</span>
            </Link>
            <nav className="d-flex align-items-center gap-2 gap-md-3">
              <a
                href="#landing-trial"
                className="landing-header-trial text-nowrap">
                <i className="ti ti-gift me-1" aria-hidden />2 days free trial
              </a>
              <Link
                to="/login"
                className="btn btn-outline-primary rounded-3 landing-header-btn">
                Log in
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary rounded-3 landing-header-btn">
                Sign up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="landing-hero landing-hero-animate" aria-label="Hero">
        <div className="landing-hero-bg" />
        <div className="container position-relative">
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="landing-hero-badge">
                Digital billing for every shop
              </span>
              <h1 className="landing-hero-title">
                Create bills with voice. Share on WhatsApp. Manage stock.
              </h1>
              <p className="landing-hero-sub">
                Bolo Bill helps kirana and small businesses create professional
                invoices in seconds — no typing, no paper. Get your shop on one
                app.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mt-4 landing-hero-cta-group">
                <Link
                  to="/signup"
                  className="btn btn-primary btn-lg rounded-3 fw-semibold landing-hero-btn">
                  Get started free
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-lg rounded-3 fw-semibold landing-hero-btn">
                  Log in
                </Link>
              </div>
            </div>
            <div className="col-lg-6 mt-5 mt-lg-0 text-center landing-hero-visual-wrap">
              <div className="landing-hero-visual landing-hero-youtube rounded-4 overflow-hidden shadow-lg">
                <iframe
                  src="https://www.youtube.com/embed/IviyiULyjzI?rel=0"
                  title="Bolo Bill – Voice to bill, Share on WhatsApp"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="landing-hero-youtube-iframe"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-trust py-4" aria-label="Why Bolo Bill">
        <div className="container">
          <div className="landing-trust-inner d-flex flex-wrap justify-content-center gap-3 gap-md-4 align-items-center">
            <span className="landing-trust-pill">
              <i className="ti ti-microphone me-2" aria-hidden />
              Voice billing
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-brand-whatsapp me-2" aria-hidden />
              WhatsApp bills
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-credit-card-off me-2" aria-hidden />
              No card for trial
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-bolt me-2" aria-hidden />
              Simple setup
            </span>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-benefits py-5 ${visible.has("benefits") ? "landing-in-view" : ""}`}
        data-landing-section="benefits"
        aria-label="Benefits">
        <div className="container py-4">
          <span className="landing-section-badge">For shopkeepers</span>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="landing-section-title">
                Built for kirana & small shops
              </h2>
              <p className="landing-section-sub text-muted mb-4">
                One app for billing, stock, and sales — so you spend less time
                on paperwork and more time with customers.
              </p>
              <ul className="landing-benefits-list">
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Create bills by voice or by typing — your choice.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Send invoice to customer on WhatsApp instantly.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Track out-of-stock items and restock easily.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>See daily and monthly sales at a glance.</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6 text-center">
              <div className="landing-benefits-visual rounded-4 overflow-hidden shadow-sm">
                <img src={feat4} alt="Dashboard" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-features py-5 ${visible.has("features") ? "landing-in-view" : ""}`}
        data-landing-section="features"
        aria-label="Features">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="landing-section-badge">Features</span>
            <h2 className="landing-section-title">
              Everything you need in one app
            </h2>
            <p className="landing-section-sub text-muted mx-auto">
              Voice-to-invoice, digital bills, stock lists, and WhatsApp share —
              no register book, no extra apps.
            </p>
          </div>
          <div className="row g-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="col-md-6 col-lg-4 landing-feature-col">
                <div
                  className="landing-feature-card card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                  style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="landing-feature-icon-wrap">
                    <i className={`ti ${f.icon}`} aria-hidden />
                  </div>
                  <div className="landing-feature-img-wrap">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="landing-feature-img"
                    />
                  </div>
                  <div className="card-body p-4">
                    <h3 className="h6 fw-bold mb-2">{f.title}</h3>
                    <p className="small text-muted mb-0">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-how py-5 bg-light ${visible.has("how") ? "landing-in-view" : ""}`}
        data-landing-section="how"
        aria-label="How it works">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="landing-section-badge">3 steps</span>
            <h2 className="landing-section-title">Simple from day one</h2>
            <p className="landing-section-sub text-muted mx-auto">
              Sign up, add your business, and start creating bills. No training
              needed.
            </p>
          </div>
          <div className="row g-4 text-center">
            <div className="col-md-4 landing-step-col">
              <div className="landing-step rounded-3 p-4 h-100 bg-white shadow-sm">
                <span className="landing-step-num">1</span>
                <h3 className="h6 fw-bold mt-2 mb-2">Sign up</h3>
                <p className="small text-muted mb-0">
                  Create your account with phone and business name.
                </p>
              </div>
            </div>
            <div className="col-md-4 landing-step-col">
              <div className="landing-step rounded-3 p-4 h-100 bg-white shadow-sm">
                <span className="landing-step-num">2</span>
                <h3 className="h6 fw-bold mt-2 mb-2">Speak or type</h3>
                <p className="small text-muted mb-0">
                  Create bills by voice or add items manually.
                </p>
              </div>
            </div>
            <div className="col-md-4 landing-step-col">
              <div className="landing-step rounded-3 p-4 h-100 bg-white shadow-sm">
                <span className="landing-step-num">3</span>
                <h3 className="h6 fw-bold mt-2 mb-2">Share & grow</h3>
                <p className="small text-muted mb-0">
                  Send PDF to customers on WhatsApp. Track sales.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="landing-trial"
        className={`landing-section landing-trial py-5 ${visible.has("trial") ? "landing-in-view" : ""}`}
        data-landing-section="trial"
        aria-label="Free trial">
        <div className="container py-3">
          <span className="landing-section-badge d-inline-block mb-3">
            Try free
          </span>
          <div className="landing-trial-card rounded-4 overflow-hidden shadow-lg position-relative">
            <div className="landing-trial-bg" aria-hidden />
            <div className="landing-trial-inner position-relative py-4 py-md-5 px-3 px-md-4">
              <div className="row align-items-center">
                <div className="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
                  <span className="landing-trial-badge">No card required</span>
                  <h2 className="landing-trial-title">
                    Start with a 2-day free trial
                  </h2>
                  <p className="landing-trial-sub text-white opacity-90 mb-4">
                    Try Bolo Bill free. Create invoices and use voice billing —
                    no commitment.
                  </p>
                  <div className="landing-trial-limits d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start align-items-center">
                    <span className="landing-trial-limit">
                      <i className="ti ti-receipt me-2" aria-hidden />
                      <strong>30 invoices</strong>
                    </span>
                    <span className="landing-trial-limit-divider d-none d-sm-inline text-white opacity-50">
                      or
                    </span>
                    <span className="landing-trial-limit">
                      <i className="ti ti-microphone me-2" aria-hidden />
                      <strong>15 min voice</strong>
                    </span>
                  </div>
                </div>
                <div className="col-lg-5 text-center text-lg-end">
                  <Link
                    to="/signup"
                    className="landing-trial-cta btn btn-light btn-lg rounded-3 px-4 py-3 fw-semibold shadow d-inline-flex align-items-center gap-2">
                    <i className="ti ti-rocket" aria-hidden />
                    Start free trial
                  </Link>
                  <p className="landing-trial-note text-white opacity-75 small mt-3 mb-0">
                    Sign up in 30 seconds · No payment now
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* <div className="landing-trial-explain mt-4">
            <h3 className="h6 fw-bold mb-3">How the 2-day free trial works</h3>
            <ul className="landing-trial-explain-list">
              <li><strong>2 days free</strong> — Full access to create bills, use voice billing, and share on WhatsApp.</li>
              <li><strong>30 invoices or 15 minutes voice</strong> — Trial limit: use up to 30 invoices or 15 minutes of voice-to-bill (whichever you hit first).</li>
              <li><strong>No card required</strong> — Sign up with your phone and business name. No payment details needed to start.</li>
              <li><strong>Avail anytime</strong> — Click “Start free trial” or “Sign up” to begin. After trial, choose a plan to continue.</li>
            </ul>
          </div> */}
        </div>
      </section>

      <section
        className={`landing-section landing-app py-5 ${visible.has("app") ? "landing-in-view" : ""}`}
        data-landing-section="app"
        aria-label="Download app">
        <div className="container py-4">
          <span className="landing-section-badge d-inline-block mb-3">
            Get the app
          </span>
          <div className="landing-app-card rounded-4 overflow-hidden shadow-lg position-relative">
            <div className="landing-app-bg" />
            <div className="row align-items-center position-relative py-5 px-4">
              <div className="col-lg-6 text-center text-lg-start text-white mb-4 mb-lg-0">
                <h2 className="landing-app-title mb-2">Bolo Bill on mobile</h2>
                <p className="landing-app-text opacity-90 mb-4">
                  Create bills with voice, share invoices on WhatsApp, and
                  manage out-of-stock lists — all from your phone.
                </p>
                <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                  <a
                    href={DEFAULT_PLAY}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-light btn-lg rounded-3 px-4 d-inline-flex align-items-center gap-2">
                    <i className="ti ti-brand-android fs-4" />
                    Get on Android
                  </a>
                  <a
                    href={DEFAULT_APPLE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-light btn-lg rounded-3 px-4 d-inline-flex align-items-center gap-2">
                    <i className="ti ti-brand-apple fs-4" />
                    Get on iOS
                  </a>
                </div>
              </div>
              <div className="col-lg-6 text-center">
                <div className="landing-app-phone rounded-4 overflow-hidden d-inline-block shadow">
                  <img
                    src={feat4}
                    alt="App"
                    style={{ maxWidth: 280, width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-cta-final py-5 ${visible.has("cta") ? "landing-in-view" : ""}`}
        data-landing-section="cta"
        aria-label="Get started">
        <div className="container py-4 text-center">
          <h2 className="landing-cta-final-title">Ready to try Bolo Bill?</h2>
          <p className="landing-cta-final-sub text-muted mb-4">
            Join shopkeepers who bill faster with voice and WhatsApp.
          </p>
          <Link
            to="/signup"
            className="btn btn-primary btn-lg rounded-3 fw-semibold landing-hero-btn landing-cta-final-btn">
            Get started free
          </Link>
        </div>
      </section>

      <section
        className={`landing-section landing-contact py-5 bg-light ${visible.has("contact") ? "landing-in-view" : ""}`}
        data-landing-section="contact"
        aria-label="Contact">
        <div className="container py-4 text-center">
          <span className="landing-section-badge d-inline-block mb-2">
            Contact
          </span>
          <h2 className="landing-section-title mb-2">Get in touch</h2>
          <p className="text-muted mb-4">
            Questions or feedback? We’d love to hear from you.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-4 align-items-center">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-decoration-none text-dark d-flex align-items-center gap-2">
              <i className="ti ti-mail fs-4 text-primary" />
              <span>{CONTACT_EMAIL}</span>
            </a>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-dark d-flex align-items-center gap-2"
              aria-label="Instagram">
              <i className="ti ti-brand-instagram fs-4 text-primary" />
              <span>Instagram</span>
            </a>
            <a
              href={LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-dark d-flex align-items-center gap-2"
              aria-label="LinkedIn">
              <i className="ti ti-brand-linkedin fs-4 text-primary" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="landing-footer py-4">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 gap-md-4 small text-muted">
            <span className="d-none d-md-inline">
              &copy; {new Date().getFullYear()} Bolo Bill. Digital billing for
              every shop.
            </span>
            <Link
              to="/privacy-policy"
              className="text-muted text-decoration-none">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted text-decoration-none">
              Terms & Conditions
            </Link>
          </div>
          <p className="text-center text-muted small mb-0 mt-2 d-md-none">
            &copy; {new Date().getFullYear()} Bolo Bill
          </p>
        </div>
      </footer>
    </div>
  );
}
