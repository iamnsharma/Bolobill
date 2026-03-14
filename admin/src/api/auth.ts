import { api, AUTH_STORAGE_KEYS } from './client';

export interface LoginPayload {
  phone: string;
  pin: string;
}

export interface RegisterPayload {
  name: string;
  businessName: string;
  phone: string;
  pin: string;
  accountType?: 'personal' | 'business';
}

export interface RegisterWithOtpPayload {
  phone: string;
  otp: string;
  name: string;
  businessName: string;
  pin: string;
}

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  businessName?: string;
  accountType?: string;
  role?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/register', {
      ...payload,
      accountType: payload.accountType ?? 'business',
    });
    return data;
  },

  sendOtp: async (phone: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/send-otp', { phone });
    return data;
  },

  verifyOtp: async (phone: string, otp: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/verify-otp', { phone, otp });
    return data;
  },

  registerWithOtp: async (payload: RegisterWithOtpPayload): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/register-with-otp', payload);
    return data;
  },

  me: async (): Promise<{ user: AuthUser }> => {
    const { data } = await api.get<{ user: AuthUser }>('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  },

  getStoredUser: (): AuthUser | null => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setStoredAuth: (token: string, user: AuthUser) => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },
};
