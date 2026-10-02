import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { resolveApiBaseUrl, resolveApiFileUrl } from "../config/deployUrls";

type PublicBill = {
  invoiceId: string;
  customerName: string;
  items: Array<{ name: string; quantity: string; totalPrice: number }>;
  total: number;
  createdAt: string;
  pdfUrl: string;
  qrUrl: string;
  shopName: string;
  shopPhone: string;
  publicBillUrl: string;
};

async function fetchPublicBill(token: string): Promise<PublicBill> {
  const apiBase = resolveApiBaseUrl();
  const res = await fetch(`${apiBase}/public/bills/${encodeURIComponent(token)}`);
  if (!res.ok) {
    throw new Error("Bill not found or link expired.");
  }
  const data = (await res.json()) as PublicBill;
  return {
    ...data,
    pdfUrl: data.pdfUrl ? resolveApiFileUrl(data.pdfUrl) : "",
    qrUrl: data.qrUrl ? resolveApiFileUrl(data.qrUrl) : "",
    items: Array.isArray(data.items) ? data.items : [],
  };
}

function formatMoney(n: number) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export default function PublicBill() {
  const { token } = useParams<{ token: string }>();
  const [bill, setBill] = useState<PublicBill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Invalid bill link.");
      setLoading(false);
      return;
    }
    fetchPublicBill(token)
      .then(setBill)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Could not load bill"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="public-bill-page min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="public-bill-page min-vh-100 d-flex align-items-center justify-content-center p-4">
        <div className="text-center">
          <p className="text-muted mb-3">{error ?? "Bill not found"}</p>
          <Link to="/" className="btn btn-outline-primary btn-sm">
            Go to BoloBill
          </Link>
        </div>
      </div>
    );
  }

  const created = new Date(bill.createdAt);

  return (
    <div className="public-bill-page min-vh-100 py-4 py-md-5">
      <div className="public-bill-card mx-auto">
        <header className="public-bill-card__head text-center">
          <p className="public-bill-card__eyebrow mb-1">BOLOBILL</p>
          <h1 className="public-bill-card__shop mb-2">{bill.shopName}</h1>
          <p className="text-muted small mb-1">Thank you for your visit! 🙏</p>
          {bill.customerName ? (
            <p className="fw-semibold mb-0">Hi {bill.customerName},</p>
          ) : null}
        </header>

        <div className="public-bill-card__meta row g-2 small">
          <div className="col-6">
            <span className="text-muted d-block">Bill no.</span>
            <span className="fw-semibold">{bill.invoiceId}</span>
          </div>
          <div className="col-6 text-end">
            <span className="text-muted d-block">Date</span>
            <span className="fw-semibold">{created.toLocaleDateString("en-IN")}</span>
          </div>
          <div className="col-12 pt-2">
            <span className="text-muted">Customer: </span>
            <span className="fw-semibold">{bill.customerName}</span>
          </div>
        </div>

        <table className="table table-sm public-bill-card__table mb-0">
          <thead>
            <tr>
              <th>Item</th>
              <th className="text-end">Qty</th>
              <th className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, i) => (
              <tr key={`${item.name}-${i}`}>
                <td>{item.name}</td>
                <td className="text-end">{item.quantity}</td>
                <td className="text-end">{formatMoney(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="public-bill-card__total d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Bill total</span>
          <span className="public-bill-card__total-amount">{formatMoney(bill.total)}</span>
        </div>

        {bill.qrUrl ? (
          <div className="public-bill-card__qr text-center">
            <p className="fw-semibold mb-2">Scan to pay</p>
            <img src={bill.qrUrl} alt="Payment QR" className="public-bill-card__qr-img" />
          </div>
        ) : null}

        <div className="public-bill-card__feedback text-center">
          <p className="fw-semibold mb-1">How was your experience?</p>
          <p className="text-muted small mb-2">Apka anubhav kaisa tha? ✨</p>
          <p className="text-muted small mb-0">
            We&apos;d love your feedback — reply to the shop anytime!
            {bill.shopPhone ? (
              <>
                {" "}
                <a href={`tel:${bill.shopPhone}`} className="text-decoration-none">
                  {bill.shopPhone}
                </a>
              </>
            ) : null}
          </p>
          <p className="text-muted small mb-0 mt-2">Dhanyavaad, phir milenge! 🛍️</p>
        </div>

        {bill.pdfUrl ? (
          <div className="text-center mt-3">
            <a
              href={bill.pdfUrl}
              className="btn btn-outline-primary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download PDF
            </a>
          </div>
        ) : null}

        <p className="text-center text-muted public-bill-card__footer small mb-0">
          Powered by BoloBill
        </p>
      </div>
    </div>
  );
}
