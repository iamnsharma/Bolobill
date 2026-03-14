import {Request, Response} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {ApiError} from '../../common/ApiError';
import {adminService} from './admin.service';
import {toAdminUserVm, toAdminInvoiceVm} from './admin.viewmodel';
import type {AdminContext} from '../../middleware/admin.middleware';
import {manualInvoiceSchema, updateInvoiceSchema} from '../invoice/invoice.validation';
import {invoiceService} from '../invoice/invoice.service';

const getAdminContext = (req: Request): AdminContext => {
  const ctx = (req as Request & { adminContext?: AdminContext }).adminContext;
  if (!ctx) throw new ApiError(403, 'Admin context required');
  return ctx;
};

const parsePage = (q: unknown) => {
  const n = Number(q);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};
const parseLimit = (q: unknown) => {
  const n = Number(q);
  return Number.isFinite(n) && n >= 1 ? Math.min(100, Math.floor(n)) : 20;
};

const parseDate = (q: unknown): Date | undefined => {
  if (typeof q !== 'string') return undefined;
  const d = new Date(q);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export const adminController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const user = await adminService.getUserById(ctx.userId);
    return res.json({
      user: toAdminUserVm(user),
      isSuperAdmin: ctx.isSuperAdmin,
    });
  }),

  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await adminService.getStats();
    return res.json(stats);
  }),

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const result = await adminService.listUsers({page, limit, search});
    const users = result.users.map((u) => toAdminUserVm(u as Parameters<typeof toAdminUserVm>[0]));
    return res.json({
      users,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await adminService.getUserById(id);
    return res.json({user: toAdminUserVm(user)});
  }),

  setBlacklist: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const blacklisted = req.body?.blacklisted === true;
    const user = await adminService.setBlacklist(id, blacklisted);
    return res.json({user: toAdminUserVm(user)});
  }),

  getSalesSummary: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const userId = ctx.isSuperAdmin && typeof req.query.userId === 'string'
      ? req.query.userId
      : ctx.userId;
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const summary = await adminService.getSalesSummary(userId, from, to);
    return res.json(summary);
  }),

  getItemsSold: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const userId = ctx.isSuperAdmin && typeof req.query.userId === 'string'
      ? req.query.userId
      : ctx.userId;
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const items = await adminService.getItemsSold(userId, from, to);
    return res.json({items});
  }),

  listInvoices: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const userId = ctx.isSuperAdmin && typeof req.query.userId === 'string'
      ? req.query.userId
      : ctx.userId;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const from = parseDate(req.query.from);
    const to = parseDate(req.query.to);
    const result = await adminService.listInvoices({
      page,
      limit,
      userId,
      search,
      from,
      to,
    });
    const invoices = result.invoices.map((inv) => toAdminInvoiceVm(inv as Parameters<typeof toAdminInvoiceVm>[0]));
    return res.json({
      invoices,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  createInvoice: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = manualInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const items = parsed.data.items.map((it) => ({
      name: it.name,
      quantity: typeof it.quantity === 'number' ? it.quantity : parseFloat(String(it.quantity)) || 0,
      totalPrice: it.totalPrice,
    }));
    const invoice = await adminService.createInvoice(ctx.userId, {
      customerName: parsed.data.customerName,
      items,
      note: parsed.data.note,
    });
    const vm = toAdminInvoiceVm(invoice as Parameters<typeof toAdminInvoiceVm>[0]);
    return res.status(201).json({invoice: vm});
  }),

  getInvoiceById: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const scopeUserId = ctx.isSuperAdmin ? undefined : ctx.userId;
    const invoice = await adminService.getInvoiceById(id, scopeUserId);
    const vm = toAdminInvoiceVm(invoice as Parameters<typeof toAdminInvoiceVm>[0]);
    return res.json({invoice: vm});
  }),

  updateInvoice: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = updateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const payload = {
      customerName: parsed.data.customerName,
      items: parsed.data.items?.map((it) => ({
        name: it.name,
        quantity: typeof it.quantity === 'number' ? it.quantity : parseFloat(String(it.quantity)) || 0,
        totalPrice: it.totalPrice,
      })),
      voiceTranscript: parsed.data.voiceTranscript,
    };
    const invoice = await adminService.updateInvoice(id, payload);
    const vm = toAdminInvoiceVm(invoice as Parameters<typeof toAdminInvoiceVm>[0]);
    return res.json({invoice: vm});
  }),

  listOutOfStock: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const items = await adminService.listOutOfStock(ctx.userId);
    return res.json({items});
  }),

  createOutOfStock: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const name = typeof req.body?.name === 'string' ? req.body.name : '';
    if (!name.trim()) throw new ApiError(400, 'name is required');
    const item = await adminService.createOutOfStock(ctx.userId, {
      name,
      quantity: req.body?.quantity,
      note: req.body?.note,
    });
    return res.status(201).json({item});
  }),

  createOutOfStockFromVoice: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    if (!req.file?.path) {
      throw new ApiError(400, 'audio file is required');
    }
    const language = typeof req.body?.language === 'string' ? req.body.language : undefined;
    try {
      const items = await adminService.createOutOfStockFromVoice(ctx.userId, req.file.path, language);
      return res.status(201).json({items});
    } finally {
      await invoiceService.cleanupTempFile(req.file.path);
    }
  }),

  getOutOfStockById: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await adminService.getOutOfStockById(ctx.userId, id);
    return res.json({item});
  }),

  updateOutOfStock: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await adminService.updateOutOfStock(ctx.userId, id, {
      name: req.body?.name,
      quantity: req.body?.quantity,
      note: req.body?.note,
    });
    return res.json({item});
  }),

  deleteOutOfStock: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adminService.deleteOutOfStock(ctx.userId, id);
    return res.json({message: 'Deleted'});
  }),
};
