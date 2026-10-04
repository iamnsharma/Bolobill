import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi } from "../api/admin";

export function useAiVisionPinGate() {
  const [pinRequired, setPinRequired] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const pinRef = useRef<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingResolve = useRef<((pin: string | null) => void) | null>(null);

  useEffect(() => {
    adminApi
      .getAiVisionDemoPinStatus()
      .then(({ required }) => {
        setPinRequired(required);
        if (!required) setUnlocked(true);
      })
      .catch(() => setPinRequired(false));
  }, []);

  const clearUnlock = useCallback(() => {
    pinRef.current = null;
    setUnlocked(false);
  }, []);

  const getVisionPin = useCallback((): string | undefined => {
    if (!pinRequired) return undefined;
    return pinRef.current ?? undefined;
  }, [pinRequired]);

  const applyVerifiedPin = useCallback((pin: string) => {
    pinRef.current = pin;
    setUnlocked(true);
  }, []);

  const requestUnlock = useCallback((): Promise<string | null> => {
    if (!pinRequired) return Promise.resolve(null);
    if (unlocked && pinRef.current) return Promise.resolve(pinRef.current);
    return new Promise((resolve) => {
      pendingResolve.current = resolve;
      setModalOpen(true);
    });
  }, [pinRequired, unlocked]);

  const submitPinFromModal = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!pinRequired) {
        applyVerifiedPin(pin);
        return true;
      }
      try {
        await adminApi.verifyAiVisionDemoPin(pin);
        applyVerifiedPin(pin);
        return true;
      } catch {
        return false;
      }
    },
    [pinRequired, applyVerifiedPin],
  );

  const closePinModal = useCallback((pin: string | null) => {
    setModalOpen(false);
    pendingResolve.current?.(pin);
    pendingResolve.current = null;
  }, []);

  const handlePinModalSuccess = useCallback(
    async (pin: string) => {
      const ok = await submitPinFromModal(pin);
      if (ok) {
        closePinModal(pin);
      }
      return ok;
    },
    [submitPinFromModal, closePinModal],
  );

  const handlePinModalCancel = useCallback(() => {
    closePinModal(null);
  }, [closePinModal]);

  return {
    pinRequired,
    unlocked: !pinRequired || unlocked,
    modalOpen,
    getVisionPin,
    clearUnlock,
    requestUnlock,
    handlePinModalSuccess,
    handlePinModalCancel,
  };
}
