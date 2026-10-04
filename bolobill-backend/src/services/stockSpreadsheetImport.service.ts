import * as XLSX from 'xlsx';
import {ApiError} from '../common/ApiError';
import type {ExtractedMenuCategory} from './menuImportVision.service';

const MAX_ROWS = 200;
const GENERAL = 'General';

const normalizeHeader = (h: string) =>
  h
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]/g, '');

const HEADER_ALIASES: Record<string, string> = {
  name: 'name',
  product: 'name',
  item: 'name',
  productname: 'name',
  itemname: 'name',
  category: 'category',
  cat: 'category',
  unit: 'unit',
  uom: 'unit',
  unitprice: 'unitPrice',
  price: 'unitPrice',
  mrp: 'unitPrice',
  rate: 'unitPrice',
  amount: 'unitPrice',
  quantity: 'quantityOnHand',
  quantityonhand: 'quantityOnHand',
  stock: 'quantityOnHand',
  qty: 'quantityOnHand',
  instock: 'quantityOnHand',
  lowstockthreshold: 'lowStockThreshold',
  alertat: 'lowStockThreshold',
};

const parseNumber = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value)
    .replace(/[₹$,\s]/g, '')
    .replace(/\/-?$/i, '')
    .trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
};

type RowRecord = Record<string, unknown>;

type ParsedStockRow = ExtractedMenuCategory['items'][0] & {categoryName: string};

const mapRow = (row: RowRecord, headerMap: Map<number, string>): ParsedStockRow | null => {
  const fields: Record<string, unknown> = {};
  for (const [colIndex, field] of headerMap.entries()) {
    fields[field] = row[String(colIndex)] ?? row[colIndex];
  }
  const name = String(fields.name ?? '').trim();
  if (!name) return null;
  const unitPrice = parseNumber(fields.unitPrice);
  const quantityOnHand = parseNumber(fields.quantityOnHand);
  const lowStockThreshold = parseNumber(fields.lowStockThreshold);
  const unitRaw = fields.unit;
  const unit =
    unitRaw != null && String(unitRaw).trim() ? String(unitRaw).trim().slice(0, 20) : null;
  const categoryName = String(fields.category ?? '').trim();
  return {
    name,
    unitPrice,
    unit,
    lowStockThreshold,
    quantityOnHand,
    categoryName,
  };
};

const rowsToCategories = (rows: ParsedStockRow[]): ExtractedMenuCategory[] => {
  const byCat = new Map<string, ExtractedMenuCategory['items']>();
  for (const row of rows) {
    const cat = row.categoryName?.trim() || GENERAL;
    const {categoryName: _, ...item} = row;
    const list = byCat.get(cat) ?? [];
    list.push(item);
    byCat.set(cat, list);
  }
  return Array.from(byCat.entries()).map(([name, items]) => ({name, items}));
};

const detectHeaderMap = (matrix: unknown[][]): {headerRow: number; map: Map<number, string>} | null => {
  for (let r = 0; r < Math.min(5, matrix.length); r++) {
    const row = matrix[r];
    if (!row) continue;
    const map = new Map<number, string>();
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell == null) continue;
      const key = normalizeHeader(String(cell));
      const field = HEADER_ALIASES[key];
      if (field) map.set(c, field);
    }
    if (map.has(0) || map.size >= 2) {
      const hasName = [...map.values()].includes('name');
      if (hasName || map.size >= 2) {
        if (!hasName) {
          map.set(0, 'name');
        }
        return {headerRow: r, map};
      }
    }
  }
  return null;
};

const matrixToCategories = (matrix: unknown[][]): ExtractedMenuCategory[] => {
  if (!matrix.length) return [];
  const detected = detectHeaderMap(matrix);
  const items: ParsedStockRow[] = [];

  if (detected) {
    const {headerRow, map} = detected;
    for (let r = headerRow + 1; r < matrix.length && items.length < MAX_ROWS; r++) {
      const rowArr = matrix[r];
      if (!rowArr) continue;
      const row: RowRecord = {};
      for (let c = 0; c < rowArr.length; c++) {
        row[String(c)] = rowArr[c];
      }
      const mapped = mapRow(row, map);
      if (mapped) items.push(mapped);
    }
  } else {
    for (let r = 0; r < matrix.length && items.length < MAX_ROWS; r++) {
      const rowArr = matrix[r];
      if (!rowArr?.length) continue;
      const name = String(rowArr[0] ?? '').trim();
      if (!name) continue;
      items.push({
        name,
        unitPrice: parseNumber(rowArr[1]),
        unit: rowArr[2] != null ? String(rowArr[2]).trim() : null,
        quantityOnHand: parseNumber(rowArr[3]),
        lowStockThreshold: null,
        categoryName: GENERAL,
      });
    }
  }

  return rowsToCategories(items);
};

export const parseStockSpreadsheetBuffer = (
  buffer: Buffer,
  filename: string,
): ExtractedMenuCategory[] => {
  const lower = filename.toLowerCase();
  let workbook: XLSX.WorkBook;
  try {
    if (lower.endsWith('.csv')) {
      const text = buffer.toString('utf8');
      workbook = XLSX.read(text, {type: 'string'});
    } else {
      workbook = XLSX.read(buffer, {type: 'buffer'});
    }
  } catch {
    throw new ApiError(400, 'Could not read this file — use CSV or Excel format');
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new ApiError(400, 'This file has no data sheet');
  }
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {header: 1, defval: ''}) as unknown[][];

  const categories = matrixToCategories(matrix);
  const count = categories.reduce((n, c) => n + c.items.length, 0);
  if (count > MAX_ROWS) {
    throw new ApiError(400, `Maximum ${MAX_ROWS} products per import`);
  }
  return categories;
};

export const parseStockPasteText = (text: string): ExtractedMenuCategory[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return [];

  const delimiter = lines[0].includes('\t')
    ? '\t'
    : lines[0].includes(',')
      ? ','
      : lines[0].includes('|')
        ? '|'
        : '\t';

  const matrix = lines.map(line => line.split(delimiter).map(c => c.trim()));
  return matrixToCategories(matrix);
};
