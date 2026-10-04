import {v4 as uuidv4} from 'uuid';
import {ApiError} from '../../common/ApiError';
import {OutOfStockModel} from '../../models/OutOfStock.model';
import {extractOutOfStockFromImage} from '../../services/oosImportVision.service';
import {
  parseOosPasteText,
  parseOosSpreadsheetBuffer,
  type OosExtractedRow,
} from '../../services/oosSpreadsheetImport.service';
import {
  ExistingProductRef,
  findBestExistingProductMatch,
} from '../../utils/productNameMatch';
import {outOfStockService} from '../out-of-stock/outOfStock.service';

export type OosImportDuplicateStatus = 'new' | 'exists';

export type OosImportPreviewItem = {
  tempId: string;
  name: string;
  quantity: string;
  note: string;
  duplicateStatus: OosImportDuplicateStatus;
  matchedItemId: string | null;
  matchedItemName: string | null;
};

export type OosImportPreviewResult = {
  summary: {found: number; newCount: number; existsCount: number};
  items: OosImportPreviewItem[];
};

const listExisting = async (userId: string): Promise<ExistingProductRef[]> => {
  const items = await OutOfStockModel.find({userId}).select('_id name').lean();
  return items.map(i => ({
    _id: String(i._id),
    name: String(i.name),
    nameNormalized: i.name.trim().toLowerCase(),
  }));
};

const buildPreview = (rows: OosExtractedRow[], existing: ExistingProductRef[]): OosImportPreviewResult => {
  const items: OosImportPreviewItem[] = rows.map(row => {
    const match = findBestExistingProductMatch(row.name, existing);
    if (match.matched && match.productId) {
      return {
        tempId: uuidv4(),
        name: row.name,
        quantity: row.quantity,
        note: row.note,
        duplicateStatus: 'exists',
        matchedItemId: match.productId,
        matchedItemName: match.productName ?? null,
      };
    }
    return {
      tempId: uuidv4(),
      name: row.name,
      quantity: row.quantity,
      note: row.note,
      duplicateStatus: 'new',
      matchedItemId: null,
      matchedItemName: null,
    };
  });
  const existsCount = items.filter(i => i.duplicateStatus === 'exists').length;
  return {
    summary: {found: items.length, newCount: items.length - existsCount, existsCount},
    items,
  };
};

export const outOfStockImportService = {
  async analyzeImage(userId: string, buffer: Buffer, mime: string) {
    const rows = await extractOutOfStockFromImage(buffer, mime);
    const existing = await listExisting(userId);
    return buildPreview(rows, existing);
  },

  async parseFile(userId: string, buffer: Buffer, filename: string) {
    const rows = parseOosSpreadsheetBuffer(buffer, filename);
    if (!rows.length) throw new ApiError(400, 'No items found in file');
    const existing = await listExisting(userId);
    return buildPreview(rows, existing);
  },

  async parsePaste(userId: string, text: string) {
    const rows = parseOosPasteText(text);
    if (!rows.length) throw new ApiError(400, 'No items found — paste one item per line');
    const existing = await listExisting(userId);
    return buildPreview(rows, existing);
  },

  async matchNames(userId: string, items: Array<{tempId: string; name: string}>) {
    const existing = await listExisting(userId);
    return items.map(row => {
      const match = findBestExistingProductMatch(row.name, existing);
      if (match.matched && match.productId) {
        return {
          tempId: row.tempId,
          duplicateStatus: 'exists' as const,
          matchedItemId: match.productId,
          matchedItemName: match.productName ?? null,
        };
      }
      return {
        tempId: row.tempId,
        duplicateStatus: 'new' as const,
        matchedItemId: null,
        matchedItemName: null,
      };
    });
  },

  async commit(
    userId: string,
    rows: Array<{name: string; quantity?: string; note?: string}>,
  ) {
    const existing = await listExisting(userId);
    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      const name = row.name.trim();
      if (!name) continue;
      const match = findBestExistingProductMatch(name, existing);
      if (match.matched) {
        skipped += 1;
        continue;
      }
      await outOfStockService.create(userId, {
        name,
        quantity: row.quantity?.trim() || undefined,
        note: row.note?.trim() || undefined,
      });
      existing.push({_id: `new-${imported}`, name, nameNormalized: name.toLowerCase()});
      imported += 1;
    }

    return {
      imported,
      skipped,
      message:
        imported > 0
          ? `${imported} item${imported === 1 ? '' : 's'} added to your restock list.`
          : 'All items already on your list. Nothing new to import.',
    };
  },
};
