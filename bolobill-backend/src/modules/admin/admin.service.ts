import {ApiError} from '../../common/ApiError';
import {InvoiceModel} from '../../models/Invoice.model';
import {UserModel} from '../../models/User.model';
import type {UserDocument} from '../../models/User.model';
import {invoiceService} from '../invoice/invoice.service';
import {outOfStockService} from '../out-of-stock/outOfStock.service';

export const adminService = {
  async getStats() {
    const appUserFilter = {role: {$nin: ['admin', 'superadmin']}};
    const [totalInvoices, totalUsers, blacklistedUsers] = await Promise.all([
      InvoiceModel.countDocuments(),
      UserModel.countDocuments(appUserFilter),
      UserModel.countDocuments({...appUserFilter, isBlacklisted: true}),
    ]);
    return {
      totalInvoices,
      totalUsers,
      blacklistedUsers,
      activeMemberships: 0, // Not implemented yet
    };
  },

  async listUsers(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {role: {$nin: ['admin', 'superadmin']}};
    if (params.search?.trim()) {
      const s = params.search.trim();
      filter.$or = [
        {name: new RegExp(s, 'i')},
        {phone: new RegExp(s, 'i')},
        {businessName: new RegExp(s, 'i')},
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUserById(id: string): Promise<UserDocument> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async setBlacklist(userId: string, blacklisted: boolean) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {$set: {isBlacklisted: blacklisted}},
      {new: true},
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async listInvoices(params: {
    page?: number;
    limit?: number;
    userId?: string;
    search?: string;
    from?: Date;
    to?: Date;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (params.userId?.trim()) {
      filter.userId = params.userId.trim();
    }
    if (params.from || params.to) {
      filter.createdAt = {};
      if (params.from) (filter.createdAt as Record<string, Date>).$gte = params.from;
      if (params.to) (filter.createdAt as Record<string, Date>).$lte = params.to;
    }
    if (params.search?.trim()) {
      filter.$or = [
        {invoiceId: new RegExp(params.search.trim(), 'i')},
        {customerName: new RegExp(params.search.trim(), 'i')},
      ];
    }

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(filter)
        .populate('userId', 'name phone businessName')
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .lean(),
      InvoiceModel.countDocuments(filter),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getInvoiceById(id: string, scopeUserId?: string) {
    const filter: Record<string, unknown> = {_id: id};
    if (scopeUserId) filter.userId = scopeUserId;
    const invoice = await InvoiceModel.findOne(filter)
      .populate('userId', 'name phone businessName')
      .lean();
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }
    return invoice;
  },

  async getSalesSummary(userId: string, from?: Date, to?: Date) {
    return invoiceService.getSalesSummary(userId, from, to);
  },

  async getItemsSold(userId: string, from?: Date, to?: Date) {
    return invoiceService.getItemsSold(userId, from, to);
  },

  async createInvoice(userId: string, payload: {
    customerName?: string;
    items: { name: string; quantity: string | number; totalPrice: number }[];
    note?: string;
  }) {
    const items = payload.items.map((it) => ({
      name: it.name,
      quantity: typeof it.quantity === 'number' ? String(it.quantity) : it.quantity,
      totalPrice: it.totalPrice,
    }));
    return invoiceService.createManualInvoice({
      userId,
      customerName: payload.customerName,
      items,
      note: payload.note,
    });
  },

  async updateInvoice(id: string, payload: {
    customerName?: string;
    items?: { name: string; quantity: string | number; totalPrice: number }[];
    voiceTranscript?: string;
  }) {
    const invoice = await InvoiceModel.findById(id);
    if (!invoice) throw new ApiError(404, 'Invoice not found');
    const uid = (invoice.userId as unknown as { toString(): string }).toString();
    const normalizedPayload = {
      ...payload,
      items: payload.items?.map((it) => ({
        name: it.name,
        quantity: typeof it.quantity === 'number' ? String(it.quantity) : it.quantity,
        totalPrice: it.totalPrice,
      })),
    };
    return invoiceService.updateInvoice(uid, id, normalizedPayload);
  },

  async listOutOfStock(userId: string) {
    return outOfStockService.list(userId);
  },

  async createOutOfStock(userId: string, payload: {name: string; quantity?: string; note?: string}) {
    return outOfStockService.create(userId, payload);
  },

  async updateOutOfStock(userId: string, id: string, payload: {name?: string; quantity?: string; note?: string}) {
    return outOfStockService.update(userId, id, payload);
  },

  async deleteOutOfStock(userId: string, id: string) {
    return outOfStockService.delete(userId, id);
  },

  async getOutOfStockById(userId: string, id: string) {
    return outOfStockService.getById(userId, id);
  },

  async createOutOfStockFromVoice(userId: string, audioPath: string, language?: string) {
    const items = await invoiceService.getItemsFromVoice({audioPath, language});
    if (!items.length) {
      throw new ApiError(422, 'Unable to parse items from recording. Speak clearly, e.g. "rice, salt, oil".');
    }
    const created = [];
    for (const item of items) {
      const doc = await outOfStockService.create(userId, {
        name: item.name,
        quantity: item.quantity || undefined,
      });
      created.push(doc);
    }
    return created;
  },
};
