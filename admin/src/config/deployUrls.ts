/**
 * Live deployment defaults (useaifast). Override at build time via Vite env:
 * - VITE_API_URL
 * - VITE_PUBLIC_BILL_BASE_URL
 */

/** Live API on Render until api.useaifast.com DNS points to Render. */
export const PROD_API_ORIGIN = "https://bolobill.onrender.com";
export const PROD_ADMIN_ORIGIN = "https://bolobill.useaifast.com";

function trimOrigin(url: string | undefined): string | undefined {
  const t = url?.trim().replace(/\/$/, "");
  return t || undefined;
}

/** API host only, no `/api` suffix. */
export function resolveApiOrigin(): string {
  const fromEnv = trimOrigin(import.meta.env.VITE_API_URL);
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return PROD_API_ORIGIN;
  return "http://localhost:3011";
}

/** Axios/fetch base including `/api`. */
export function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    const fromEnv = trimOrigin(import.meta.env.VITE_API_URL);
    if (fromEnv && fromEnv !== PROD_API_ORIGIN) {
      return `${fromEnv}/api`;
    }
    return "/api";
  }
  return `${resolveApiOrigin()}/api`;
}

/** Where customers open shared bill links (`/bill/:token`). */
export function resolvePublicBillBaseUrl(): string {
  const fromEnv = trimOrigin(import.meta.env.VITE_PUBLIC_BILL_BASE_URL);
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return PROD_ADMIN_ORIGIN;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
