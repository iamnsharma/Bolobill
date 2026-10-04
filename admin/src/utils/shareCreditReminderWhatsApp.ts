export type CreditReminderMessageInput = {
  shopName: string;
  customerName: string;
  pendingFormatted: string;
  totalCreditedFormatted: string;
  totalPaidFormatted: string;
};

export function buildCreditReminderWhatsAppMessage(input: CreditReminderMessageInput): string {
  const shop = input.shopName.trim().toUpperCase() || "OUR BUSINESS";
  const name = input.customerName.trim() || "Customer";
  const lines = [
    `*${shop}*`,
    `Hi ${name},`,
    "",
    `Your *pending balance* is *${input.pendingFormatted}*.`,
    `Total on credit: ${input.totalCreditedFormatted} | Paid: ${input.totalPaidFormatted}`,
    "",
    "Please clear the due amount at your convenience.",
    "Reply on this chat if you have any questions. 🙏",
  ];
  return lines.join("\n");
}
