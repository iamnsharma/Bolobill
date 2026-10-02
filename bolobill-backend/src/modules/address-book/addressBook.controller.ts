import {Request, Response} from 'express';
import {ApiError} from '../../common/ApiError';
import {asyncHandler} from '../../common/asyncHandler';
import type {AdminContext} from '../../middleware/admin.middleware';
import {addressBookService} from './addressBook.service';
import {listContactsSchema, lookupPhoneSchema, upsertContactSchema} from './addressBook.validation';

const getAdminContext = (req: Request): AdminContext => {
  const ctx = (req as Request & {adminContext?: AdminContext}).adminContext;
  if (!ctx) throw new ApiError(403, 'Admin context required');
  return ctx;
};

export const addressBookController = {
  lookup: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = lookupPhoneSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid query');
    }
    try {
      const result = await addressBookService.lookup(ctx.userId, parsed.data.phone);
      return res.json(result);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 400) {
        return res.json({found: false});
      }
      throw e;
    }
  }),

  upsert: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = upsertContactSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const contact = await addressBookService.upsert(
      ctx.userId,
      parsed.data.phone,
      parsed.data.name,
    );
    return res.status(201).json({contact});
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = listContactsSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid query');
    }
    const page = parsed.data.page ?? 1;
    const limit = parsed.data.limit ?? 50;
    const result = await addressBookService.list(ctx.userId, {
      q: parsed.data.q,
      page,
      limit,
    });
    return res.json(result);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) throw new ApiError(400, 'Contact id required');
    await addressBookService.remove(ctx.userId, id);
    return res.json({ok: true});
  }),
};
