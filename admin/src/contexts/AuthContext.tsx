import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, AuthUser } from '../api/auth';
import { adminApi } from '../api/admin';
import { isGuestMode, repairGuestSession } from '../guest/guestMode';
import { loadGuestState } from '../guest/guestStore';

interface AuthContextValue {
  user: AuthUser | null;
  isGuestPreview: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  register: (payload: { name: string; businessName: string; phone: string; pin: string }) => Promise<void>;
  registerWithOtp: (payload: { phone: string; otp: string; name: string; businessName: string; pin: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function guestUserFromStore(): AuthUser | null {
  const state = loadGuestState();
  if (!state) return null;
  return {
    id: state.user.id,
    phone: state.user.phone,
    name: state.user.name,
    businessName: state.user.businessName,
    accountType: 'business',
    role: 'merchant',
    financeReportsHidden: state.financeReportsHidden,
    hasInventoryPin: Boolean(state.inventoryPinHash),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (isGuestMode()) {
      repairGuestSession();
      return guestUserFromStore();
    }
    return authApi.getStoredUser();
  });
  const [isGuestPreview, setIsGuestPreview] = useState(
    () => isGuestMode() && Boolean(guestUserFromStore()),
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(() => !isGuestMode());

  const syncGuestAuth = useCallback(() => {
    if (isGuestMode()) {
      repairGuestSession();
      const guestUser = guestUserFromStore();
      setIsGuestPreview(Boolean(guestUser));
      setUser(guestUser);
      setIsSuperAdmin(false);
      setLoading(false);
      return;
    }
    setIsGuestPreview(false);
  }, []);

  useEffect(() => {
    syncGuestAuth();
    const onEnter = () => syncGuestAuth();
    const onExit = () => {
      setIsGuestPreview(false);
      setUser(authApi.getStoredUser());
      setIsSuperAdmin(false);
      setLoading(false);
    };
    window.addEventListener('bolobill-guest-enter', onEnter);
    window.addEventListener('bolobill-guest-exit', onExit);
    return () => {
      window.removeEventListener('bolobill-guest-enter', onEnter);
      window.removeEventListener('bolobill-guest-exit', onExit);
    };
  }, [syncGuestAuth]);

  useEffect(() => {
    if (isGuestMode()) {
      syncGuestAuth();
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .getMe()
      .then(({ user: u, isSuperAdmin: superAdmin }) => {
        setUser(u);
        setIsSuperAdmin(superAdmin === true || u?.role === 'superadmin');
        authApi.setStoredAuth(token, u);
      })
      .catch(() => {
        authApi.logout();
        setUser(null);
        setIsSuperAdmin(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (phone: string, pin: string) => {
    const { token, user: u } = await authApi.login({ phone, pin });
    authApi.setStoredAuth(token, u);
    try {
      const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
      setUser(me);
      setIsSuperAdmin(superAdmin === true || me?.role === 'superadmin');
      authApi.setStoredAuth(token, me);
    } catch (meErr: unknown) {
      authApi.logout();
      const msg = (meErr as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      throw new Error(msg || 'Signed in but admin profile check failed. Is the API running?');
    }
  }, []);

  const loginWithOtp = useCallback(async (phone: string, otp: string) => {
    const { token, user: u } = await authApi.verifyOtp(phone, otp);
    authApi.setStoredAuth(token, u);
    const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
    setUser(me);
    setIsSuperAdmin(superAdmin === true || me?.role === 'superadmin');
    authApi.setStoredAuth(token, me);
  }, []);

  const register = useCallback(
    async (payload: { name: string; businessName: string; phone: string; pin: string }) => {
      const { token, user: u } = await authApi.register({
        ...payload,
        accountType: 'business',
      });
      authApi.setStoredAuth(token, u);
      const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
      setUser(me);
      setIsSuperAdmin(superAdmin === true || me?.role === 'superadmin');
      authApi.setStoredAuth(token, me);
    },
    [],
  );

  const registerWithOtp = useCallback(
    async (payload: { phone: string; otp: string; name: string; businessName: string; pin: string }) => {
      const { token, user: u } = await authApi.registerWithOtp(payload);
      authApi.setStoredAuth(token, u);
      const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
      setUser(me);
      setIsSuperAdmin(superAdmin === true || me?.role === 'superadmin');
      authApi.setStoredAuth(token, me);
    },
    [],
  );

  const logout = useCallback(() => {
    if (isGuestMode()) return;
    authApi.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (isGuestMode()) {
      setUser(guestUserFromStore());
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
    setUser(me);
    setIsSuperAdmin(superAdmin === true || me?.role === 'superadmin');
    authApi.setStoredAuth(token, me);
  }, []);

  const value: AuthContextValue = {
    user,
    isGuestPreview,
    isSuperAdmin,
    loading,
    login,
    loginWithOtp,
    register,
    registerWithOtp,
    logout,
    isAuthenticated: Boolean(user),
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
