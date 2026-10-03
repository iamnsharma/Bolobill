/** Public contact for business access, support, and marketing pages. */
export const BOLOBILL_CONTACT_EMAIL = "iamnsharma.softdev@gmail.com";

/** WhatsApp (digits only, international — no + or spaces). */
export const BOLOBILL_CONTACT_WHATSAPP_DIGITS = "9115915870";

export const CONNECT_OVER_WHATSAPP_LABEL = "Connect over WhatsApp";

export const BOLOBILL_ACCESS_WHATSAPP_MESSAGE =
  "Hi, I'd like to request access to BoloBill for my business.";

/** https://wa.me/… — works on desktop (WhatsApp Web) and mobile (hands off to the app). */
export function buildBoloBillWhatsAppUrl(prefillMessage?: string): string {
  const base = `https://wa.me/${BOLOBILL_CONTACT_WHATSAPP_DIGITS}`;
  const text = prefillMessage?.trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** whatsapp:// — direct handoff when the app is installed (mobile). */
export function buildWhatsAppNativeUrl(prefillMessage?: string): string {
  const params = new URLSearchParams();
  params.set("phone", BOLOBILL_CONTACT_WHATSAPP_DIGITS);
  const text = prefillMessage?.trim();
  if (text) params.set("text", text);
  return `whatsapp://send?${params.toString()}`;
}

export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * Mobile: same-tab wa.me (OS opens WhatsApp app) with whatsapp:// attempt first.
 * Desktop: new tab to wa.me (WhatsApp Web).
 */
export function openBoloBillWhatsApp(prefillMessage?: string): void {
  const waMe = buildBoloBillWhatsAppUrl(prefillMessage);

  if (isMobileUserAgent()) {
    const native = buildWhatsAppNativeUrl(prefillMessage);
    window.location.href = native;
    window.setTimeout(() => {
      if (!document.hidden) {
        window.location.href = waMe;
      }
    }, 700);
    return;
  }

  window.open(waMe, "_blank", "noopener,noreferrer");
}
