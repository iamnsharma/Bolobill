import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useGuestMode } from "../contexts/GuestModeContext";
import feat1 from "../assets/images/features/bb1.png";
import feat2 from "../assets/images/features/bb2.png";
import feat3 from "../assets/images/features/bb3.png";
import feat4 from "../assets/images/features/bb4.png";
import feat7 from "../assets/images/features/bb7-analytics.png";
import feat9 from "../assets/images/features/bb9-whatsapp-bill-share.png";
import YouTubeEmbed from "../components/landing/YouTubeEmbed";
import MarketingBackdrop from "../components/marketing/MarketingBackdrop";
import MarketingHeader from "../components/marketing/MarketingHeader";
import ConnectWhatsAppButton from "../components/marketing/ConnectWhatsAppButton";
import { BOLOBILL_CONTACT_EMAIL } from "../config/contact";
import { OFFLINE_TO_ONLINE_LINE, PRODUCT_TAGLINE_SHORT } from "../config/productCopy";

const FEATURES = [
  {
    img: feat2,
    icon: "ti-receipt-2",
    title: "Create bills fast",
    desc: "Pick items from your catalog, adjust quantities, and bill in a few taps — products or services, any category.",
    highlight: true,
    bullets: ["Stock-linked line items", "Clear totals for customers", "Phone or desktop"],
  },
  {
    img: feat9,
    icon: "ti-brand-whatsapp",
    title: "Share on WhatsApp",
    desc: "Send a clean bill link or PDF in one tap so customers get a clear digital record, not a paper slip.",
    highlight: true,
    bullets: ["Instant delivery on phone", "Professional digital bills", "Customers can save & share"],
  },
  {
    img: feat7,
    icon: "ti-chart-bar",
    title: "Sales & analytics",
    desc: "See today, this week, and this month without manual tally sheets — know what sells and when.",
    highlight: true,
    bullets: ["Daily totals at a glance", "Spot busy hours", "Plan stock smarter"],
  },
  {
    img: feat1,
    icon: "ti-file-invoice",
    title: "Digital bills & PDF",
    desc: "Every invoice looks consistent — download PDF or share digitally anytime.",
  },
  {
    img: feat3,
    icon: "ti-package",
    title: "Manage stock",
    desc: "Track inventory levels, flag out-of-stock items, and reorder before you run out.",
  },
  {
    img: feat4,
    icon: "ti-dashboard",
    title: "One dashboard",
    desc: "Billing, inventory, and reports in one web panel — no juggling apps.",
  },
  {
    img: feat2,
    icon: "ti-wallet",
    title: "Credit & khata",
    desc: "Cash or credit on every bill. Track pending balance by phone and record payments.",
  },
  {
    img: feat3,
    icon: "ti-sparkles",
    title: "Smart bulk import",
    desc: "Add many items at once from a menu photo, spreadsheet, or list — check everything before it goes live.",
  },
  {
    img: feat1,
    icon: "ti-file-import",
    title: "Stock & shortage lists",
    desc: "Bring products in from a file or pasted list — we flag what you already have so you don’t double-enter.",
  },
  {
    img: feat4,
    icon: "ti-language",
    title: "Multi-language panel",
    desc: "English, Hindi, Punjabi, Spanish, and regional English — switch anytime in Settings.",
  },
];

const FEATURE_MATRIX = [
  { label: "Digital bills & PDF", on: true },
  { label: "WhatsApp bill share", on: true },
  { label: "Credit / khata by phone", on: true },
  { label: "Add menu & stock in bulk", on: true },
  { label: "Spreadsheet or paste import", on: true },
  { label: "Out-of-stock lists", on: true },
  { label: "Hide revenue & inventory PIN", on: true },
  { label: "Address book", on: true },
  { label: "Payment QR on bills", on: true },
  { label: "Sales & items-sold reports", on: true },
  { label: "Public bill link", on: true },
];

const INSTAGRAM = import.meta.env.VITE_INSTAGRAM_URL?.trim() || "";
const LINKEDIN = import.meta.env.VITE_LINKEDIN_URL?.trim() || "";

const highlightFeatures = FEATURES.filter((f) => f.highlight);
const gridFeatures = FEATURES.filter((f) => !f.highlight);

const AI_SPOTLIGHT_ITEMS = [
  {
    icon: "ti-file-import",
    title: "From file or list",
    desc: "Upload a spreadsheet, paste rows, or share a shortage list — Bolo Bill turns it into line items.",
  },
  {
    icon: "ti-sparkles",
    title: "Help from AI",
    desc: "Snap a menu or list photo when that’s quicker than typing — you still approve every item.",
  },
  {
    icon: "ti-git-compare",
    title: "Fewer duplicates",
    desc: "See what’s new and what’s already in your shop before you save.",
  },
  {
    icon: "ti-checkbox",
    title: "You stay in control",
    desc: "Fix names and prices on the review screen — nothing updates until you tap save.",
  },
];

const CREDIT_VISUAL_TILES = [
  { icon: "ti-cash", label: "Cash bill", tone: "cash" },
  { icon: "ti-credit-card", label: "Credit bill", tone: "credit" },
  { icon: "ti-phone", label: "Khata by phone", tone: "phone" },
  { icon: "ti-list-details", label: "Ledger", tone: "ledger" },
  { icon: "ti-brand-whatsapp", label: "Reminders", tone: "wa" },
];

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enterGuestMode } = useGuestMode();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const pageRef = useRef<HTMLDivElement>(null);

  const startGuestDemo = () => {
    enterGuestMode();
    navigate("/dashboard", { replace: true });
  };

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
      <MarketingHeader scrolled={scrolled} />

      <section className="landing-hero landing-hero-animate" aria-label="Hero">
        <MarketingBackdrop intensity="hero" />
        <div className="landing-hero-bg" />
        <div className="container position-relative">
          <div className="row align-items-center min-vh-75 py-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="landing-hero-badge">
                {PRODUCT_TAGLINE_SHORT}
              </span>
              <h1 className="landing-hero-title">
                Bill faster. Share on WhatsApp. Run your business smarter.
              </h1>
              <p className="landing-hero-sub">
                Bolo Bill is a web panel for any store or clinic — digital bills, live
                inventory, and sales insights in one place. {OFFLINE_TO_ONLINE_LINE}
              </p>
              <div
                className="landing-hero-ai-tags d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start mt-3"
                aria-label="Product highlights">
                <span className="landing-hero-ai-tag">
                  <i className="ti ti-sparkles" aria-hidden />
                  Add stock faster
                </span>
                <span className="landing-hero-ai-tag">
                  <i className="ti ti-wallet" aria-hidden />
                  Credit khata
                </span>
                <span className="landing-hero-ai-tag">
                  <i className="ti ti-brand-whatsapp" aria-hidden />
                  WhatsApp bills
                </span>
              </div>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mt-4 landing-hero-cta-group">
                <Link
                  to="/signup"
                  className="btn btn-primary btn-lg rounded-3 fw-semibold landing-hero-btn">
                  Request business access
                </Link>
                <button
                  type="button"
                  onClick={startGuestDemo}
                  className="btn btn-light btn-lg rounded-3 fw-semibold landing-hero-btn landing-hero-btn--guest">
                  <i className="ti ti-device-laptop me-1" aria-hidden />
                  {t("landing.guestCta")}
                </button>
                <a
                  href="#landing-demo"
                  className="btn btn-outline-light btn-lg rounded-3 fw-semibold landing-hero-btn">
                  <i className="ti ti-player-play me-1" aria-hidden />
                  Watch demo
                </a>
              </div>
              <p className="landing-hero-guest-hint small mt-3 mb-0 opacity-90">
                {t("landing.guestCtaSub")}
              </p>
            </div>
            <div
              id="landing-demo"
              className="col-lg-6 mt-5 mt-lg-0 text-center landing-hero-visual-wrap">
              <div className="landing-hero-visual landing-hero-youtube-wrap rounded-4 overflow-hidden shadow-lg">
                <YouTubeEmbed
                  title="Bolo Bill – Billing, WhatsApp share, business dashboard"
                  className="landing-hero-youtube--inset"
                />
              </div>
              <p className="landing-hero-video-caption small mt-3 mb-0">
                2 min overview — billing, WhatsApp share, and business dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-trust py-4" aria-label="Why Bolo Bill">
        <div className="container">
          <div className="landing-trust-inner d-flex flex-wrap justify-content-center gap-3 gap-md-4 align-items-center">
            <span className="landing-trust-pill">
              <i className="ti ti-receipt-2 me-2" aria-hidden />
              Fast billing
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-brand-whatsapp me-2" aria-hidden />
              WhatsApp bills
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-lock me-2" aria-hidden />
              Secure business login
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-bolt me-2" aria-hidden />
              Simple setup
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-sparkles me-2" aria-hidden />
              Smart import
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-wallet me-2" aria-hidden />
              Credit / khata
            </span>
            <span className="landing-trust-pill">
              <i className="ti ti-eye-off me-2" aria-hidden />
              Hide revenue
            </span>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-ai-spotlight py-5 ${visible.has("ai-spotlight") ? "landing-in-view" : ""}`}
        data-landing-section="ai-spotlight"
        aria-label="Smart stock and menu import">
        <div className="container py-4">
          <div className="landing-ai-spotlight-panel rounded-4 overflow-hidden">
            <div className="row g-0 align-items-stretch">
              <div className="col-lg-5 landing-ai-spotlight-copy p-4 p-lg-5">
                <span className="landing-ai-spotlight-badge">
                  <i className="ti ti-sparkles me-1" aria-hidden />
                  Smart import
                </span>
                <h2 className="landing-ai-spotlight-title">
                  Add your whole menu or stock — without typing every line
                </h2>
                <p className="landing-ai-spotlight-sub mb-4">
                  Share a file, paste a list, or use a photo. Bolo Bill lines everything up for you,
                  spots items you already sell, and waits for your OK before updating inventory.
                </p>
                <div className="landing-ai-flow d-flex flex-wrap align-items-center gap-2 small">
                  <span className="landing-ai-flow__step">Add file or photo</span>
                  <i className="ti ti-arrow-right landing-ai-flow__arrow" aria-hidden />
                  <span className="landing-ai-flow__step">Check matches</span>
                  <i className="ti ti-arrow-right landing-ai-flow__arrow" aria-hidden />
                  <span className="landing-ai-flow__step">Review</span>
                  <i className="ti ti-arrow-right landing-ai-flow__arrow" aria-hidden />
                  <span className="landing-ai-flow__step landing-ai-flow__step--accent">Save</span>
                </div>
              </div>
              <div className="col-lg-7 landing-ai-spotlight-grid p-4 p-lg-4">
                <div className="row g-3">
                  {AI_SPOTLIGHT_ITEMS.map((item) => (
                    <div key={item.title} className="col-sm-6">
                      <div className="landing-ai-spotlight-card h-100">
                        <span className="landing-ai-spotlight-card__icon">
                          <i className={`ti ${item.icon}`} aria-hidden />
                        </span>
                        <h3 className="h6 fw-bold mb-1">{item.title}</h3>
                        <p className="small mb-0 opacity-90">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="landing-ai-spotlight-shot mt-3 rounded-3 overflow-hidden">
                  <img
                    src={feat3}
                    alt="Stock and import in Bolo Bill"
                    className="landing-ai-spotlight-shot__img"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="landing-import"
        className={`landing-section landing-ai py-5 ${visible.has("ai") ? "landing-in-view" : ""}`}
        data-landing-section="ai"
        aria-label="Easy stock and menu import">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-6 order-lg-2">
              <span className="landing-section-badge">Bulk add items</span>
              <h2 className="landing-section-title">Update your shop list in minutes</h2>
              <p className="landing-section-sub text-muted mb-4">
                Whether you run a kirana, café, or clinic — add products from a spreadsheet, pasted
                text, or a photo of your menu. You always get a clear review screen before anything
                is saved.
              </p>
              <ul className="landing-benefits-list">
                <li>
                  <i className="ti ti-book-2 text-primary me-2" aria-hidden />
                  <span>
                    <strong>Menu import</strong> — turn a menu sheet or photo into items and
                    categories you can edit.
                  </span>
                </li>
                <li>
                  <i className="ti ti-file-spreadsheet text-primary me-2" aria-hidden />
                  <span>
                    <strong>Stock from spreadsheet</strong> — bring hundreds of products in one
                    go from Excel or similar files.
                  </span>
                </li>
                <li>
                  <i className="ti ti-list-check text-primary me-2" aria-hidden />
                  <span>
                    <strong>Shortage lists</strong> — load what you’re out of so you can share with
                    suppliers or your team.
                  </span>
                </li>
              </ul>
              <p className="landing-ai-footnote small text-muted mb-0">
                In guest demo, sample results are shown on your device only — try it with no login.
              </p>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="landing-import-visual">
                <div className="landing-import-visual__glow" aria-hidden />
                <div className="landing-import-visual__screen rounded-4 shadow">
                  <img src={feat1} alt="Digital billing and imports" className="img-fluid" />
                </div>
                <div className="landing-import-visual__chips">
                  <span className="landing-import-chip">
                    <i className="ti ti-book-2" aria-hidden /> Menu import
                  </span>
                  <span className="landing-import-chip">
                    <i className="ti ti-file-spreadsheet" aria-hidden /> Spreadsheet
                  </span>
                  <span className="landing-import-chip landing-import-chip--ai">
                    <i className="ti ti-sparkles" aria-hidden /> Photo help
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-credit py-5 bg-light ${visible.has("credit") ? "landing-in-view" : ""}`}
        data-landing-section="credit"
        aria-label="Credit and customers">
        <div className="container py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <div className="landing-credit-visual">
                <div className="landing-credit-visual__glow" aria-hidden />
                <div className="landing-credit-visual__screen rounded-4 overflow-hidden shadow">
                  <img src={feat9} alt="WhatsApp bills and customer share" className="img-fluid" />
                </div>
                <div className="landing-credit-mock rounded-3 shadow-sm">
                  <div className="landing-credit-mock__head">
                    <i className="ti ti-wallet" aria-hidden />
                    <span>Pending khata</span>
                  </div>
                  <p className="landing-credit-mock__name mb-1">Priya · 91234 56780</p>
                  <p className="landing-credit-mock__amt mb-0">₹305 due</p>
                </div>
                <ul className="landing-credit-tiles list-unstyled mb-0">
                  {CREDIT_VISUAL_TILES.map((tile) => (
                    <li
                      key={tile.label}
                      className={`landing-credit-tile landing-credit-tile--${tile.tone}`}>
                      <i className={`ti ${tile.icon}`} aria-hidden />
                      <span>{tile.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <span className="landing-section-badge">Credit &amp; customers</span>
              <h2 className="landing-section-title">Cash or credit on every bill</h2>
              <p className="landing-section-sub text-muted mb-4">
                Mark a sale as credit, tie it to a customer phone, and see pending khata in one
                place. Record payments and send WhatsApp reminders when you are ready.
              </p>
              <ul className="landing-benefits-list">
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Credit accounts keyed by phone number.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Ledger of sales and payments per customer.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Address book auto-fills names on repeat visits.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-privacy py-5 ${visible.has("privacy") ? "landing-in-view" : ""}`}
        data-landing-section="privacy"
        aria-label="Privacy and operations">
        <div className="container py-4">
          <div className="row g-4">
            <div className="col-md-6">
              <span className="landing-section-badge">Privacy &amp; ops</span>
              <h2 className="landing-section-title h4">Run the shop without oversharing</h2>
              <p className="text-muted small mb-3">
                Hide revenue and inventory value behind an inventory PIN. Keep contacts in an
                address book, show your UPI QR on bills, and share a public bill link customers
                can open on any phone.
              </p>
            </div>
            <div className="col-md-6">
              <span className="landing-section-badge">Reports</span>
              <h2 className="landing-section-title h4">Know what sold and when</h2>
              <p className="text-muted small mb-3">
                Dashboard KPIs, sales summary by day, and items-sold breakdowns — filtered by date
                range so you can reconcile without spreadsheets.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-benefits py-5 ${visible.has("benefits") ? "landing-in-view" : ""}`}
        data-landing-section="benefits"
        aria-label="Benefits">
        <div className="container py-4">
          <span className="landing-section-badge">For merchants</span>
          <div className="row align-items-center g-4">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="landing-section-title">
                Your team moves fast — your billing should too
              </h2>
              <p className="landing-section-sub text-muted mb-4">
                Whether you sell products or services, everything stays in one panel. No
                duplicate entries, no lost paper bills or stock sheets.
              </p>
              <ul className="landing-benefits-list">
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Create bills from your catalog in a few taps.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>WhatsApp-ready bills customers actually read on their phone.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Out-of-stock lists so you reorder before inventory runs out.</span>
                </li>
                <li>
                  <i className="ti ti-check text-primary me-2" aria-hidden />
                  <span>Daily and monthly sales without end-of-day math.</span>
                </li>
              </ul>
            </div>
            <div className="col-lg-6 text-center">
              <div className="landing-benefits-visual rounded-4 overflow-hidden shadow-sm">
                <img src={feat4} alt="Bolo Bill business dashboard" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="landing-features"
        className={`landing-section landing-spotlight py-5 ${visible.has("spotlight") ? "landing-in-view" : ""}`}
        data-landing-section="spotlight"
        aria-label="Highlighted features">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="landing-section-badge">Core features</span>
            <h2 className="landing-section-title">What merchants use every day</h2>
            <p className="landing-section-sub text-muted mx-auto">
              Three workflows that replace paper bills and manual stock — simple, built for daily use.
            </p>
          </div>
          <div className="row g-4 landing-bento">
            {highlightFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`col-lg-4 landing-bento-col landing-bento-col--${i + 1}`}>
                <article className="landing-bento-card h-100">
                  <div className="landing-bento-card-head">
                    <span className="landing-bento-icon">
                      <i className={`ti ${f.icon}`} aria-hidden />
                    </span>
                    <h3 className="landing-bento-title">{f.title}</h3>
                    <p className="landing-bento-desc">{f.desc}</p>
                    {f.bullets ? (
                      <ul className="landing-bento-bullets">
                        {f.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="landing-bento-img-wrap">
                    <img src={f.img} alt={f.title} className="landing-bento-img" />
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-features py-5 ${visible.has("features") ? "landing-in-view" : ""}`}
        data-landing-section="features"
        aria-label="More features">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="landing-section-badge">And more</span>
            <h2 className="landing-section-title">Everything else in one app</h2>
            <p className="landing-section-sub text-muted mx-auto">
              PDF invoices, stock tracking, and a single dashboard — no extra subscriptions.
            </p>
          </div>
          <div className="row g-4">
            {gridFeatures.map((f, i) => (
              <div key={f.title} className="col-md-6 col-lg-4 landing-feature-col">
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
        className={`landing-section landing-matrix py-5 bg-light ${visible.has("matrix") ? "landing-in-view" : ""}`}
        data-landing-section="matrix"
        aria-label="Feature checklist">
        <div className="container py-3">
          <div className="text-center mb-4">
            <span className="landing-section-badge">At a glance</span>
            <h2 className="landing-section-title h4 mb-0">Everything in the merchant panel</h2>
          </div>
          <ul className="landing-feature-matrix list-unstyled row g-2 justify-content-center">
            {FEATURE_MATRIX.map((row) => (
              <li key={row.label} className="col-md-6 col-lg-4">
                <span className="landing-feature-matrix__item">
                  <i
                    className={`ti ${row.on ? "ti-circle-check text-primary" : "ti-circle-x text-muted"} me-2`}
                    aria-hidden
                  />
                  {row.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="landing-how"
        className={`landing-section landing-how py-5 ${visible.has("how") ? "landing-in-view" : ""}`}
        data-landing-section="how"
        aria-label="How it works">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="landing-section-badge">3 steps</span>
            <h2 className="landing-section-title">Live in minutes, not days</h2>
            <p className="landing-section-sub text-muted mx-auto">
              We onboard your business, you log in with phone + PIN, and billing starts from the browser.
            </p>
          </div>
          <div className="row g-4 text-center landing-how-steps">
            <div className="col-md-4 landing-step-col">
              <div className="landing-step rounded-4 p-4 h-100">
                <span className="landing-step-num">1</span>
                <h3 className="h6 fw-bold mt-2 mb-2">Get business access</h3>
                <p className="small text-muted mb-0">
                  Subscribe with BoloBill — we issue your login credentials after payment.
                </p>
              </div>
            </div>
            <div className="col-md-4 landing-step-col">
              <div className="landing-step rounded-4 p-4 h-100">
                <span className="landing-step-num">2</span>
                <h3 className="h6 fw-bold mt-2 mb-2">Add items & bill</h3>
                <p className="small text-muted mb-0">
                  Select products from stock (or add lines), review totals, and create the bill.
                </p>
              </div>
            </div>
            <div className="col-md-4 landing-step-col">
              <div className="landing-step rounded-4 p-4 h-100">
                <span className="landing-step-num">3</span>
                <h3 className="h6 fw-bold mt-2 mb-2">Share & track growth</h3>
                <p className="small text-muted mb-0">
                  Send bills on WhatsApp, download PDFs, and watch sales trends build over time.
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
        aria-label="Business onboarding">
        <div className="container py-3">
          <span className="landing-section-badge d-inline-block mb-3">
            Onboarding
          </span>
          <div className="landing-trial-card rounded-4 overflow-hidden shadow-lg position-relative">
            <div className="landing-trial-bg" aria-hidden />
            <div className="landing-trial-inner position-relative py-4 py-md-5 px-3 px-md-4">
              <div className="row align-items-center">
                <div className="col-lg-7 text-center text-lg-start mb-4 mb-lg-0">
                  <span className="landing-trial-badge">B2B onboarding</span>
                  <h2 className="landing-trial-title">
                    We set up your business account for you
                  </h2>
                  <p className="landing-trial-sub text-white opacity-90 mb-4">
                    Subscribe with BoloBill, get phone + PIN credentials, then bill from the web panel.
                    Change your PIN anytime in Settings.
                  </p>
                  <ul className="landing-trial-limits list-unstyled text-white opacity-90 mb-0 small">
                    <li className="mb-2">
                      <i className="ti ti-check me-2" aria-hidden />
                      No OTP signup — credentials issued after payment
                    </li>
                    <li>
                      <i className="ti ti-check me-2" aria-hidden />
                      WhatsApp bill links for customers
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
            Talk to us to onboard your business, or log in if you already have credentials.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <button
              type="button"
              onClick={startGuestDemo}
              className="btn btn-primary btn-lg rounded-3 fw-semibold landing-hero-btn landing-cta-final-btn">
              {t("landing.guestCta")}
            </button>
            <Link
              to="/signup"
              className="btn btn-outline-primary btn-lg rounded-3 fw-semibold landing-hero-btn">
              Request access
            </Link>
            <Link
              to="/login"
              className="btn btn-outline-secondary btn-lg rounded-3 fw-semibold landing-hero-btn">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section
        className={`landing-section landing-contact py-5 ${visible.has("contact") ? "landing-in-view" : ""}`}
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
            <ConnectWhatsAppButton variant="link" />
            <a
              href={`mailto:${BOLOBILL_CONTACT_EMAIL}`}
              className="text-decoration-none text-dark d-flex align-items-center gap-2"
            >
              <i className="ti ti-mail fs-4 text-primary" />
              <span>{BOLOBILL_CONTACT_EMAIL}</span>
            </a>
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
