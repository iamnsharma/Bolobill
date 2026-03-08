import {create} from 'zustand';
import {authService} from '../services/api/modules/auth.service';
import {AuthUser, RegisterPayload, VerifyOtpPayload} from '../services/api/types/auth.types';
import {STORAGE_KEYS} from '../utils/storage/keys';
import {storage} from '../utils/storage/mmkv';

type AuthState = {
  token?: string;
  user?: AuthUser;
  isLoggedIn: boolean;
  isLoading: boolean;
  isBootstrapped: boolean;
  initializeAuth: () => void;
  sendOtp: (phone: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithOtp: (payload: VerifyOtpPayload) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: undefined,
  user: undefined,
  isLoggedIn: false,
  isLoading: false,
  isBootstrapped: false,
  initializeAuth: () => {
    const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    const userRaw = storage.getString(STORAGE_KEYS.AUTH_USER);

    let user: AuthUser | undefined;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw) as AuthUser;
      } catch (_error) {
        user = undefined;
      }
    }

    set({
      token: token ?? undefined,
      user,
      isLoggedIn: Boolean(token),
      isBootstrapped: true,
    });
  },
  sendOtp: async phone => {
    set({isLoading: true});
    try {
      await authService.sendOtp(phone);
      if (!phone) {
        throw new Error('Invalid phone');
      }
    } finally {
      set({isLoading: false});
    }
  },
  register: async payload => {
    set({isLoading: true});
    try {
      const response = await authService.register(payload);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));
      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
      });
    } finally {
      set({isLoading: false});
    }
  },
  loginWithOtp: async payload => {
    set({isLoading: true});
    try {
      const response = await authService.verifyOtp(payload);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));

      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
      });
    } finally {
      set({isLoading: false});
    }
  },
  logout: () => {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
    storage.delete(STORAGE_KEYS.AUTH_USER);
    set({token: undefined, user: undefined, isLoggedIn: false});
    get().initializeAuth();
  },
}));
