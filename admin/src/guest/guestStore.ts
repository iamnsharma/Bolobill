import type { ShopSettings } from '../contexts/ShopSettingsContext';
import { DEFAULT_SHOP_SETTINGS } from '../contexts/ShopSettingsContext';
import type {
  AdminInvoice,
  AddressBookContact,
  CreditAccountSummary,
  CreditLedgerEntry,
  OutOfStockItem,
  StockCategory,
  StockProduct,
} from '../api/admin';
import { GUEST_STORAGE_PREFIX } from './guestConstants';

export const GUEST_STATE_KEY = `${GUEST_STORAGE_PREFIX}state`;

export const GUEST_STATE_VERSION = 1;

export type GuestUserSnapshot = {
  id: string;
  name: string;
  businessName: string;
  phone: string;
};

export type GuestState = {
  version: number;
  user: GuestUserSnapshot;
  shopSettings: ShopSettings;
  financeReportsHidden: boolean;
  inventoryPinHash: string | null;
  stockCategories: StockCategory[];
  stockProducts: StockProduct[];
  invoices: AdminInvoice[];
  creditAccounts: CreditAccountSummary[];
  creditLedgerByPhone: Record<string, CreditLedgerEntry[]>;
  addressBookContacts: AddressBookContact[];
  outOfStockItems: OutOfStockItem[];
  qrCodeUrl: string | null;
  invoiceSeq: number;
};

export function newGuestId(prefix = 'g'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadGuestState(): GuestState | null {
  try {
    const raw = localStorage.getItem(GUEST_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestState;
    if (parsed?.version !== GUEST_STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGuestState(state: GuestState): void {
  localStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state));
}

export function updateGuestState(mutator: (state: GuestState) => void): GuestState {
  const state = loadGuestState() ?? createEmptyGuestState();
  mutator(state);
  saveGuestState(state);
  return state;
}

export function createEmptyGuestState(): GuestState {
  return {
    version: GUEST_STATE_VERSION,
    user: {
      id: 'guest_user',
      name: 'Guest merchant',
      businessName: 'Demo Kirana & Café',
      phone: '9999999999',
    },
    shopSettings: { ...DEFAULT_SHOP_SETTINGS, storeName: 'Demo Kirana & Café' },
    financeReportsHidden: false,
    inventoryPinHash: null,
    stockCategories: [],
    stockProducts: [],
    invoices: [],
    creditAccounts: [],
    creditLedgerByPhone: {},
    addressBookContacts: [],
    outOfStockItems: [],
    qrCodeUrl: null,
    invoiceSeq: 1,
  };
}

export function findGuestInvoiceByPublicToken(token: string): AdminInvoice | null {
  const state = loadGuestState();
  if (!state) return null;
  return state.invoices.find((inv) => inv.publicToken === token) ?? null;
}

export async function hashGuestInventoryPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin.trim());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyGuestInventoryPin(pin: string, hash: string | null): Promise<boolean> {
  if (!hash) return true;
  const h = await hashGuestInventoryPin(pin);
  return h === hash;
}
