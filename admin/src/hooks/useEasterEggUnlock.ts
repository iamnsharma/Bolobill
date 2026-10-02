import { useCallback, useRef } from "react";

const DEFAULT_CLICKS = 4;
const DEFAULT_WINDOW_MS = 4000;

/** Count rapid clicks (e.g. on brand); calls onUnlock when threshold is reached. */
export function useEasterEggUnlock(
  onUnlock: () => void,
  clicksNeeded = DEFAULT_CLICKS,
  windowMs = DEFAULT_WINDOW_MS,
) {
  const count = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    count.current = 0;
  }, []);

  const registerTap = useCallback(() => {
    count.current += 1;
    if (count.current >= clicksNeeded) {
      reset();
      onUnlock();
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(reset, windowMs);
  }, [clicksNeeded, onUnlock, reset, windowMs]);

  return registerTap;
}
