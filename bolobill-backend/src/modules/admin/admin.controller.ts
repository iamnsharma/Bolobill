import {Request, Response} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {adminService} from './admin.service';
import {toAdminUserVm, toAdminInvoiceVm} from './admin.viewmodel';

const parsePage = (q: unknown) => {
  const n = Number(q);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};
const parseLimit = (q: unknown) => {
  const n = Number(q);
  return Number.isFinite(n) && n >= 1 ? Math.min(100, Math.floor(n)) : 20;
};

export const adminController = {
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

  listInvoices: asyncHandler(async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const result = await adminService.listInvoices({page, limit, userId, search});
    const invoices = result.invoices.map((inv) => toAdminInvoiceVm(inv as Parameters<typeof toAdminInvoiceVm>[0]));
    return res.json({
      invoices,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),
};
