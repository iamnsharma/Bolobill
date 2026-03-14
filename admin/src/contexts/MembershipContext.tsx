import React, { createContext, useCallback, useContext, useState } from 'react';

const STORAGE_KEY = 'admin_membership_plan';

export type MembershipPlanId = 'Starter' | 'Growth' | 'Pro';

interface MembershipContextValue {
  currentPlan: MembershipPlanId | null;
  setCurrentPlan: (plan: MembershipPlanId | null) => void;
  hasActiveMembership: boolean;
}

const MembershipContext = createContext<MembershipContextValue | null>(null);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const [currentPlan, setState] = useState<MembershipPlanId | null>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return (v === 'Starter' || v === 'Growth' || v === 'Pro' ? v : null) as MembershipPlanId | null;
    } catch {
      return null;
    }
  });

  const setCurrentPlan = useCallback((plan: MembershipPlanId | null) => {
    setState(plan);
    try {
      if (plan) localStorage.setItem(STORAGE_KEY, plan);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const value: MembershipContextValue = {
    currentPlan,
    setCurrentPlan,
    hasActiveMembership: currentPlan !== null,
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (!ctx) return { currentPlan: null, setCurrentPlan: () => {}, hasActiveMembership: false };
  return ctx;
}
