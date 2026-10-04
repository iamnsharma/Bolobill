import {v4 as uuidv4} from 'uuid';
import {ApiError} from '../../common/ApiError';
import {StockProductModel} from '../../models/StockProduct.model';
import {
  extractMenuFromImage,
  type ExtractedMenuCategory,
} from '../../services/menuImportVision.service';
import {
  ExistingProductRef,
  findBestExistingProductMatch,
} from '../../utils/productNameMatch';
import {stockService} from './stock.service';

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
  prefillQuantityOnHand: number | null;
  duplicateStatus: MenuImportDuplicateStatus;
  matchedProductId: string | null;
  matchedProductName: string | null;
};

export type MenuImportAnalyzeResult = {
  summary: {found: number; newCount: number; existsCount: number};
  categories: MenuImportPreviewCategory[];
  items: MenuImportPreviewItem[];
};

const listAllProductsForUser = async (userId: string): Promise<ExistingProductRef[]> => {
  const products = await StockProductModel.find({userId})
    .select('_id name nameNormalized')
    .lean();
  return products.map(p => ({
    _id: String(p._id),
    name: String(p.name),
    nameNormalized: p.nameNormalized ? String(p.nameNormalized) : undefined,
  }));
};

const attachDuplicateFlags = (
  items: Omit<
    MenuImportPreviewItem,
    'duplicateStatus' | 'matchedProductId' | 'matchedProductName'
  >[],
  existing: ExistingProductRef[],
): MenuImportPreviewItem[] => {
  return items.map(item => {
    const match = findBestExistingProductMatch(item.name, existing);
    if (match.matched && match.productId) {
      return {
        ...item,
        duplicateStatus: 'exists',
        matchedProductId: match.productId,
        matchedProductName: match.productName ?? null,
      };
    }
    return {
      ...item,
      duplicateStatus: 'new',
      matchedProductId: null,
      matchedProductName: null,
    };
  });
};

export const buildStockImportPreview = (
  extracted: ExtractedMenuCategory[],
  existing: ExistingProductRef[],
): MenuImportAnalyzeResult => {
  const categories: MenuImportPreviewCategory[] = [];
  const rawItems: Omit<
    MenuImportPreviewItem,
    'duplicateStatus' | 'matchedProductId' | 'matchedProductName'
  >[] = [];

  extracted.forEach((cat, catIndex) => {
    const categoryTempId = uuidv4();
    categories.push({
      tempId: categoryTempId,
      name: cat.name,
      sortOrder: catIndex,
    });
    for (const item of cat.items) {
      rawItems.push({
        tempId: uuidv4(),
        categoryTempId,
        name: item.name,
        unit: item.unit ?? 'pcs',
        unitPrice: item.unitPrice,
        lowStockThreshold: item.lowStockThreshold,
        prefillQuantityOnHand: item.quantityOnHand ?? null,
      });
    }
  });

  const items = attachDuplicateFlags(rawItems, existing);
  const existsCount = items.filter(i => i.duplicateStatus === 'exists').length;
  const newCount = items.length - existsCount;

  return {
    summary: {found: items.length, newCount, existsCount},
    categories,
    items,
  };
};

export const menuImportService = {
  async analyzeMenuImage(userId: string, buffer: Buffer, mimeType: string): Promise<MenuImportAnalyzeResult> {
    const extracted = await extractMenuFromImage(buffer, mimeType);
    const flatCount = extracted.reduce((n, c) => n + c.items.length, 0);
    if (flatCount === 0) {
      throw new ApiError(400, 'No products found in this image — try another photo');
    }
    const existing = await listAllProductsForUser(userId);
    return buildStockImportPreview(extracted, existing);
  },

  async parseSpreadsheetFile(
    userId: string,
    buffer: Buffer,
    filename: string,
  ): Promise<MenuImportAnalyzeResult> {
    const {parseStockSpreadsheetBuffer} = await import(
      '../../services/stockSpreadsheetImport.service'
    );
    const extracted = parseStockSpreadsheetBuffer(buffer, filename);
    const flatCount = extracted.reduce((n, c) => n + c.items.length, 0);
    if (flatCount === 0) {
      throw new ApiError(400, 'No products found in this file — check the template');
    }
    const existing = await listAllProductsForUser(userId);
    return buildStockImportPreview(extracted, existing);
  },

  async parsePasteText(userId: string, text: string): Promise<MenuImportAnalyzeResult> {
    const {parseStockPasteText} = await import('../../services/stockSpreadsheetImport.service');
    const extracted = parseStockPasteText(text);
    const flatCount = extracted.reduce((n, c) => n + c.items.length, 0);
    if (flatCount === 0) {
      throw new ApiError(400, 'No products found — paste one item per line');
    }
    const existing = await listAllProductsForUser(userId);
    return buildStockImportPreview(extracted, existing);
  },

  async matchItemNames(
    userId: string,
    items: Array<{tempId: string; name: string}>,
  ): Promise<
    Array<{
      tempId: string;
      duplicateStatus: MenuImportDuplicateStatus;
      matchedProductId: string | null;
      matchedProductName: string | null;
    }>
  > {
    const existing = await listAllProductsForUser(userId);
    return items.map(row => {
      const match = findBestExistingProductMatch(row.name, existing);
      if (match.matched && match.productId) {
        return {
          tempId: row.tempId,
          duplicateStatus: 'exists',
          matchedProductId: match.productId,
          matchedProductName: match.productName ?? null,
        };
      }
      return {
        tempId: row.tempId,
        duplicateStatus: 'new',
        matchedProductId: null,
        matchedProductName: null,
      };
    });
  },

  async commitImport(
    userId: string,
    products: Array<{
      categoryName: string;
      name: string;
      unit: string;
      unitPrice: number;
      quantityOnHand: number;
      lowStockThreshold?: number;
    }>,
  ) {
    const existing = await listAllProductsForUser(userId);
    const toCreate: typeof products = [];

    for (const row of products) {
      const match = findBestExistingProductMatch(row.name, existing);
      if (match.matched) {
        continue;
      }
      toCreate.push(row);
      existing.push({
        _id: `pending-${toCreate.length}`,
        name: row.name,
        nameNormalized: row.name.trim().toLowerCase(),
      });
    }

    if (toCreate.length === 0) {
      return {
        imported: 0,
        skipped: products.length,
        message: 'All items already exist. Nothing new to import.',
        products: [] as Array<Record<string, unknown>>,
      };
    }

    const created = [];
    let skipped = products.length - toCreate.length;

    for (const row of toCreate) {
      try {
        const product = await stockService.createProduct(userId, {
          categoryName: row.categoryName,
          name: row.name,
          unit: row.unit,
          unitPrice: row.unitPrice,
          quantityOnHand: row.quantityOnHand,
          lowStockThreshold: row.lowStockThreshold,
        });
        created.push(product);
        existing.push({
          _id: String(product._id),
          name: product.name,
          nameNormalized: product.nameNormalized,
        });
      } catch (error) {
        if (error instanceof ApiError && error.statusCode === 409) {
          skipped += 1;
          continue;
        }
        throw error;
      }
    }

    return {
      imported: created.length,
      skipped,
      message:
        created.length > 0
          ? `${created.length} new item${created.length === 1 ? '' : 's'} added to your inventory.`
          : 'All items already exist. Nothing new to import.',
      products: created.map(p => p.toObject()),
    };
  },
};
