import { api } from './client';

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  accountType?: string;
  role?: string;
  isBlacklisted: boolean;
  usage?: { invoiceRequestSuccessCount?: number; voiceToTextSecondsUsed?: number };
  createdAt: string;
  updatedAt: string;
}

export interface AdminInvoice {
  id: string;
  invoiceId: string;
  customerName: string;
  items: Array<{ name: string; quantity: string; totalPrice: number }>;
  total: number;
  voiceTranscript: string;
  pdfUrl: string;
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
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  filteredTotal: number;
}

export interface ItemSold {
  itemName: string;
  quantity: number;
  amount: number;
}

export interface OutOfStockItem {
  _id: string;
  name: string;
  quantity: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  getMe: () =>
    api.get<{ user: AdminUser; isSuperAdmin: boolean }>('/admin/me').then((r) => r.data),

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

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api
      .get<{ users: AdminUser[]; total: number; page: number; limit: number; totalPages: number }>(
        '/admin/users',
        { params: { page: params?.page ?? 1, limit: params?.limit ?? 20, search: params?.search } }
      )
      .then((r) => r.data),

  getUserById: (id: string) =>
    api.get<{ user: AdminUser }>(`/admin/users/${id}`).then((r) => r.data.user),

  setBlacklist: (userId: string, blacklisted: boolean) =>
    api
      .patch<{ user: AdminUser }>(`/admin/users/${userId}/blacklist`, { blacklisted })
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

  createInvoice: (body: { customerName?: string; items: Array<{ name: string; quantity: string | number; totalPrice: number }>; note?: string }) =>
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
    items: Array<{ name: string; quantity: string | number; totalPrice: number }>;
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

  getStoreLinks: () =>
    api.get<{ playStoreUrl: string; appStoreUrl: string }>('/admin/store-links').then((r) => r.data),

  updateStoreLinks: (body: { playStoreUrl?: string; appStoreUrl?: string }) =>
    api.put<{ playStoreUrl: string; appStoreUrl: string }>('/admin/store-links', body).then((r) => r.data),

  getQrCode: () =>
    api.get<{ url: string | null }>('/admin/qr-code').then((r) => r.data),

  uploadQrCode: (formData: FormData) =>
    api.post<{ url: string }>('/admin/qr-code', formData).then((r) => r.data),

  deleteQrCode: () =>
    api.delete('/admin/qr-code').then((r) => r.data),
};
