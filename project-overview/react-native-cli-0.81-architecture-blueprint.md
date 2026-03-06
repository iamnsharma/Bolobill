# BoloBill React Native CLI 0.81 Architecture Blueprint

Use this as the source of truth while building the new app.

## 1) Tech Baseline

- React Native CLI: `0.81.x`
- Language: TypeScript
- State: Zustand
- Server state: React Query (`@tanstack/react-query`)
- i18n: `i18next` + `react-i18next`
- Theme: Zustand theme store + tokenized light/dark themes
- Storage: MMKV (`react-native-mmkv`) for theme + preferences

## 2) Project Setup Commands (RN CLI)

```bash
npx @react-native-community/cli@latest init BoloBillApp --version 0.81.0 --template react-native-template-typescript
cd BoloBillApp

# Navigation + essentials
npm i @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm i react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

# State + data
npm i zustand @tanstack/react-query axios

# i18n
npm i i18next react-i18next

# Storage
npm i react-native-mmkv

# Bottom sheet
npm i @gorhom/bottom-sheet

# Utilities
npm i react-native-device-info
```

Also follow platform setup for iOS/Android after install:
- iOS: `cd ios && pod install && cd ..`
- Ensure Reanimated Babel plugin is configured.

## 3) Final Folder Structure (Atomic + Service Pattern)

```text
src/
  assets/
    icons/
    images/
    animations/
    fonts/

  components/
    atoms/
      BaseText/
        index.tsx
        style.tsx
      BaseButton/
        index.tsx
        style.tsx
    molecules/
      SummaryRow/
        index.tsx
        style.tsx
    organisms/
      TransactionSummaryCard/
        index.tsx
        style.tsx
    templates/
      ScreenContainer/
        index.tsx
        style.tsx
    bottomsheets/
      SendTransactionSheet/
        index.tsx
        style.tsx
      CommonBottomSheetHeader/
        index.tsx
        style.tsx
      CommonBackdrop/
        index.tsx

  config/
    env.ts

  context/
    AppOrchestratorContext.tsx

  hooks/
    apiHooks/
      useCreateTransaction.ts
      useWalletBalance.ts
    featureHooks/
      useSendTransactionBottomSheet.ts
    screenHooks/
      useHomeScreen.ts

  lang/
    en/common.json
    hi/common.json
    pa/common.json
    mwr/common.json
    constants.ts
    index.ts

  native/
    bridge.types.ts

  navigation/
    AppStack.tsx
    RootTabs.tsx
    index.ts

  screens/
    HomeScreen/
      index.tsx
      style.tsx
    SettingsScreen/
      index.tsx
      style.tsx

  services/
    api/
      clients/
        privateClient.ts
        publicClient.ts
      core/
        deviceHeaders.ts
        queryClient.ts
        request.ts
      modules/
        transaction.service.ts
        auth.service.ts
      types/
        transaction.types.ts
        common.types.ts
      endpoints.ts

  stores/
    themeStore.ts
    languageStore.ts
    authStore.ts
    transactionStore.ts
    index.ts

  styling/
    globalStyles/
      theme.ts
      typography.ts
      spacing.ts
      metrics.ts
      shadows.ts
      index.ts

  types/
    navigation.types.ts
    app.types.ts

  utils/
    storage/
      mmkv.ts
      keys.ts
    alerts.ts
    bottomSheet.ts
    amount.ts
    address.ts
    index.ts

  index.ts
```

## 4) Theme System (Dark/Light with Zustand)

### 4.1 Theme tokens source
Create `src/styling/globalStyles/theme.ts`:

```ts
export type AppTheme = {
  colors: {
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
  };
};

export const lightTheme: AppTheme = {
  colors: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    primary: '#1E6EF2',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
    border: '#E5E7EB',
  },
};

export const darkTheme: AppTheme = {
  colors: {
    background: '#0B1220',
    surface: '#111827',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#60A5FA',
    success: '#22C55E',
    warning: '#FBBF24',
    danger: '#F87171',
    border: '#1F2937',
  },
};
```

### 4.2 Theme store contract (must follow)
Create `src/stores/themeStore.ts`:

```ts
import {create} from 'zustand';
import {darkTheme, lightTheme, AppTheme} from '@styling/globalStyles/theme';
import {storage} from '@utils/storage/mmkv';
import {STORAGE_KEYS} from '@utils/storage/keys';

type ThemeMode = 'light' | 'dark';

type ThemeState = {
  isDark: boolean;
  theme: AppTheme;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  initializeTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  theme: lightTheme,
  toggleTheme: () => {
    const nextDark = !get().isDark;
    const mode: ThemeMode = nextDark ? 'dark' : 'light';
    storage.set(STORAGE_KEYS.THEME_MODE, mode);
    set({isDark: nextDark, theme: nextDark ? darkTheme : lightTheme});
  },
  setTheme: mode => {
    const dark = mode === 'dark';
    storage.set(STORAGE_KEYS.THEME_MODE, mode);
    set({isDark: dark, theme: dark ? darkTheme : lightTheme});
  },
  initializeTheme: () => {
    const saved = storage.getString(STORAGE_KEYS.THEME_MODE) as ThemeMode | undefined;
    const dark = saved === 'dark';
    set({isDark: dark, theme: dark ? darkTheme : lightTheme});
  },
}));
```

### 4.3 Component styling rule

```ts
const theme = useThemeStore(s => s.theme);
const styles = useMemo(() => getStyles(theme), [theme]);
```

No hardcoded colors in screen/component style files except very rare required cases.

## 5) Translation System (Hindi/English/Punjabi/Marwadi)

> You wrote "transaction" but context indicates "translation/language switch". This setup enables runtime language switch from settings.

### 5.1 Locale files
- `src/lang/en/common.json`
- `src/lang/hi/common.json`
- `src/lang/pa/common.json` (Punjabi)
- `src/lang/mwr/common.json` (Marwadi)

### 5.2 Translation key constants
Create `src/lang/constants.ts`:

```ts
export const T = {
  COMMON_OK: 't.common.ok',
  COMMON_CANCEL: 't.common.cancel',
  SETTINGS_LANGUAGE: 't.settings.language',
  SETTINGS_THEME: 't.settings.theme',
  TX_SEND_TITLE: 't.transaction.sendTitle',
  TX_FORM_AMOUNT: 't.transaction.amount',
  TX_FORM_ADDRESS: 't.transaction.address',
  TX_CONFIRM_TITLE: 't.transaction.confirmTitle',
  TX_SUBMIT: 't.transaction.submit',
} as const;
```

### 5.3 i18n init wrapper
Create `src/lang/index.ts`:

```ts
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en/common.json';
import hi from './hi/common.json';
import pa from './pa/common.json';
import mwr from './mwr/common.json';

export const resources = {
  en: {translation: en},
  hi: {translation: hi},
  pa: {translation: pa},
  mwr: {translation: mwr},
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {escapeValue: false},
});

export const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
export default i18n;
```

### 5.4 Language preference store
Create `src/stores/languageStore.ts`:
- `language: 'en' | 'hi' | 'pa' | 'mwr'`
- `setLanguage(lang)` persists to MMKV and calls `i18n.changeLanguage(lang)`
- `initializeLanguage()` restores from storage on app startup

### 5.5 Strict UI text rule
- Use `t(T.KEY)` only
- Avoid raw UI strings
- Use interpolation for dynamic text:
  - `"walletLimitReachedMessageWithCount": "You reached {{current}}/{{max}} limit"`

## 6) Bottom Sheet Rules + Sample Module

Each sheet must be self-contained:
- `src/components/bottomsheets/<SheetName>/index.tsx`
- `src/components/bottomsheets/<SheetName>/style.tsx`

Imperative API pattern:
- `open(params?)`
- `close()`

Use shared:
- `CommonBackdrop`
- `CommonBottomSheetHeader`

Reserve fixed placeholders for async content to avoid layout jumps.

## 7) Send Transaction Flow Pattern (Form -> Confirm)

### 7.1 Hook-driven business logic
Create `src/hooks/featureHooks/useSendTransactionBottomSheet.ts`:
- step state: `'form' | 'confirm'`
- form state: `amount`, `toAddress`, optional note
- validation in hook
- payload builder in hook
- mutation trigger in hook
- reset logic in hook

### 7.2 Presentational sheet
Create `src/components/bottomsheets/SendTransactionSheet/index.tsx`:
- mostly UI rendering
- uses hook output
- no business logic in component

### 7.3 Query invalidation
After successful send:
- invalidate wallet balance query
- invalidate transactions list query

## 8) API Layer Pattern

### 8.1 Endpoints
`src/services/api/endpoints.ts`

```ts
export const ENDPOINTS = {
  TRANSACTION_CREATE: '/transactions/create',
  TRANSACTION_HISTORY: '/transactions/history',
  AUTH_LOGIN: '/auth/login',
} as const;
```

### 8.2 Device headers
`src/services/api/core/deviceHeaders.ts`
- `X-Device-Id`
- `X-Device-Platform`
- `X-Device-Name`

### 8.3 Service module + types
- `src/services/api/types/transaction.types.ts`
- `src/services/api/modules/transaction.service.ts`

Example contract:

```ts
export type CreateTransactionPayload = {
  amount: number;
  toAddress: string;
  note?: string;
};

export type CreateTransactionResponse = {
  id: string;
  status: 'pending' | 'success' | 'failed';
};
```

### 8.4 React Query hooks
`src/hooks/apiHooks/useCreateTransaction.ts` wraps service call and invalidates queries.

## 9) State Management Rules

- One Zustand store per domain:
  - `authStore`
  - `themeStore`
  - `languageStore`
  - `transactionStore`
- Keep stores minimal and typed.
- Use context only when orchestrating multiple sheets/screens.

## 10) Folder Exports (`index.ts`) Convention

Add index exports at each module boundary for clean imports:

- `src/components/atoms/index.ts`
- `src/components/molecules/index.ts`
- `src/components/bottomsheets/index.ts`
- `src/hooks/apiHooks/index.ts`
- `src/services/api/modules/index.ts`
- `src/stores/index.ts`
- `src/index.ts`

Example:

```ts
// src/stores/index.ts
export * from './themeStore';
export * from './languageStore';
export * from './authStore';
export * from './transactionStore';
```

## 11) Suggested TS Path Aliases

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@assets/*": ["src/assets/*"],
      "@components/*": ["src/components/*"],
      "@config/*": ["src/config/*"],
      "@context/*": ["src/context/*"],
      "@hooks/*": ["src/hooks/*"],
      "@lang/*": ["src/lang/*"],
      "@navigation/*": ["src/navigation/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@styling/*": ["src/styling/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

## 12) Boot Sequence (App Root)

On app startup:
1. `themeStore.initializeTheme()`
2. `languageStore.initializeLanguage()`
3. initialize auth/session state
4. mount QueryClientProvider
5. mount NavigationContainer

## 13) Non-Negotiable Conventions Checklist

- UI text uses `t(T.KEY)` only
- New keys first in EN, then add HI/PA/MWR stubs
- Theme tokens only in styles
- Form/confirm business logic stays in hooks
- API types live in `services/api/types`
- Query invalidation after successful mutation
- No screen-level hardcoded strings/colors
- No lint/type errors on PR

## 14) What to Build First (Order)

1. Base folders + alias setup
2. Theme system + language system + stores
3. API client core + query client
4. Atomic primitives (`BaseText`, `BaseButton`, base input)
5. Sample `SendTransactionSheet` (form -> confirm)
6. Settings screen (theme + language switch)
7. Hook + API integration + query invalidation

## 15) Note About Memory/Reference

I cannot persist custom memory outside this chat.  
This file is your durable reference:

- `project-overview/react-native-cli-0.81-architecture-blueprint.md`

Keep updating this document whenever conventions evolve.
