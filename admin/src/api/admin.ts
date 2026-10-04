import { api } from './client';
import { isGuestMode } from '../guest/guestMode';
import { guestAdminApi } from '../guest/guestAdminApi';

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  accountType?: string;
  role?: string;
  financeReportsHidden?: boolean;
  hasInventoryPin?: boolean;
  isBlacklisted: boolean;
  usage?: { invoiceRequestSuccessCount?: number; voiceToTextSecondsUsed?: number };
  createdAt: string;
  updatedAt: string;
}

export type InvoicePaymentMode = 'cash' | 'credit';

export interface AdminInvoice {
  id: string;
  invoiceId: string;
  customerName: string;
  customerPhone?: string;
  paymentMode?: InvoicePaymentMode;
  items: Array<{ name: string; quantity: string; totalPrice: number }>;
  total: number | null;
  voiceTranscript: string;
  pdfUrl: string;
  publicToken?: string;
  publicBillUrl?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name?: string; phone?: string; businessName?: string } | null;
}

export interface PaginatedResponse<T> {
  users?: T[];
  invoices?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStats {
  totalInvoices: number;
  totalUsers: number;
  blacklistedUsers: number;
  activeMemberships: number;
}

export interface WhisperUsage {
  totalSeconds: number;
  totalMinutes: number;
  costUSD: number;
  costINR: number;
  usersWithUsage: number;
}

export interface SalesSummary {
  total: number | null;
  today: number | null;
  thisWeek: number | null;
  thisMonth: number | null;
  thisYear: number | null;
  filteredTotal: number | null;
  financeRedacted?: boolean;
}

export interface ItemSold {
  itemName: string;
  quantity: number;
  amount: number | null;
}

export interface OutOfStockItem {
  _id: string;
  name: string;
  quantity: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockCategory {
  _id: string;
  name: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type MenuImportDuplicateStatus = 'new' | 'exists';

export type MenuImportPreviewCategory = {
  tempId: string;
  name: string;
  sortOrder: number;
};

export type MenuImportPreviewItem = {
  tempId: string;
  categoryTempId: string;
  name: string;
  unit: string;
  unitPrice: number | null;
  lowStockThreshold: number | null;
  prefillQuantityOnHand?: number | null;
  duplicateStatus: MenuImportDuplicateStatus;
  matchedProductId: string | null;
  matchedProductName: string | null;
};

export type MenuImportAnalyzeResponse = {
  summary: { found: number; newCount: number; existsCount: number };
  categories: MenuImportPreviewCategory[];
  items: MenuImportPreviewItem[];
};

export type MenuImportMatchRow = {
  tempId: string;
  duplicateStatus: MenuImportDuplicateStatus;
  matchedProductId: string | null;
  matchedProductName: string | null;
};

export type OosImportDuplicateStatus = 'new' | 'exists';

export type OosImportPreviewItem = {
  tempId: string;
  name: string;
  quantity: string;
  note: string;
  duplicateStatus: OosImportDuplicateStatus;
  matchedItemId: string | null;
  matchedItemName: string | null;
};

export type OosImportPreviewResponse = {
  summary: { found: number; newCount: number; existsCount: number };
  items: OosImportPreviewItem[];
};

export type OosImportMatchRow = {
  tempId: string;
  duplicateStatus: OosImportDuplicateStatus;
  matchedItemId: string | null;
  matchedItemName: string | null;
};

export type MenuImportCommitProduct = {
  tempId?: string;
  categoryName: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantityOnHand: number;
  quantityOnHandProvided: true;
  lowStockThreshold?: number;
};

export interface StockProduct {
  _id: string;
  name: string;
  unit: string;
  unitPrice: number;
  quantityOnHand: number;
  lowStockThreshold?: number | null;
  categoryId?: { _id: string; name: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressBookContact {
  id: string;
  phone: string;
  name: string;
  updatedAt?: string;
}

export interface UserLimits {
  isActive: boolean;
  expiresAt?: string;
  invoiceLimit: number;
  invoicesUsed: number;
  invoicesRemaining: number;
  voiceMinutesLimit: number;
  voiceMinutesUsed: number;
  voiceSecondsRemaining: number;
  features: string[];
}

const realAdminApi = {
  getMe: () =>
    api.get<{ user: AdminUser; isSuperAdmin: boolean }>('/admin/me').then((r) => r.data),

  patchFinanceReports: (body: { hidden: boolean; inventoryPin?: string }) =>
    api
      .patch<{ financeReportsHidden: boolean; hasInventoryPin: boolean }>(
        '/admin/me/finance-reports',
        body,
      )
      .then((r) => r.data),

  getStats: () =>
    api.get<AdminStats>('/admin/stats').then((r) => r.data),

  getWhisperUsage: () =>
    api.get<WhisperUsage>('/admin/whisper-usage').then((r) => r.data),

  getSalesSummary: (params?: { userId?: string; from?: string; to?: string }) =>
    api.get<SalesSummary>('/admin/sales-summary', { params: params ?? {} }).then((r) => r.data),

  getSalesSummaryDaily: (params: { from: string; to: string; userId?: string }) =>
    api.get<{ daily: { date: string; total: number }[] }>('/admin/sales-summary/daily', { params }).then((r) => r.data),

  getItemsSold: (params?: { userId?: string; from?: string; to?: string }) =>
    api.get<{ items: ItemSold[] }>('/admin/items-sold', { params: params ?? {} }).then((r) => r.data),

  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    createdFrom?: string;
    createdTo?: string;
  }) =>
    api
      .get<{ users: AdminUser[]; total: number; page: number; limit: number; totalPages: number }>(
        '/admin/users',
        {
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            search: params?.search,
            createdFrom: params?.createdFrom,
            createdTo: params?.createdTo,
          },
        },
      )
      .then((r) => r.data),

  createMerchant: (body: {
    name: string;
    businessName: string;
    phone: string;
    pin: string;
  }) =>
    api.post<{ user: AdminUser }>('/admin/users/merchants', body).then((r) => r.data.user),

  getUserById: (id: string) =>
    api.get<{ user: AdminUser; limits: UserLimits }>(`/admin/users/${id}`).then((r) => r.data),

  setBlacklist: (userId: string, blacklisted: boolean) =>
    api
      .patch<{ user: AdminUser }>(`/admin/users/${userId}/blacklist`, { blacklisted })
      .then((r) => r.data.user),

  assignPlan: (userId: string, planId: string | null, expiresAt?: string) =>
    api
      .patch<{ user: AdminUser }>(`/admin/users/${userId}/plan`, { planId, expiresAt })
      .then((r) => r.data.user),

  getInvoices: (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    search?: string;
    from?: string;
    to?: string;
  }) =>
    api
      .get<{
        invoices: AdminInvoice[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/admin/invoices', {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          userId: params?.userId,
          search: params?.search,
          from: params?.from,
          to: params?.to,
        },
      })
      .then((r) => r.data),

  createInvoice: (body: {
    customerName?: string;
    items: Array<{
      name: string;
      quantity: string | number;
      totalPrice: number;
      productId?: string;
      quantityNumeric?: number;
    }>;
    note?: string;
    paymentMode?: InvoicePaymentMode;
    customerPhone?: string;
  }) =>
    api.post<{ invoice: AdminInvoice }>('/admin/invoices', body).then((r) => r.data.invoice),

  /** Speech-to-text: create bill from voice recording (same API as app). */
  createVoiceInvoice: (formData: FormData) =>
    api.post<{ invoice: AdminInvoice }>('/invoices/voice', formData, { timeout: 60000 }).then((r) => r.data.invoice),

  /** Preview voice: get parsed items + transcript without creating invoice. */
  previewVoiceInvoice: (formData: FormData) =>
    api
      .post<{ items: Array<{ name: string; quantity: string; totalPrice: number }>; transcript: string; total: number }>(
        '/invoices/voice/preview',
        formData,
        { timeout: 60000 }
      )
      .then((r) => r.data),

  /** Create invoice from reviewed voice data (after user edits in review screen). */
  createFromVoicePreview: (body: {
    customerName: string;
    items: Array<{
      name: string;
      quantity: string | number;
      totalPrice: number;
      productId?: string;
      quantityNumeric?: number;
    }>;
    transcript?: string;
    durationSec?: number;
  }) =>
    api.post<{ invoice: AdminInvoice }>('/invoices/voice/create-from-preview', body).then((r) => r.data.invoice),

  updateInvoice: (id: string, body: { customerName?: string; items?: Array<{ name: string; quantity: string | number; totalPrice: number }>; voiceTranscript?: string }) =>
    api.put<{ invoice: AdminInvoice }>(`/admin/invoices/${id}`, body).then((r) => r.data.invoice),

  listOutOfStock: () =>
    api.get<{ items: OutOfStockItem[] }>('/admin/out-of-stock').then((r) => r.data),

  createOutOfStock: (body: { name: string; quantity?: string; note?: string }) =>
    api.post<{ item: OutOfStockItem }>('/admin/out-of-stock', body).then((r) => r.data.item),

  createOutOfStockFromVoice: (formData: FormData) =>
    api.post<{ items: OutOfStockItem[] }>('/admin/out-of-stock/voice', formData, { timeout: 60000 }).then((r) => r.data.items),

  updateOutOfStock: (id: string, body: { name?: string; quantity?: string; note?: string }) =>
    api.put<{ item: OutOfStockItem }>(`/admin/out-of-stock/${id}`, body).then((r) => r.data.item),

  deleteOutOfStock: (id: string) =>
    api.delete(`/admin/out-of-stock/${id}`).then((r) => r.data),

  getInvoiceById: (id: string) =>
    api
      .get<{ invoice: Omit<AdminInvoice, 'pdfUrl'> & { pdfUrl?: string } }>(`/admin/invoices/${id}`)
      .then((r) => r.data.invoice),

  getQrCode: () =>
    api.get<{ url: string | null }>('/admin/qr-code').then((r) => r.data),

  uploadQrCode: (formData: FormData) =>
    api.post<{ url: string }>('/admin/qr-code', formData).then((r) => r.data),

  deleteQrCode: () =>
    api.delete('/admin/qr-code').then((r) => r.data),

  createPaymentOrder: (planId: string) =>
    api.post<{ isFree: boolean; orderId?: string; amount?: number; currency?: string; keyId?: string; message?: string }>('/payment/create-order', { planId }).then(r => r.data),

  verifyPayment: (body: { orderId: string; paymentId: string; signature: string; planId: string }) =>
    api.post<{ success: boolean; message: string }>('/payment/verify', body).then(r => r.data),

  getPlans: () => 
    api.get<{ plans: any[] }>('/plans').then(r => r.data.plans),

  getStockSummary: () =>
    api
      .get<{
        totalProducts: number;
        totalCategories: number;
        inventoryValue: number;
        lowStockCount: number;
      }>('/admin/stock/summary')
      .then(r => r.data),

  listStockCategories: () =>
    api.get<{ categories: StockCategory[] }>('/admin/stock/categories').then(r => r.data.categories),

  createStockCategory: (body: { name: string; sortOrder?: number }) =>
    api.post<{ category: StockCategory }>('/admin/stock/categories', body).then(r => r.data.category),

  updateStockCategory: (id: string, body: { name?: string; sortOrder?: number }) =>
    api.put<{ category: StockCategory }>(`/admin/stock/categories/${id}`, body).then(r => r.data.category),

  deleteStockCategory: (id: string) =>
    api.delete(`/admin/stock/categories/${id}`).then(r => r.data),

  listStockProducts: (params?: { q?: string; categoryId?: string; page?: number; limit?: number }) =>
    api
      .get<{
        products: StockProduct[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/admin/stock/products', { params })
      .then(r => r.data),

  createStockProduct: (body: {
    categoryId?: string;
    categoryName?: string;
    name: string;
    unit: string;
    unitPrice: number;
    quantityOnHand: number;
    lowStockThreshold?: number;
  }) => api.post<{ product: StockProduct }>('/admin/stock/products', body).then(r => r.data.product),

  bulkCreateStockProducts: (body: {
    products: {
      categoryId?: string;
      categoryName?: string;
      name: string;
      unit: string;
      unitPrice: number;
      quantityOnHand: number;
      lowStockThreshold?: number;
    }[];
  }) =>
    api
      .post<{ products: StockProduct[] }>('/admin/stock/products/bulk', body)
      .then((r) => r.data.products),

  updateStockProduct: (
    id: string,
    body: {
      categoryId?: string;
      categoryName?: string;
      name?: string;
      unit?: string;
      unitPrice?: number;
      quantityOnHand?: number;
      lowStockThreshold?: number | null;
    },
  ) => api.put<{ product: StockProduct }>(`/admin/stock/products/${id}`, body).then(r => r.data.product),

  deleteStockProduct: (id: string) => api.delete(`/admin/stock/products/${id}`).then(r => r.data),

  adjustStockProduct: (body: { productId: string; delta: number; note?: string }) =>
    api.post<{ product: StockProduct }>('/admin/stock/products/adjust', body).then(r => r.data.product),

  intakeStockFromVoice: (formData: FormData) =>
    api
      .post<{ transcript: string; products: StockProduct[] }>('/admin/stock/products/voice', formData, {
        timeout: 60000,
      })
      .then(r => r.data),

  getAiVisionDemoPinStatus: () =>
    api.get<{ required: boolean }>('/admin/ai-vision/demo-pin-status').then(r => r.data),

  verifyAiVisionDemoPin: (pin: string) =>
    api
      .post<{ ok: boolean; required: boolean }>('/admin/ai-vision/verify-demo-pin', { pin })
      .then(r => r.data),

  analyzeMenuImport: (formData: FormData, visionPin?: string) =>
    api
      .post<MenuImportAnalyzeResponse>('/admin/stock/products/menu-import/analyze', formData, {
        timeout: 120000,
        headers: visionPin ? { 'X-BoloBill-Ai-Demo-Pin': visionPin } : undefined,
      })
      .then(r => r.data),

  matchMenuImportItems: (body: { items: { tempId: string; name: string }[] }) =>
    api
      .post<{ matches: MenuImportMatchRow[] }>('/admin/stock/products/menu-import/match', body)
      .then(r => r.data.matches),

  commitMenuImport: (body: { products: MenuImportCommitProduct[] }) =>
    api
      .post<{
        imported: number;
        skipped: number;
        message: string;
        products: StockProduct[];
      }>('/admin/stock/products/menu-import/commit', body)
      .then(r => r.data),

  parseStockImportFile: (formData: FormData) =>
    api
      .post<MenuImportAnalyzeResponse>('/admin/stock/products/import/parse-file', formData, {
        timeout: 60000,
      })
      .then(r => r.data),

  parseStockImportPaste: (body: { text: string }) =>
    api
      .post<MenuImportAnalyzeResponse>('/admin/stock/products/import/parse-paste', body)
      .then(r => r.data),

  analyzeOosImport: (formData: FormData, visionPin?: string) =>
    api
      .post<OosImportPreviewResponse>('/admin/out-of-stock/import/analyze', formData, {
        timeout: 120000,
        headers: visionPin ? { 'X-BoloBill-Ai-Demo-Pin': visionPin } : undefined,
      })
      .then(r => r.data),

  parseOosImportFile: (formData: FormData) =>
    api
      .post<OosImportPreviewResponse>('/admin/out-of-stock/import/parse-file', formData, {
        timeout: 60000,
      })
      .then(r => r.data),

  parseOosImportPaste: (body: { text: string }) =>
    api.post<OosImportPreviewResponse>('/admin/out-of-stock/import/parse-paste', body).then(r => r.data),

  matchOosImportItems: (body: { items: { tempId: string; name: string }[] }) =>
    api
      .post<{ matches: OosImportMatchRow[] }>('/admin/out-of-stock/import/match', body)
      .then(r => r.data.matches),

  commitOosImport: (body: {
    items: { name: string; quantity?: string; note?: string }[];
  }) =>
    api
      .post<{ imported: number; skipped: number; message: string }>(
        '/admin/out-of-stock/import/commit',
        body,
      )
      .then(r => r.data),

  lookupAddressBookContact: (phone: string) =>
    api
      .get<{ found: boolean; contact?: AddressBookContact }>('/admin/address-book/lookup', {
        params: { phone },
      })
      .then(r => r.data),

  saveAddressBookContact: (body: { phone: string; name: string }) =>
    api.post<{ contact: AddressBookContact }>('/admin/address-book', body).then(r => r.data.contact),

  listAddressBookContacts: (params?: { q?: string; page?: number; limit?: number }) =>
    api
      .get<{
        contacts: AddressBookContact[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/admin/address-book', { params })
      .then(r => r.data),

  deleteAddressBookContact: (id: string) =>
    api.delete(`/admin/address-book/${id}`).then(r => r.data),

  listCreditAccounts: (params?: {
    q?: string;
    pendingOnly?: boolean;
    page?: number;
    limit?: number;
  }) =>
    api
      .get<{
        accounts: CreditAccountSummary[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        financeRedacted?: boolean;
      }>('/admin/credit', { params })
      .then(r => r.data),

  getCreditAccount: (phone: string) =>
    api
      .get<{
        account: CreditAccountSummary;
        ledger: CreditLedgerEntry[];
        invoices: AdminInvoice[];
        financeRedacted?: boolean;
      }>(`/admin/credit/${encodeURIComponent(phone)}`)
      .then(r => r.data),

  recordCreditPayment: (phone: string, body: { amount: number; note?: string }) =>
    api
      .post<{ account: CreditAccountSummary; entry: CreditLedgerEntry }>(
        `/admin/credit/${encodeURIComponent(phone)}/payments`,
        body,
      )
      .then(r => r.data),
};

type AdminApiShape = typeof realAdminApi;

export const adminApi: AdminApiShape = new Proxy(realAdminApi, {
  get(target, prop: string | symbol) {
    if (typeof prop === 'string' && isGuestMode()) {
      const guestFn = (guestAdminApi as Record<string, unknown>)[prop];
      if (typeof guestFn === 'function') {
        return guestFn.bind(guestAdminApi);
      }
      return () =>
        Promise.reject(new Error(`Guest preview does not support "${prop}".`));
    }
    const value = (target as Record<string, unknown>)[prop as string];
    return typeof value === 'function' ? value.bind(target) : value;
  },
}) as AdminApiShape;

export interface CreditAccountSummary {
  phone: string;
  customerName: string;
  totalCredited: number | null;
  totalPaid: number | null;
  pendingBalance: number | null;
  lastActivityAt?: string;
  createdAt?: string;
  updatedAt?: string;
  financeRedacted?: boolean;
}

export interface CreditLedgerEntry {
  id: string;
  type: 'sale' | 'payment';
  amount: number | null;
  invoiceId: string | null;
  invoicePublicId: string;
  note: string;
  createdAt: string;
  financeRedacted?: boolean;
}
