import type { AdminInvoice, InvoicePaymentMode } from "../api/admin";
import { publicBillPageUrl } from "./publicBillUrl";

export type BillWhatsAppMessageInput = {
  shopName: string;
  totalFormatted: string;
  billUrl: string;
  customerName?: string;
  invoiceId?: string;
  billDate?: string;
  paymentMode?: InvoicePaymentMode;
  items?: Array<{ name: string; quantity: string; totalPrice: number | null }>;
};

const formatBillDate = (iso?: string): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const paymentLabel = (mode?: InvoicePaymentMode): string => {
  if (mode === "credit") return "Credit (Udhar)";
  return "Cash / Paid";
};

/** WhatsApp formatting: *bold* */
export function buildEzoStyleWhatsAppMessage(input: BillWhatsAppMessageInput): string {
  const shop = input.shopName.trim() || "Our store";
  const shopHeader = shop.toUpperCase();
  const customer = input.customerName?.trim();
  const lines: string[] = [`*${shopHeader}*`, "", "Thank you for visiting us! 🙏", ""];

  if (customer) {
    lines.push(`Hi *${customer}*,`, "");
  }

  lines.push("*— Bill summary —*");
  if (input.invoiceId) {
    lines.push(`Bill No: *${input.invoiceId}*`);
  }
  if (input.billDate) {
    lines.push(`Date: ${input.billDate}`);
  }
  lines.push(`Payment: *${paymentLabel(input.paymentMode)}*`);
  lines.push("");

  const items = input.items?.filter((it) => (it.name ?? "").trim()) ?? [];
  if (items.length > 0) {
    lines.push("*Items*");
    const maxLines = 25;
    const shown = items.slice(0, maxLines);
    for (const it of shown) {
      const name = it.name.trim();
      const qty = (it.quantity ?? "").trim() || "—";
      const price =
        it.totalPrice != null && !Number.isNaN(it.totalPrice)
          ? `₹${Number(it.totalPrice).toLocaleString("en-IN")}`
          : "—";
      lines.push(`• ${name}`);
      lines.push(`  ${qty} — *${price}*`);
    }
    if (items.length > maxLines) {
      lines.push(`_…and ${items.length - maxLines} more item(s) on the bill link._`);
    }
    lines.push("");
  }

  lines.push(`*Grand total: ${input.totalFormatted}*`);

  if (input.paymentMode === "credit") {
    lines.push("");
    lines.push(
      "*Credit (udhar):* this amount is added to your account. Please pay when convenient.",
    );
  } else {
    lines.push("");
    lines.push("_You can pay online using the UPI QR on the bill link below._");
  }

  lines.push("");
  lines.push("*View full bill & pay:*");
  lines.push(input.billUrl);
  lines.push("");
  lines.push("We hope to see you again soon! 🙏");
  lines.push("For any query, reply to this message.");

  return lines.join("\n");
}

export function buildBillWhatsAppMessageFromInvoice(
  invoice: Pick<
    AdminInvoice,
    | "invoiceId"
    | "customerName"
    | "total"
    | "items"
    | "paymentMode"
    | "createdAt"
    | "publicBillUrl"
    | "publicToken"
    | "user"
  >,
  formatMoney: (amount: number) => string,
  shopNameOverride?: string,
): string {
  const shopName =
    shopNameOverride?.trim() ||
    invoice.user?.businessName?.trim() ||
    invoice.user?.name?.trim() ||
    "Our business";

  let billUrl = invoice.publicBillUrl?.trim() || "";
  if (!billUrl && invoice.publicToken) {
    billUrl = publicBillPageUrl(invoice.publicToken);
  }
  if (!billUrl) {
    throw new Error("Bill link is not ready yet. Refresh and try again.");
  }

  const items = (invoice.items ?? []).map((it) => ({
    name: it.name,
    quantity: it.quantity,
    totalPrice: it.totalPrice,
  }));

  return buildEzoStyleWhatsAppMessage({
    shopName,
    totalFormatted: formatMoney(invoice.total ?? 0),
    billUrl,
    customerName: invoice.customerName,
    invoiceId: invoice.invoiceId,
    billDate: formatBillDate(invoice.createdAt),
    paymentMode: invoice.paymentMode ?? "cash",
    items,
  });
}

export type ShareBillWhatsAppResult = { method: "web-chat" };

/** Opens WhatsApp Web with bill message (link to online bill + QR on that page). */
export async function shareQrOnWhatsApp(
  phoneDigits: string,
  messageText: string,
): Promise<ShareBillWhatsAppResult> {
  const encodedText = encodeURIComponent(messageText);
  window.open(
    `https://web.whatsapp.com/send?phone=${phoneDigits}&text=${encodedText}`,
    "_blank",
    "noopener,noreferrer",
  );
  return { method: "web-chat" };
}

export function shareBillWhatsAppHint(_result: ShareBillWhatsAppResult): string {
  return "WhatsApp Web opened with your bill message. Customer can open the link to view the bill and scan your payment QR.";
}

export const whatsAppWebShareHint = shareBillWhatsAppHint;

/** @deprecated use buildBillWhatsAppMessageFromInvoice */
export function buildBillWhatsAppMessage(
  invoice: Pick<
    AdminInvoice,
    | "invoiceId"
    | "customerName"
    | "total"
    | "items"
    | "paymentMode"
    | "createdAt"
    | "publicBillUrl"
    | "publicToken"
    | "user"
  >,
  formatMoney: (n: number) => string,
): string {
  return buildBillWhatsAppMessageFromInvoice(invoice, formatMoney);
}
