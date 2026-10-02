/** Customer-facing bill page URL (admin app route /bill/:token). */
export function resolvePublicBillBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_BILL_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function publicBillPageUrl(publicToken: string): string {
  const base = resolvePublicBillBaseUrl();
  return `${base}/bill/${publicToken}`;
}
