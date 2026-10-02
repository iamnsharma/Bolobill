import axios from 'axios';

const envApiHost = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

/** In dev, use Vite `/api` proxy (localhost:3011) unless a custom backend URL is set. */
function resolveApiBaseUrl(): string {
  if (import.meta.env.DEV) {
    if (envApiHost && envApiHost !== 'https://api.useaifast.com') {
      return `${envApiHost}/api`;
    }
    return '/api';
  }
  return `${envApiHost || 'https://api.useaifast.com'}/api`;
}

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = String(err.config?.url ?? '');
    const skipLogoutOn401 =
      url.includes('/auth/login') || url.includes('/auth/change-pin');
    if (err.response?.status === 401 && !skipLogoutOn401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'admin_token',
  USER: 'admin_user',
} as const;
