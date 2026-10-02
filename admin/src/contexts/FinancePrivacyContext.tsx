import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const HIDE_FINANCE_STORAGE_KEY = "bolobill_admin_hide_finance";

/** Shown in place of revenue / inventory totals when privacy mode is on. */
export const FINANCE_MASK = "*****";

function readStoredHideFinance(): boolean {
  try {
    return localStorage.getItem(HIDE_FINANCE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function rupee(amount: number): string {
  return `₹${Number(amount).toLocaleString()}`;
}

type FinancePrivacyContextValue = {
  hideFinance: boolean;
  setHideFinance: (hidden: boolean) => void;
  toggleHideFinance: () => void;
  /** Always shows amount — stock prices, cart, billing, quantities. */
  formatMoney: (amount: number) => string;
  /** Masks when privacy is on — dashboard revenue, sales reports, inventory value total. */
  formatFinance: (amount: number) => string;
  maskText: (text: string) => string;
};

const FinancePrivacyContext = createContext<FinancePrivacyContextValue | null>(null);

export function FinancePrivacyProvider({ children }: { children: ReactNode }) {
  const [hideFinance, setHideFinanceState] = useState(readStoredHideFinance);

  const setHideFinance = useCallback((hidden: boolean) => {
    setHideFinanceState(hidden);
    try {
      localStorage.setItem(HIDE_FINANCE_STORAGE_KEY, hidden ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleHideFinance = useCallback(() => {
    setHideFinance(!hideFinance);
  }, [hideFinance, setHideFinance]);

  const value = useMemo((): FinancePrivacyContextValue => {
    const formatMoney = (amount: number) => rupee(amount);
    const formatFinance = (amount: number) =>
      hideFinance ? FINANCE_MASK : rupee(amount);
    const maskText = (text: string) => (hideFinance ? FINANCE_MASK : text);
    return {
      hideFinance,
      setHideFinance,
      toggleHideFinance,
      formatMoney,
      formatFinance,
      maskText,
    };
  }, [hideFinance, setHideFinance, toggleHideFinance]);

  return (
    <FinancePrivacyContext.Provider value={value}>{children}</FinancePrivacyContext.Provider>
  );
}

export function useFinancePrivacy(): FinancePrivacyContextValue {
  const ctx = useContext(FinancePrivacyContext);
  if (!ctx) {
    return {
      hideFinance: false,
      setHideFinance: () => {},
      toggleHideFinance: () => {},
      formatMoney: rupee,
      formatFinance: rupee,
      maskText: (text: string) => text,
    };
  }
  return ctx;
}
