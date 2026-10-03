import { resolvePublicBillBaseUrl } from "../config/deployUrls";
import { normalizePhoneForWhatsApp } from "./normalizePhoneForWhatsApp";
import { isMobileUserAgent } from "../config/contact";

export type MerchantOnboardingWhatsAppInput = {
  ownerName: string;
  businessName: string;
  phone: string;
  temporaryPin: string;
  loginUrl?: string;
};

export function resolveAdminLoginUrl(): string {
  const base = resolvePublicBillBaseUrl();
  return `${base}/login`;
}

/** WhatsApp formatting: *bold* — medium onboarding message for new merchants. */
export function buildMerchantOnboardingWhatsAppMessage(
  input: MerchantOnboardingWhatsAppInput,
): string {
  const owner = input.ownerName.trim() || "there";
  const business = input.businessName.trim() || "Your business";
  const phone = input.phone.replace(/\D/g, "").slice(-10);
  const loginUrl = input.loginUrl?.trim() || resolveAdminLoginUrl();

  return [
    "*BOLOBILL*",
    "Your business account is ready! 🙏",
    "",
    `Hi ${owner},`,
    "",
    "Your account was created by the BoloBill admin team.",
    "",
    "*Check your login details:*",
    `Business — *${business}*`,
    `Phone — *${phone}*`,
    `Temporary PIN — *${input.temporaryPin}*`,
    "",
    "Login link —",
    `*${loginUrl}*`,
    "",
    "Please sign in and change your PIN under *Settings* — treat this PIN as temporary and set your own after first login.",
    "",
    "Need help? Reply to this message anytime.",
    "Welcome aboard! 🛍️",
  ].join("\n");
}

/** Opens WhatsApp to `phone` with pre-filled message (Web or app). */
export function openWhatsAppToPhone(phone: string, messageText: string): void {
  const digits = normalizePhoneForWhatsApp(phone);
  const encoded = encodeURIComponent(messageText);

  if (isMobileUserAgent()) {
    window.location.href = `https://wa.me/${digits}?text=${encoded}`;
    return;
  }

  window.open(
    `https://web.whatsapp.com/send?phone=${digits}&text=${encoded}`,
    "_blank",
    "noopener,noreferrer",
  );
}
