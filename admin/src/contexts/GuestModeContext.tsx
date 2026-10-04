import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { enterGuestMode as enterGuestStorage, exitGuestMode as exitGuestStorage, isGuestMode } from '../guest/guestMode';

type GuestModeContextValue = {
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
};

const GuestModeContext = createContext<GuestModeContextValue | null>(null);

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(() => isGuestMode());

  useEffect(() => {
    const onExit = () => setIsGuest(false);
    window.addEventListener('bolobill-guest-exit', onExit);
    return () => window.removeEventListener('bolobill-guest-exit', onExit);
  }, []);

  const enterGuestMode = useCallback(() => {
    enterGuestStorage();
    setIsGuest(true);
    window.dispatchEvent(new CustomEvent('bolobill-guest-enter'));
  }, []);

  const exitGuestMode = useCallback(() => {
    exitGuestStorage();
    setIsGuest(false);
  }, []);

  const value = useMemo(
    () => ({ isGuest, enterGuestMode, exitGuestMode }),
    [isGuest, enterGuestMode, exitGuestMode],
  );

  return <GuestModeContext.Provider value={value}>{children}</GuestModeContext.Provider>;
}

export function useGuestMode(): GuestModeContextValue {
  const ctx = useContext(GuestModeContext);
  if (!ctx) throw new Error('useGuestMode must be used within GuestModeProvider');
  return ctx;
}
