import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { adminApi } from "../api/admin";
/** Shown in place of revenue / inventory totals when privacy mode is on. */
export const FINANCE_MASK = "*****";

function rupee(amount: number): string {
  return `₹${Number(amount).toLocaleString()}`;
}

type FinancePrivacyContextValue = {
  hideFinance: boolean;
  financeSyncing: boolean;
  /** Bumps after server hide/unlock so report pages refetch. */
  financeDataEpoch: number;
  hasInventoryPin: boolean;
  /** Hide reports on server; pass inventoryPin on first hide to create Inventory PIN. */
  hideFinanceReports: (inventoryPin?: string) => Promise<void>;
  /** Show reports after Inventory PIN on server. */
  unlockFinanceReports: (inventoryPin: string) => Promise<void>;
  /** Always shows amount — stock prices, cart, billing, quantities. */
  formatMoney: (amount: number) => string;
  /** Masks when privacy is on — dashboard revenue, sales reports, inventory value total. */
  formatFinance: (amount: number | null | undefined) => string;
  maskText: (text: string) => string;
};

const FinancePrivacyContext = createContext<FinancePrivacyContextValue | null>(null);

export function FinancePrivacyProvider({ children }: { children: ReactNode }) {
  const { user, isSuperAdmin, refreshUser } = useAuth();
  const hasInventoryPin = Boolean(user?.hasInventoryPin);
  const [hideFinance, setHideFinance] = useState(false);
  const [financeSyncing, setFinanceSyncing] = useState(false);
  const [financeDataEpoch, setFinanceDataEpoch] = useState(0);

  const applyHidden = useCallback((hidden: boolean) => {
    setHideFinance(hidden);
  }, []);

  // Sync from server once per login — avoid re-applying stale `user` while hide/unlock is in flight.
  useEffect(() => {
    if (isSuperAdmin) {
      applyHidden(false);
      return;
    }
    if (!user?.id) return;

    let cancelled = false;
    adminApi
      .getMe()
      .then(({ user: me }) => {
        if (!cancelled) applyHidden(Boolean(me.financeReportsHidden));
      })
      .catch(() => {
        if (!cancelled) {
          applyHidden(Boolean(user.financeReportsHidden));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, isSuperAdmin, applyHidden]);

  const hideFinanceReports = useCallback(
    async (inventoryPin?: string) => {
      if (isSuperAdmin) return;
      setFinanceSyncing(true);
      try {
        const body: { hidden: boolean; inventoryPin?: string } = { hidden: true };
        if (inventoryPin?.trim()) body.inventoryPin = inventoryPin.trim();
        const { financeReportsHidden } = await adminApi.patchFinanceReports(body);
        applyHidden(financeReportsHidden);
        setFinanceDataEpoch((n) => n + 1);
        void refreshUser?.().catch(() => {});
      } finally {
        setFinanceSyncing(false);
      }
    },
    [isSuperAdmin, applyHidden, refreshUser],
  );

  const unlockFinanceReports = useCallback(
    async (pin: string) => {
      if (isSuperAdmin) return;
      setFinanceSyncing(true);
      try {
        const { financeReportsHidden } = await adminApi.patchFinanceReports({
          hidden: false,
          inventoryPin: pin.trim(),
        });
        applyHidden(financeReportsHidden);
        setFinanceDataEpoch((n) => n + 1);
        void refreshUser?.().catch(() => {});
      } catch (err) {
        throw err;
      } finally {
        setFinanceSyncing(false);
      }
    },
    [isSuperAdmin, applyHidden, refreshUser],
  );

  const value = useMemo((): FinancePrivacyContextValue => {
    const formatMoney = (amount: number) => rupee(amount);
    const formatFinance = (amount: number | null | undefined) => {
      if (hideFinance || amount == null || Number.isNaN(amount)) return FINANCE_MASK;
      return rupee(amount);
    };
    const maskText = (text: string) => (hideFinance ? FINANCE_MASK : text);
    return {
      hideFinance,
      hasInventoryPin,
      financeSyncing,
      financeDataEpoch,
      hideFinanceReports,
      unlockFinanceReports,
      formatMoney,
      formatFinance,
      maskText,
    };
  }, [
    hideFinance,
    hasInventoryPin,
    financeSyncing,
    financeDataEpoch,
    hideFinanceReports,
    unlockFinanceReports,
  ]);

  return (
    <FinancePrivacyContext.Provider value={value}>{children}</FinancePrivacyContext.Provider>
  );
}

export function useFinancePrivacy(): FinancePrivacyContextValue {
  const ctx = useContext(FinancePrivacyContext);
  if (!ctx) {
    return {
      hideFinance: false,
      hasInventoryPin: false,
      financeSyncing: false,
      financeDataEpoch: 0,
      hideFinanceReports: async () => {},
      unlockFinanceReports: async () => {},
      formatMoney: rupee,
      formatFinance: (amount: number | null | undefined) =>
        amount == null || Number.isNaN(amount) ? FINANCE_MASK : rupee(amount),
      maskText: (text: string) => text,
    };
  }
  return ctx;
}
