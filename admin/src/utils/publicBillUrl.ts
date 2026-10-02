import { resolvePublicBillBaseUrl } from "../config/deployUrls";

export { resolvePublicBillBaseUrl };

export function publicBillPageUrl(publicToken: string): string {
  const base = resolvePublicBillBaseUrl();
  return `${base}/bill/${publicToken}`;
}
