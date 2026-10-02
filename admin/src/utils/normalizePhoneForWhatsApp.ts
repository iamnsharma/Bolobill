/** Normalize to digits only for WhatsApp Web (e.g. 919876543210). Add 91 if user entered 10 digits (India). */
export function normalizePhoneForWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10 && !value.trim().startsWith("91")) return "91" + digits;
  return digits;
}
