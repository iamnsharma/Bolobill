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

export const adminApi = {
  getStats: () =>
    api.get<AdminStats>('/admin/stats').then((r) => r.data),

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
        },
      })
      .then((r) => r.data),

  getInvoiceById: (id: string) =>
    api
      .get<{ invoice: Omit<AdminInvoice, 'pdfUrl'> & { pdfUrl?: string } }>(`/admin/invoices/${id}`)
      .then((r) => r.data.invoice),
};
