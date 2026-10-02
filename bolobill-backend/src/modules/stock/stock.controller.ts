import {Request, Response} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {ApiError} from '../../common/ApiError';
import type {AdminContext} from '../../middleware/admin.middleware';
import {invoiceService} from '../invoice/invoice.service';
import {stockService} from './stock.service';
import {
  adjustProductSchema,
  bulkCreateProductsSchema,
  createCategorySchema,
  createProductSchema,
  updateCategorySchema,
  updateProductSchema,
} from './stock.validation';

const getAdminContext = (req: Request): AdminContext => {
  const ctx = (req as Request & {adminContext?: AdminContext}).adminContext;
  if (!ctx) {
    throw new ApiError(403, 'Admin context required');
  }
  return ctx;
};

const parsePage = (q: unknown) => {
  const n = Number(q);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

const parseLimit = (q: unknown) => {
  const n = Number(q);
  return Number.isFinite(n) && n >= 1 ? Math.min(100, Math.floor(n)) : 50;
};

const toProductVm = (p: Record<string, unknown>) => ({
  _id: String(p._id),
  userId: String(p.userId),
  categoryId: p.categoryId,
  name: p.name,
  unit: p.unit,
  unitPrice: p.unitPrice,
  quantityOnHand: p.quantityOnHand,
  lowStockThreshold: p.lowStockThreshold ?? null,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

export const stockController = {
  getSummary: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const summary = await stockService.getSummary(ctx.userId);
    return res.json(summary);
  }),

  listCategories: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const categories = await stockService.listCategories(ctx.userId);
    return res.json({categories});
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const category = await stockService.createCategory(
      ctx.userId,
      parsed.data.name,
      parsed.data.sortOrder,
    );
    return res.status(201).json({category});
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const category = await stockService.updateCategory(ctx.userId, id, parsed.data);
    return res.json({category});
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await stockService.deleteCategory(ctx.userId, id);
    return res.json(result);
  }),

  listProducts: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const page = parsePage(req.query.page);
    const limit = parseLimit(req.query.limit);
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const result = await stockService.listProducts(ctx.userId, {q, categoryId, page, limit});
    return res.json({
      products: result.products.map(p => toProductVm(p as Record<string, unknown>)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const product = await stockService.createProduct(ctx.userId, parsed.data);
    return res.status(201).json({product: toProductVm(product.toObject())});
  }),

  bulkCreateProducts: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = bulkCreateProductsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const products = [];
    for (const row of parsed.data.products) {
      products.push(await stockService.createProduct(ctx.userId, row));
    }
    return res.status(201).json({products: products.map(p => toProductVm(p.toObject()))});
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const parsed = updateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const product = await stockService.updateProduct(ctx.userId, id, parsed.data);
    return res.json({product: toProductVm(product as Record<string, unknown>)});
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await stockService.deleteProduct(ctx.userId, id);
    return res.json(result);
  }),

  adjustProduct: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = adjustProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const product = await stockService.adjustProduct(
      ctx.userId,
      parsed.data.productId,
      parsed.data.delta,
      parsed.data.note,
    );
    return res.json({product: toProductVm(product as Record<string, unknown>)});
  }),

  intakeFromVoice: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    if (!req.file?.path) {
      throw new ApiError(400, 'audio file is required');
    }
    const language = typeof req.body?.language === 'string' ? req.body.language : undefined;
    try {
      const result = await stockService.intakeFromVoice(ctx.userId, req.file.path, language);
      return res.status(201).json({
        transcript: result.transcript,
        products: result.products.map(p => toProductVm(p.toObject())),
      });
    } finally {
      await invoiceService.cleanupTempFile(req.file.path);
    }
  }),
};
