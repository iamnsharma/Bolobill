import path from 'path';
import fs from 'fs';
import {ApiError} from '../../common/ApiError';
import {InvoiceModel} from '../../models/Invoice.model';
import {UserModel} from '../../models/User.model';
import type {UserDocument} from '../../models/User.model';
import {invoiceService} from '../invoice/invoice.service';
import {outOfStockService} from '../out-of-stock/outOfStock.service';

const STORE_LINKS_PATH = path.join(process.cwd(), 'storage', 'store-links.json');

function readStoreLinks(): { playStoreUrl: string; appStoreUrl: string } {
  try {
    const raw = fs.readFileSync(STORE_LINKS_PATH, 'utf-8');
    const data = JSON.parse(raw) as { playStoreUrl?: string; appStoreUrl?: string };
    return {
      playStoreUrl: typeof data.playStoreUrl === 'string' ? data.playStoreUrl : '',
      appStoreUrl: typeof data.appStoreUrl === 'string' ? data.appStoreUrl : '',
    };
  } catch {
    return { playStoreUrl: '', appStoreUrl: '' };
  }
}

function writeStoreLinks(data: { playStoreUrl: string; appStoreUrl: string }) {
  const dir = path.dirname(STORE_LINKS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STORE_LINKS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const adminService = {
  async getStats() {
    const appUserFilter = {role: {$nin: ['admin', 'superadmin']}};
    const [totalInvoices, totalUsers, blacklistedUsers, activeMemberships] = await Promise.all([
      InvoiceModel.countDocuments(),
      UserModel.countDocuments(appUserFilter),
      UserModel.countDocuments({...appUserFilter, isBlacklisted: true}),
      UserModel.countDocuments({...appUserFilter, 'subscription.status': 'active', 'subscription.expiresAt': {$gt: new Date()}}),
    ]);
    return {
      totalInvoices,
      totalUsers,
      blacklistedUsers,
      activeMemberships,
    };
  },

  /** Aggregate Whisper (voice-to-text) usage across all app users. Super admin only. */
  async getWhisperUsage() {
    const appUserFilter = {role: {$nin: ['admin', 'superadmin']}};
    const users = await UserModel.find(appUserFilter)
      .select('usage.voiceToTextSecondsUsed')
      .lean();
    const totalSeconds = users.reduce(
      (sum, u) => sum + (Number((u as { usage?: { voiceToTextSecondsUsed?: number } }).usage?.voiceToTextSecondsUsed) || 0),
      0,
    );
    const totalMinutes = totalSeconds / 60;
    // OpenAI Whisper API: $0.006 per minute (approximate)
    const costPerMinuteUSD = 0.006;
    const costUSD = totalMinutes * costPerMinuteUSD;
    // Approximate INR (use env or fixed rate; default ~83)
    const usdToInr = Number(process.env.USD_TO_INR) || 83;
    const costINR = costUSD * usdToInr;
    return {
      totalSeconds: Math.round(totalSeconds),
      totalMinutes: Math.round(totalMinutes * 100) / 100,
      costUSD: Math.round(costUSD * 100) / 100,
      costINR: Math.round(costINR * 100) / 100,
      usersWithUsage: users.filter((u) => Number((u as { usage?: { voiceToTextSecondsUsed?: number } }).usage?.voiceToTextSecondsUsed) > 0).length,
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

  async assignPlan(userId: string, planId: string | null, expiresAt?: Date) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    if (!planId) {
      user.subscription = { status: 'none', planId: undefined, expiresAt: undefined };
    } else {
      user.subscription = {
        planId: planId as unknown as any,
        status: 'active',
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }
    await user.save();
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

  async getSalesSummaryDaily(userId: string, from: Date, to: Date) {
    return invoiceService.getSalesSummaryDaily(userId, from, to);
  },

  async getItemsSold(userId: string, from?: Date, to?: Date) {
    return invoiceService.getItemsSold(userId, from, to);
  },

  async createInvoice(userId: string, payload: {
    customerName: string;
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

  async getQrCode(userId: string): Promise<{ url: string | null }> {
    const user = await UserModel.findById(userId).select('qrCodePath').lean();
    if (!user || !(user as UserDocument & { qrCodePath?: string }).qrCodePath) {
      return { url: null };
    }
    const qrPath = (user as UserDocument & { qrCodePath?: string }).qrCodePath as string;
    if (!fs.existsSync(qrPath)) {
      await UserModel.updateOne({ _id: userId }, { $set: { qrCodePath: '' } });
      return { url: null };
    }
    const filename = path.basename(qrPath);
    const { env } = await import('../../config/env');
    return { url: `${env.BASE_URL}/api/files/qr/${filename}` };
  },

  async uploadQrCode(userId: string, uploadedPath: string): Promise<{ url: string }> {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.qrCodePath && fs.existsSync(user.qrCodePath)) {
      fs.unlinkSync(user.qrCodePath);
    }
    user.qrCodePath = uploadedPath;
    await user.save();
    const filename = path.basename(uploadedPath);
    const { env } = await import('../../config/env');
    return { url: `${env.BASE_URL}/api/files/qr/${filename}` };
  },

  async deleteQrCode(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.qrCodePath && fs.existsSync(user.qrCodePath)) {
      fs.unlinkSync(user.qrCodePath);
    }
    user.qrCodePath = '';
    await user.save();
  },

  getStoreLinks(): { playStoreUrl: string; appStoreUrl: string } {
    return readStoreLinks();
  },

  updateStoreLinks(payload: { playStoreUrl?: string; appStoreUrl?: string }) {
    const current = readStoreLinks();
    const next = {
      playStoreUrl: typeof payload.playStoreUrl === 'string' ? payload.playStoreUrl.trim() : current.playStoreUrl,
      appStoreUrl: typeof payload.appStoreUrl === 'string' ? payload.appStoreUrl.trim() : current.appStoreUrl,
    };
    writeStoreLinks(next);
    return next;
  },
};
