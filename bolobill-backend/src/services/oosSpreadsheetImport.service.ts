import * as XLSX from 'xlsx';
import {ApiError} from '../common/ApiError';

const MAX_ROWS = 200;

export type OosExtractedRow = {
  name: string;
  quantity: string;
  note: string;
};

const normalizeHeader = (h: string) =>
  h.trim().toLowerCase().replace(/\s+/g, '').replace(/[_-]/g, '');

const HEADER_ALIASES: Record<string, 'name' | 'quantity' | 'note'> = {
  name: 'name',
  product: 'name',
  item: 'name',
  quantity: 'quantity',
  qty: 'quantity',
  amount: 'quantity',
  note: 'note',
  notes: 'note',
  remark: 'note',
};

const matrixToRows = (matrix: unknown[][]): OosExtractedRow[] => {
  const rows: OosExtractedRow[] = [];
  let headerMap: Map<number, 'name' | 'quantity' | 'note'> | null = null;
  let startRow = 0;

  for (let r = 0; r < Math.min(5, matrix.length); r++) {
    const row = matrix[r];
    if (!row) continue;
    const map = new Map<number, 'name' | 'quantity' | 'note'>();
    for (let c = 0; c < row.length; c++) {
      const field = HEADER_ALIASES[normalizeHeader(String(row[c] ?? ''))];
      if (field) map.set(c, field);
    }
    if (map.size >= 1 && (map.size >= 2 || [...map.values()].includes('name'))) {
      if (![...map.values()].includes('name')) map.set(0, 'name');
      headerMap = map;
      startRow = r + 1;
      break;
    }
  }

  if (headerMap) {
    for (let r = startRow; r < matrix.length && rows.length < MAX_ROWS; r++) {
      const rowArr = matrix[r];
      if (!rowArr) continue;
      const fields: Partial<Record<'name' | 'quantity' | 'note', string>> = {};
      for (const [col, field] of headerMap.entries()) {
        fields[field] = String(rowArr[col] ?? '').trim();
      }
      const name = fields.name?.trim() ?? '';
      if (!name) continue;
      rows.push({
        name,
        quantity: fields.quantity?.trim() ?? '',
        note: fields.note?.trim() ?? '',
      });
    }
  } else {
    for (let r = 0; r < matrix.length && rows.length < MAX_ROWS; r++) {
      const rowArr = matrix[r];
      const name = String(rowArr?.[0] ?? '').trim();
      if (!name) continue;
      rows.push({
        name,
        quantity: String(rowArr?.[1] ?? '').trim(),
        note: String(rowArr?.[2] ?? '').trim(),
      });
    }
  }

  return rows;
};

export const parseOosSpreadsheetBuffer = (buffer: Buffer, filename: string): OosExtractedRow[] => {
  const lower = filename.toLowerCase();
  let workbook: XLSX.WorkBook;
  try {
    if (lower.endsWith('.csv')) {
      workbook = XLSX.read(buffer.toString('utf8'), {type: 'string'});
    } else {
      workbook = XLSX.read(buffer, {type: 'buffer'});
    }
  } catch {
    throw new ApiError(400, 'Could not read this file — use CSV or Excel format');
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new ApiError(400, 'This file has no data sheet');
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {header: 1, defval: ''}) as unknown[][];
  const rows = matrixToRows(matrix);
  if (rows.length > MAX_ROWS) {
    throw new ApiError(400, `Maximum ${MAX_ROWS} items per import`);
  }
  return rows;
};

export const parseOosPasteText = (text: string): OosExtractedRow[] => {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const delimiter = lines[0].includes('\t')
    ? '\t'
    : lines[0].includes(',')
      ? ','
      : '\t';
  const matrix = lines.map(line => line.split(delimiter).map(c => c.trim()));
  return matrixToRows(matrix);
};
