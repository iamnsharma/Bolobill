import { loadGuestState, saveGuestState } from './guestStore';
import { createSeedGuestState } from './seedGuestData';
import { GUEST_MODE_FLAG, GUEST_STORAGE_PREFIX } from './guestConstants';

export { GUEST_MODE_FLAG, GUEST_STORAGE_PREFIX } from './guestConstants';

export function isGuestMode(): boolean {
  try {
    return localStorage.getItem(GUEST_MODE_FLAG) === '1';
  } catch {
    return false;
  }
}

export function enterGuestMode(): void {
  localStorage.setItem(GUEST_MODE_FLAG, '1');
  repairGuestSession();
}

/** Re-seed if guest flag is set but state was cleared or corrupted. */
export function repairGuestSession(): void {
  if (!isGuestMode()) return;
  if (!loadGuestState()) {
    saveGuestState(createSeedGuestState());
  }
}

export function exitGuestMode(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key === GUEST_MODE_FLAG || key.startsWith(GUEST_STORAGE_PREFIX))) {
      keys.push(key);
    }
  }
  keys.forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new CustomEvent('bolobill-guest-exit'));
}
