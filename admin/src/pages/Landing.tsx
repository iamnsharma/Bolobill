import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";
const INSTAGRAM = import.meta.env.VITE_INSTAGRAM_URL?.trim() || "";
const LINKEDIN = import.meta.env.VITE_LINKEDIN_URL?.trim() || "";

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
              <a href="#landing-contact" className="landing-header-trial text-nowrap">
                <i className="ti ti-building-store me-1" aria-hidden />
                For shops
              </a>
              <Link
                to="/login"
                className="btn btn-outline-primary rounded-3 landing-header-btn">
                Log in
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary rounded-3 landing-header-btn">
                Get access
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
                invoices in seconds — no typing, no paper. Run billing from your browser.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mt-4 landing-hero-cta-group">
                <Link
                  to="/signup"
                  className="btn btn-primary btn-lg rounded-3 fw-semibold landing-hero-btn">
                  Request shop access
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline-light btn-lg rounded-3 fw-semibold landing-hero-btn">
                  Merchant login
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
              <i className="ti ti-lock me-2" aria-hidden />
              Secure merchant login
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
        id="landing-contact"
        className={`landing-section landing-trial py-5 ${visible.has("onboard") ? "landing-in-view" : ""}`}
        data-landing-section="onboard"
        aria-label="Shop onboarding">
        <div className="container py-3">
          <span className="landing-section-badge d-inline-block mb-3">
            How it works
          </span>
          <div className="landing-trial-card rounded-4 overflow-hidden shadow-lg position-relative">
            <div className="landing-trial-bg" aria-hidden />
            <div className="landing-trial-inner position-relative py-4 py-md-5 px-3 px-md-4">
              <div className="row align-items-center">
                <div className="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
                  <span className="landing-trial-badge">B2B onboarding</span>
                  <h2 className="landing-trial-title">
                    We set up your shop account for you
                  </h2>
                  <p className="landing-trial-sub text-white opacity-90 mb-4">
                    Subscribe with BoloBill, get phone + PIN credentials, then bill from the merchant web panel.
                    Change your PIN anytime in Settings.
                  </p>
                  <ul className="landing-trial-limits list-unstyled text-white opacity-90 mb-0 small">
                    <li className="mb-2">
                      <i className="ti ti-check me-2" aria-hidden />
                      No OTP signup — credentials issued after payment
                    </li>
                    <li>
                      <i className="ti ti-check me-2" aria-hidden />
                      WhatsApp bill links for customers (Meta API coming later)
                    </li>
                  </ul>
                </div>
                <div className="col-lg-5 text-center text-lg-end">
                  <Link
                    to="/signup"
                    className="landing-trial-cta btn btn-light btn-lg rounded-3 px-4 py-3 fw-semibold shadow d-inline-flex align-items-center gap-2">
                    <i className="ti ti-mail" aria-hidden />
                    Contact for access
                  </Link>
                  <p className="landing-trial-note text-white opacity-75 small mt-3 mb-0">
                    Already onboarded?{" "}
                    <Link to="/login" className="text-white fw-semibold">
                      Log in
                    </Link>
                  </p>
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
          <h2 className="landing-cta-final-title">Ready for digital billing?</h2>
          <p className="landing-cta-final-sub text-muted mb-4">
            Talk to us to onboard your shop, or log in if you already have credentials.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg rounded-3 fw-semibold landing-hero-btn landing-cta-final-btn">
              Request access
            </Link>
            <Link
              to="/login"
              className="btn btn-outline-primary btn-lg rounded-3 fw-semibold landing-hero-btn">
              Log in
            </Link>
          </div>
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
            {CONTACT_EMAIL ? (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-decoration-none text-dark d-flex align-items-center gap-2">
                <i className="ti ti-mail fs-4 text-primary" />
                <span>{CONTACT_EMAIL}</span>
              </a>
            ) : null}
            {INSTAGRAM ? (
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-dark d-flex align-items-center gap-2"
                aria-label="Instagram">
                <i className="ti ti-brand-instagram fs-4 text-primary" />
                <span>Instagram</span>
              </a>
            ) : null}
            {LINKEDIN ? (
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none text-dark d-flex align-items-center gap-2"
                aria-label="LinkedIn">
                <i className="ti ti-brand-linkedin fs-4 text-primary" />
                <span>LinkedIn</span>
              </a>
            ) : null}
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
