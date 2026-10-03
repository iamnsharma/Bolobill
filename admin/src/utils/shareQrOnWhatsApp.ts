import type { AdminInvoice } from "../api/admin";
import { publicBillPageUrl } from "./publicBillUrl";

export type BillWhatsAppMessageInput = {
  shopName: string;
  totalFormatted: string;
  billUrl: string;
  customerName?: string;
};

/** WhatsApp formatting: *bold* */
export function buildEzoStyleWhatsAppMessage(input: BillWhatsAppMessageInput): string {
  const shop = input.shopName.trim().toUpperCase() || "OUR BUSINESS";
  const lines = [
    `*${shop}*`,
    "Thank you for your business! 🙏",
    "",
    `Bill Total - *${input.totalFormatted}*`,
    "",
    "Bill Link -",
    `*${input.billUrl}*`,
    "",
    "How was your experience?",
    "",
    "We'd love your feedback — reply to this message anytime!",
    "Thank you — we hope to serve you again!",
  ];
  if (input.customerName?.trim()) {
    lines.splice(2, 0, `Hi ${input.customerName.trim()},`);
  }
  return lines.join("\n");
}

export function buildBillWhatsAppMessageFromInvoice(
  invoice: Pick<
    AdminInvoice,
    "invoiceId" | "customerName" | "total" | "publicBillUrl" | "publicToken" | "user"
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

  return buildEzoStyleWhatsAppMessage({
    shopName,
    totalFormatted: formatMoney(invoice.total),
    billUrl,
    customerName: invoice.customerName,
  });
}

export type ShareBillWhatsAppResult = { method: "web-chat" };

/** Opens WhatsApp Web with Ezo-style bill message (link to online bill + QR on that page). */
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
    "invoiceId" | "customerName" | "total" | "items" | "publicBillUrl" | "publicToken" | "user"
  >,
  formatMoney: (n: number) => string,
): string {
  return buildBillWhatsAppMessageFromInvoice(invoice, formatMoney);
}
