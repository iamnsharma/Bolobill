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

export type ThemeColorCount = 1 | 2 | 3 | 4;

export type ShopSettings = {
  storeName: string;
  storeTagline: string;
  themeColorCount: ThemeColorCount;
  colors: [string, string, string, string];
};

/** BoloBill default palette (matches `assets/scss/_variables.scss`). */
export const BOLOBILL_BRAND_COLORS: ShopSettings["colors"] = [
  "#E66239",
  "#00C951",
  "#00B8DB",
  "#F0B100",
];

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  storeName: "BoloBill",
  storeTagline: "Voice billing & stock platform",
  themeColorCount: 1,
  colors: BOLOBILL_BRAND_COLORS,
};

const STORAGE_PREFIX = "bolobill_shop_settings_v1_";

function hexToRgbTriplet(hex: string): string {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6) return "37, 99, 235";
  const n = Number.parseInt(h, 16);
  if (Number.isNaN(n)) return "37, 99, 235";
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function normalizeSettings(raw: Partial<ShopSettings> | null): ShopSettings {
  const base = { ...DEFAULT_SHOP_SETTINGS, ...raw };
  const count = ([1, 2, 3, 4] as const).includes(base.themeColorCount as ThemeColorCount)
    ? (base.themeColorCount as ThemeColorCount)
    : 2;
  const colors = [...DEFAULT_SHOP_SETTINGS.colors] as ShopSettings["colors"];
  if (Array.isArray(raw?.colors)) {
    for (let i = 0; i < 4; i++) {
      const c = raw.colors[i];
      if (typeof c === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(c)) {
        colors[i] = c.length <= 4 ? c : c.slice(0, 7);
      }
    }
  }
  return {
    storeName: (base.storeName || DEFAULT_SHOP_SETTINGS.storeName).trim() || DEFAULT_SHOP_SETTINGS.storeName,
    storeTagline: (base.storeTagline ?? DEFAULT_SHOP_SETTINGS.storeTagline).trim(),
    themeColorCount: count,
    colors,
  };
}

export function applyShopThemeToDocument(settings: ShopSettings) {
  const root = document.documentElement;
  const { themeColorCount, colors } = settings;
  const c1 = colors[0];
  const c2 = themeColorCount >= 2 ? colors[1] : c1;
  const c3 = themeColorCount >= 3 ? colors[2] : c2;
  const c4 = themeColorCount >= 4 ? colors[3] : c3;

  root.style.setProperty("--shop-color-1", c1);
  root.style.setProperty("--shop-color-2", c2);
  root.style.setProperty("--shop-color-3", c3);
  root.style.setProperty("--shop-color-4", c4);
  root.style.setProperty("--shop-sidebar-gradient", `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`);

  root.style.setProperty("--bs-primary", c1);
  root.style.setProperty("--bs-primary-rgb", hexToRgbTriplet(c1));
  root.style.setProperty("--bs-success", c2);
  root.style.setProperty("--bs-success-rgb", hexToRgbTriplet(c2));
  if (themeColorCount >= 3) {
    root.style.setProperty("--bs-info", c3);
    root.style.setProperty("--bs-info-rgb", hexToRgbTriplet(c3));
  }
  if (themeColorCount >= 4) {
    root.style.setProperty("--bs-warning", c4);
    root.style.setProperty("--bs-warning-rgb", hexToRgbTriplet(c4));
  }
  root.dataset.shopTheme = String(themeColorCount);
}

type ShopSettingsContextValue = {
  settings: ShopSettings;
  setSettings: (patch: Partial<ShopSettings>) => void;
  resetSettings: () => void;
  resetToDefaults: () => void;
  displayStoreName: string;
};

const ShopSettingsContext = createContext<ShopSettingsContextValue | null>(null);

function loadSettings(storageKey: string): ShopSettings {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return DEFAULT_SHOP_SETTINGS;
    return normalizeSettings(JSON.parse(raw) as Partial<ShopSettings>);
  } catch {
    return DEFAULT_SHOP_SETTINGS;
  }
}

export function ShopSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = `${STORAGE_PREFIX}${user?.id ?? user?.phone ?? "guest"}`;

  const [settings, setSettingsState] = useState<ShopSettings>(() =>
    typeof window !== "undefined" ? loadSettings(storageKey) : DEFAULT_SHOP_SETTINGS,
  );

  useEffect(() => {
    setSettingsState(loadSettings(storageKey));
  }, [storageKey]);

  useEffect(() => {
    applyShopThemeToDocument(settings);
  }, [settings]);

  const persist = useCallback(
    (next: ShopSettings) => {
      setSettingsState(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [storageKey],
  );

  const setSettings = useCallback(
    (patch: Partial<ShopSettings>) => {
      persist(normalizeSettings({ ...settings, ...patch }));
    },
    [persist, settings],
  );

  const resetSettings = useCallback(() => {
    persist(
      normalizeSettings({
        ...settings,
        themeColorCount: DEFAULT_SHOP_SETTINGS.themeColorCount,
        colors: [...DEFAULT_SHOP_SETTINGS.colors],
      }),
    );
  }, [persist, settings]);

  const resetToDefaults = useCallback(() => {
    persist(normalizeSettings({ ...DEFAULT_SHOP_SETTINGS }));
  }, [persist]);

  const value = useMemo(
    (): ShopSettingsContextValue => ({
      settings,
      setSettings,
      resetSettings,
      resetToDefaults,
      displayStoreName: settings.storeName,
    }),
    [settings, setSettings, resetSettings, resetToDefaults],
  );

  return (
    <ShopSettingsContext.Provider value={value}>{children}</ShopSettingsContext.Provider>
  );
}

export function useShopSettings(): ShopSettingsContextValue {
  const ctx = useContext(ShopSettingsContext);
  if (!ctx) {
    return {
      settings: DEFAULT_SHOP_SETTINGS,
      setSettings: () => {},
      resetSettings: () => {},
      resetToDefaults: () => {},
      displayStoreName: DEFAULT_SHOP_SETTINGS.storeName,
    };
  }
  return ctx;
}
