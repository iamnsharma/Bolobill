import {create} from 'zustand';
import {authService} from '../services/api/modules/auth.service';
import {
  AuthUser,
  RegisterPayload,
  RegisterWithOtpPayload,
  VerifyOtpPayload,
  LoginWithPinPayload,
} from '../services/api/types/auth.types';
import {STORAGE_KEYS} from '../utils/storage/keys';
import {storage} from '../utils/storage/mmkv';

type AuthState = {
  token?: string;
  user?: AuthUser;
  isLoggedIn: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isBootstrapped: boolean;
  initializeAuth: () => void;
  sendOtp: (phone: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  registerWithOtp: (payload: RegisterWithOtpPayload) => Promise<void>;
  loginWithOtp: (payload: VerifyOtpPayload) => Promise<void>;
  loginWithPin: (payload: LoginWithPinPayload) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: undefined,
  user: undefined,
  isLoggedIn: false,
  isGuest: false,
  isLoading: false,
  isBootstrapped: false,
  initializeAuth: () => {
    const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
    const userRaw = storage.getString(STORAGE_KEYS.AUTH_USER);
    const isGuestMode = storage.getString(STORAGE_KEYS.GUEST_MODE) === 'true';

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
      isLoggedIn: Boolean(token) || isGuestMode,
      isGuest: isGuestMode,
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
      storage.delete(STORAGE_KEYS.GUEST_MODE);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));
      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
        isGuest: false,
      });
    } finally {
      set({isLoading: false});
    }
  },
  registerWithOtp: async payload => {
    set({isLoading: true});
    try {
      const response = await authService.registerWithOtp(payload);
      storage.delete(STORAGE_KEYS.GUEST_MODE);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));
      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
        isGuest: false,
      });
    } finally {
      set({isLoading: false});
    }
  },
  loginWithPin: async payload => {
    set({isLoading: true});
    try {
      const response = await authService.login(payload);
      storage.delete(STORAGE_KEYS.GUEST_MODE);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));
      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
        isGuest: false,
      });
    } finally {
      set({isLoading: false});
    }
  },
  loginWithOtp: async payload => {
    set({isLoading: true});
    try {
      const response = await authService.verifyOtp(payload);
      storage.delete(STORAGE_KEYS.GUEST_MODE);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, response.token);
      storage.set(STORAGE_KEYS.AUTH_USER, JSON.stringify(response.user));

      set({
        token: response.token,
        user: response.user,
        isLoggedIn: true,
        isGuest: false,
      });
    } finally {
      set({isLoading: false});
    }
  },
  loginAsGuest: () => {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
    storage.delete(STORAGE_KEYS.AUTH_USER);
    storage.set(STORAGE_KEYS.GUEST_MODE, 'true');
    set({
      token: undefined,
      user: undefined,
      isLoggedIn: true,
      isGuest: true,
    });
  },
  logout: () => {
    storage.delete(STORAGE_KEYS.AUTH_TOKEN);
    storage.delete(STORAGE_KEYS.AUTH_USER);
    storage.delete(STORAGE_KEYS.GUEST_MODE);
    set({token: undefined, user: undefined, isLoggedIn: false, isGuest: false});
    get().initializeAuth();
  },
}));
