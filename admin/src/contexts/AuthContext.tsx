import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, AuthUser } from '../api/auth';
import { adminApi } from '../api/admin';

interface AuthContextValue {
  user: AuthUser | null;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
  register: (payload: { name: string; businessName: string; phone: string; pin: string }) => Promise<void>;
  registerWithOtp: (payload: { phone: string; otp: string; name: string; businessName: string; pin: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authApi.getStoredUser());
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .getMe()
      .then(({ user: u, isSuperAdmin: superAdmin }) => {
        setUser(u);
        setIsSuperAdmin(superAdmin);
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
    const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
    setUser(me);
    setIsSuperAdmin(superAdmin);
    authApi.setStoredAuth(token, me);
  }, []);

  const loginWithOtp = useCallback(async (phone: string, otp: string) => {
    const { token, user: u } = await authApi.verifyOtp(phone, otp);
    authApi.setStoredAuth(token, u);
    const { user: me, isSuperAdmin: superAdmin } = await adminApi.getMe();
    setUser(me);
    setIsSuperAdmin(superAdmin);
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
      setIsSuperAdmin(superAdmin);
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
      setIsSuperAdmin(superAdmin);
      authApi.setStoredAuth(token, me);
    },
    [],
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isSuperAdmin,
    loading,
    login,
    loginWithOtp,
    register,
    registerWithOtp,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
