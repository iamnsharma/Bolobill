import { env } from '../config/env';

export function publicBillPageUrl(publicToken: string): string {
  const base = (env.PUBLIC_BILL_BASE_URL || env.BASE_URL).replace(/\/$/, '');
  return `${base}/bill/${publicToken}`;
}
