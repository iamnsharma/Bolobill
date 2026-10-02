import { env } from '../config/env';

/** Origin for `/api/files/*` — always the API host, never the admin SPA domain. */
export function apiFileBaseUrl(): string {
  const base = env.BASE_URL.replace(/\/$/, '');
  if (/bolobill\.useaifast\.com/i.test(base)) {
    return 'https://bolobill.onrender.com';
  }
  return base;
}
