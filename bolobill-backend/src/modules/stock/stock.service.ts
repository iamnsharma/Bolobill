import mongoose, {ClientSession} from 'mongoose';
import {ApiError} from '../../common/ApiError';
import {StockCategoryModel} from '../../models/StockCategory.model';
import {StockProductModel} from '../../models/StockProduct.model';
import {StockMovementModel} from '../../models/StockMovement.model';
import {transcribeAudio, extractStockItemsFromTranscript} from '../../services/whisper.service';

export const GENERAL_CATEGORY_NAME = 'General';

export const normalizeProductName = (name: string) => name.trim().toLowerCase();

export type InvoiceStockLine = {
  productId?: string;
  quantityNumeric?: number;
  name: string;
};

const isReplicaSetTransactionError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const e = error as {code?: number; codeName?: string; message?: string};
  return (
    e.code === 20 ||
    e.codeName === 'IllegalOperation' ||
    (typeof e.message === 'string' &&
      e.message.includes('Transaction numbers are only allowed on a replica set'))
  );
};

/** Uses a transaction when MongoDB supports it; otherwise runs the same work without one. */
const runWithOptionalTransaction = async <T>(
  fn: (session: ClientSession | null) => Promise<T>,
): Promise<T> => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction().catch(() => undefined);
    }
    if (isReplicaSetTransactionError(error)) {
      return fn(null);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const stockService = {
  async getOrCreateGeneralCategory(userId: string, session?: ClientSession | null) {
    const existing = await StockCategoryModel.findOne({userId, name: GENERAL_CATEGORY_NAME}).session(
      session ?? null,
    );
    if (existing) {
      return existing;
    }
    const created = await StockCategoryModel.create(
      [{userId, name: GENERAL_CATEGORY_NAME, sortOrder: 0}],
      session ? {session} : undefined,
    );
    return created[0];
  },

  async listCategories(userId: string) {
    return StockCategoryModel.find({userId}).sort({sortOrder: 1, name: 1}).lean();
  },

  async createCategory(userId: string, name: string, sortOrder?: number) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new ApiError(400, 'Category name is required');
    }
    const dup = await StockCategoryModel.findOne({
      userId,
      name: {$regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')},
    });
    if (dup) {
      throw new ApiError(409, 'Category already exists');
    }
    return StockCategoryModel.create({userId, name: trimmed, sortOrder: sortOrder ?? 0});
  },

  async getOrCreateCategoryByName(userId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new ApiError(400, 'Category name is required');
    }
    const existing = await StockCategoryModel.findOne({
      userId,
      name: {$regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')},
    });
    if (existing) {
      return existing;
    }
    return StockCategoryModel.create({userId, name: trimmed, sortOrder: 0});
  },

  async resolveCategoryId(
    userId: string,
    input: {categoryId?: string; categoryName?: string},
  ) {
    if (input.categoryId?.trim()) {
      const category = await StockCategoryModel.findOne({_id: input.categoryId.trim(), userId});
      if (!category) {
        throw new ApiError(404, 'Category not found');
      }
      return category._id;
    }
    if (input.categoryName?.trim()) {
      const category = await this.getOrCreateCategoryByName(userId, input.categoryName);
      return category._id;
    }
    throw new ApiError(400, 'Category is required');
  },

  async updateCategory(userId: string, id: string, payload: {name?: string; sortOrder?: number}) {
    const cat = await StockCategoryModel.findOne({_id: id, userId});
    if (!cat) {
      throw new ApiError(404, 'Category not found');
    }
    if (payload.name !== undefined) {
      const trimmed = payload.name.trim();
      if (!trimmed) {
        throw new ApiError(400, 'Category name is required');
      }
      cat.name = trimmed;
    }
    if (payload.sortOrder !== undefined) {
      cat.sortOrder = payload.sortOrder;
    }
    await cat.save();
    return cat;
  },

  async deleteCategory(userId: string, id: string) {
    const cat = await StockCategoryModel.findOne({_id: id, userId});
    if (!cat) {
      throw new ApiError(404, 'Category not found');
    }
    const productCount = await StockProductModel.countDocuments({userId, categoryId: cat._id});
    if (productCount > 0) {
      throw new ApiError(409, 'Remove all products in this category before deleting');
    }
    await cat.deleteOne();
    return {message: 'Deleted'};
  },

  async listProducts(
    userId: string,
    params: {q?: string; categoryId?: string; page?: number; limit?: number},
  ) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 50));
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {userId};
    if (params.categoryId?.trim()) {
      filter.categoryId = params.categoryId.trim();
    }
    if (params.q?.trim()) {
      const s = params.q.trim();
      filter.$or = [{name: new RegExp(s, 'i')}, {nameNormalized: new RegExp(s, 'i')}];
    }
    const [products, total] = await Promise.all([
      StockProductModel.find(filter)
        .populate('categoryId', 'name')
        .sort({name: 1})
        .skip(skip)
        .limit(limit)
        .lean(),
      StockProductModel.countDocuments(filter),
    ]);
    return {products, total, page, limit, totalPages: Math.ceil(total / limit)};
  },

  async getProductByIdPopulated(userId: string, productId: string) {
    const product = await StockProductModel.findOne({_id: productId, userId})
      .populate('categoryId', 'name')
      .lean();
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  },

  async createProduct(
    userId: string,
    payload: {
      categoryId?: string;
      categoryName?: string;
      name: string;
      unit: string;
      unitPrice: number;
      quantityOnHand: number;
      lowStockThreshold?: number;
    },
  ) {
    const categoryObjectId = await this.resolveCategoryId(userId, {
      categoryId: payload.categoryId,
      categoryName: payload.categoryName,
    });
    const name = payload.name.trim();
    if (!name) {
      throw new ApiError(400, 'Product name is required');
    }
    const nameNormalized = normalizeProductName(name);
    const existing = await StockProductModel.findOne({userId, nameNormalized});
    if (existing) {
      throw new ApiError(409, 'A product with this name already exists');
    }
    const qty = payload.quantityOnHand ?? 0;
    const product = await StockProductModel.create({
      userId,
      categoryId: categoryObjectId,
      name,
      nameNormalized,
      unit: payload.unit?.trim() || 'pcs',
      unitPrice: payload.unitPrice ?? 0,
      quantityOnHand: qty,
      lowStockThreshold: payload.lowStockThreshold ?? undefined,
    });
    if (qty > 0) {
      await StockMovementModel.create({
        userId,
        productId: product._id,
        type: 'purchase',
        delta: qty,
        quantityAfter: qty,
        note: 'Initial stock',
      });
    }
    return product;
  },

  async updateProduct(
    userId: string,
    id: string,
    payload: {
      categoryId?: string;
      categoryName?: string;
      name?: string;
      unit?: string;
      unitPrice?: number;
      quantityOnHand?: number;
      lowStockThreshold?: number | null;
    },
  ) {
    const product = await StockProductModel.findOne({_id: id, userId});
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    if (payload.categoryId || payload.categoryName) {
      product.categoryId = await this.resolveCategoryId(userId, {
        categoryId: payload.categoryId,
        categoryName: payload.categoryName,
      });
    }
    if (payload.name !== undefined) {
      const name = payload.name.trim();
      if (!name) {
        throw new ApiError(400, 'Product name is required');
      }
      const nameNormalized = normalizeProductName(name);
      const dup = await StockProductModel.findOne({
        userId,
        nameNormalized,
        _id: {$ne: product._id},
      });
      if (dup) {
        throw new ApiError(409, 'A product with this name already exists');
      }
      product.name = name;
      product.nameNormalized = nameNormalized;
    }
    if (payload.unit !== undefined) {
      product.unit = payload.unit.trim() || 'pcs';
    }
    if (payload.unitPrice !== undefined) {
      product.unitPrice = payload.unitPrice;
    }
    if (payload.lowStockThreshold !== undefined) {
      product.lowStockThreshold = payload.lowStockThreshold;
    }
    if (payload.quantityOnHand !== undefined) {
      const delta = payload.quantityOnHand - product.quantityOnHand;
      if (delta !== 0) {
        await this.applyMovement({
          userId,
          productId: product._id.toString(),
          delta,
          type: 'adjustment',
          note: 'Manual quantity set',
        });
      }
      return this.getProductByIdPopulated(userId, product._id.toString());
    }
    await product.save();
    return this.getProductByIdPopulated(userId, product._id.toString());
  },

  async deleteProduct(userId: string, id: string) {
    const product = await StockProductModel.findOne({_id: id, userId});
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    if (product.quantityOnHand > 0) {
      throw new ApiError(409, 'Set quantity to zero before deleting this product');
    }
    const movementCount = await StockMovementModel.countDocuments({productId: product._id});
    if (movementCount > 0) {
      throw new ApiError(409, 'Cannot delete product with movement history');
    }
    await product.deleteOne();
    return {message: 'Deleted'};
  },

  async adjustProduct(userId: string, productId: string, delta: number, note?: string) {
    if (!Number.isFinite(delta) || delta === 0) {
      throw new ApiError(400, 'delta must be a non-zero number');
    }
    await this.applyMovement({
      userId,
      productId,
      delta,
      type: 'adjustment',
      note: note?.trim() || 'Manual adjustment',
    });
    return this.getProductByIdPopulated(userId, productId);
  },

  async applyMovement(input: {
    userId: string;
    productId: string;
    delta: number;
    type: 'purchase' | 'sale' | 'adjustment' | 'reversal';
    invoiceId?: string;
    note?: string;
    session?: ClientSession | null;
  }) {
    const apply = async (session: ClientSession | null) => {
      const product = await StockProductModel.findOne({
        _id: input.productId,
        userId: input.userId,
      }).session(session);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }
      const nextQty = product.quantityOnHand + input.delta;
      if (nextQty < 0) {
        throw new ApiError(
          409,
          `Insufficient stock for "${product.name}": available ${product.quantityOnHand} ${product.unit}`,
        );
      }
      product.quantityOnHand = nextQty;
      await product.save(session ? {session} : undefined);
      await StockMovementModel.create(
        [
          {
            userId: input.userId,
            productId: product._id,
            type: input.type,
            delta: input.delta,
            quantityAfter: nextQty,
            invoiceId: input.invoiceId,
            note: input.note ?? '',
          },
        ],
        session ? {session} : undefined,
      );
      return product;
    };

    if (input.session) {
      return apply(input.session);
    }
    return apply(null);
  },

  async upsertStockFromParsedItems(
    userId: string,
    items: Array<{name: string; unitPrice: number; quantityNumeric: number; unit?: string}>,
    note?: string,
  ) {
    const general = await this.getOrCreateGeneralCategory(userId);
    const results = [];
    for (const item of items) {
      const nameNormalized = normalizeProductName(item.name);
      let product = await StockProductModel.findOne({userId, nameNormalized});
      if (product) {
        await this.applyMovement({
          userId,
          productId: product._id.toString(),
          delta: item.quantityNumeric,
          type: 'purchase',
          note: note || 'Voice stock intake',
        });
        if (item.unitPrice >= 0) {
          product.unitPrice = item.unitPrice;
          if (item.unit) {
            product.unit = item.unit;
          }
          await product.save();
        }
      } else {
        product = await StockProductModel.create({
          userId,
          categoryId: general._id,
          name: item.name.trim(),
          nameNormalized,
          unit: item.unit?.trim() || 'pcs',
          unitPrice: item.unitPrice,
          quantityOnHand: item.quantityNumeric,
        });
        await StockMovementModel.create({
          userId,
          productId: product._id,
          type: 'purchase',
          delta: item.quantityNumeric,
          quantityAfter: item.quantityNumeric,
          note: note || 'Voice stock intake',
        });
      }
      results.push(product);
    }
    return results;
  },

  async intakeFromVoice(userId: string, audioPath: string, language?: string) {
    const transcript = await transcribeAudio(audioPath, language);
    let items = await extractStockItemsFromTranscript(transcript);
    if (!items?.length) {
      throw new ApiError(
        422,
        'Unable to parse stock from recording. Try e.g. "chawal 50 rupees 10 kilo".',
      );
    }
    const products = await this.upsertStockFromParsedItems(userId, items, transcript.slice(0, 500));
    return {transcript, products};
  },

  async getSummary(userId: string) {
    const products = await StockProductModel.find({userId}).lean();
    const categories = await StockCategoryModel.countDocuments({userId});
    let inventoryValue = 0;
    let lowStockCount = 0;
    for (const p of products) {
      inventoryValue += (p.quantityOnHand || 0) * (p.unitPrice || 0);
      const threshold = p.lowStockThreshold;
      if (typeof threshold === 'number' && p.quantityOnHand <= threshold) {
        lowStockCount += 1;
      }
    }
    return {
      totalProducts: products.length,
      totalCategories: categories,
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      lowStockCount,
    };
  },

  async applySaleDeduction(
    userId: string,
    productId: string,
    soldQty: number,
    invoiceId: string,
    productName: string,
    session: ClientSession | null,
  ): Promise<{deducted: number}> {
    const product = await StockProductModel.findOne({
      _id: productId,
      userId,
    }).session(session);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    const onHand = product.quantityOnHand;
    const deducted = Math.min(soldQty, Math.max(0, onHand));
    const nextQty = Math.max(0, onHand - soldQty);
    const delta = nextQty - onHand;

    if (delta !== 0) {
      product.quantityOnHand = nextQty;
      await product.save(session ? {session} : undefined);
    }

    const oversold = soldQty > onHand;
    const note = oversold
      ? `Sale: ${productName} (sold ${soldQty}, deducted ${deducted} from ${onHand} on hand)`
      : `Sale: ${productName}`;

    if (delta !== 0 || oversold) {
      await StockMovementModel.create(
        [
          {
            userId,
            productId: product._id,
            type: 'sale',
            delta,
            quantityAfter: nextQty,
            invoiceId,
            note,
          },
        ],
        session ? {session} : undefined,
      );
    }

    return {deducted};
  },

  async validateSaleStockAvailability(
    userId: string,
    lines: InvoiceStockLine[],
  ) {
    for (const line of lines) {
      if (!line.productId || !line.quantityNumeric || line.quantityNumeric <= 0) {
        continue;
      }
      const product = await StockProductModel.findOne({
        _id: line.productId,
        userId,
      });
      if (!product) {
        throw new ApiError(404, `Product not found for "${line.name}"`);
      }
      if (line.quantityNumeric > product.quantityOnHand) {
        throw new ApiError(
          409,
          `Not enough stock for "${product.name}": ${product.quantityOnHand} ${product.unit} available, bill has ${line.quantityNumeric}`,
        );
      }
    }
  },

  async applySaleLines(
    userId: string,
    invoiceId: string,
    lines: InvoiceStockLine[],
    session: ClientSession | null,
  ): Promise<Array<{productId: string; stockQuantityDeducted: number}>> {
    const results: Array<{productId: string; stockQuantityDeducted: number}> = [];
    for (const line of lines) {
      if (!line.productId || !line.quantityNumeric || line.quantityNumeric <= 0) {
        continue;
      }
      const {deducted} = await this.applySaleDeduction(
        userId,
        line.productId,
        line.quantityNumeric,
        invoiceId,
        line.name,
        session,
      );
      results.push({productId: line.productId, stockQuantityDeducted: deducted});
    }
    return results;
  },

  async reverseSaleLines(
    userId: string,
    invoiceId: string,
    lines: Array<{
      productId?: mongoose.Types.ObjectId;
      quantityNumeric?: number;
      stockQuantityDeducted?: number;
      name?: string;
    }>,
    session: ClientSession | null,
  ) {
    for (const line of lines) {
      const productId = line.productId?.toString();
      const restoreQty =
        line.stockQuantityDeducted != null && line.stockQuantityDeducted >= 0
          ? line.stockQuantityDeducted
          : line.quantityNumeric;
      if (!productId || !restoreQty || restoreQty <= 0) {
        continue;
      }
      await this.applyMovement({
        userId,
        productId,
        delta: restoreQty,
        type: 'reversal',
        invoiceId,
        note: `Reversal: ${line.name ?? 'item'}`,
        session,
      });
    }
  },

  runWithOptionalTransaction,
};
