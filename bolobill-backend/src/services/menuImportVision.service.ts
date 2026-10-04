import OpenAI from 'openai';
import sharp from 'sharp';
import {env} from '../config/env';
import {ApiError} from '../common/ApiError';

const VISION_MODEL = process.env.MENU_IMPORT_VISION_MODEL?.trim() || 'gpt-4o-mini';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 120_000,
  maxRetries: 1,
});

const extractJsonObject = (raw: string) => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? trimmed).trim();
};

const safeParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(extractJsonObject(raw));
  } catch {
    return null;
  }
};

export type ExtractedMenuCategory = {
  name: string;
  items: Array<{
    name: string;
    unitPrice: number | null;
    unit: string | null;
    lowStockThreshold: number | null;
  }>;
};

const UNIT_ALIASES: Record<string, string> = {
  pc: 'pcs',
  pcs: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
  pkt: 'pack',
  pack: 'pack',
  packs: 'pack',
  bottle: 'bottle',
  bottles: 'bottle',
  kg: 'kg',
  g: 'g',
  gm: 'g',
  gram: 'g',
  grams: 'g',
  l: 'l',
  liter: 'l',
  litre: 'l',
  ml: 'ml',
  box: 'box',
  dozen: 'dozen',
  strip: 'strip',
};

const normalizeUnit = (unit: string | null | undefined): string | null => {
  if (unit == null || !String(unit).trim()) return null;
  const key = String(unit).trim().toLowerCase();
  return UNIT_ALIASES[key] ?? key.slice(0, 20);
};

const coercePrice = (value: unknown): number | null => {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  const cleaned = String(value)
    .replace(/[₹$,\s]/g, '')
    .replace(/\/-?$/i, '')
    .trim();
  if (!cleaned) return null;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const readItemName = (row: Record<string, unknown>): string => {
  const candidates = [row.name, row.item, row.product, row.title, row.description];
  for (const c of candidates) {
    const s = String(c ?? '').trim();
    if (s) return s;
  }
  return '';
};

const readItemPrice = (row: Record<string, unknown>): number | null => {
  return coercePrice(
    row.unitPrice ?? row.price ?? row.mrp ?? row.rate ?? row.amount ?? row.cost,
  );
};

const readItemUnit = (row: Record<string, unknown>): string | null => {
  const u = row.unit ?? row.uom ?? row.type;
  if (u == null) return null;
  return normalizeUnit(String(u));
};

/** Normalize heterogeneous model JSON into categories + items. */
export const normalizeRawMenuJson = (parsed: unknown): ExtractedMenuCategory[] => {
  if (!parsed || typeof parsed !== 'object') {
    return [];
  }

  const root = parsed as Record<string, unknown>;
  const categories: ExtractedMenuCategory[] = [];

  const pushCategory = (name: string, rawItems: unknown[]) => {
    const catName = name.trim() || 'General';
    const items: ExtractedMenuCategory['items'] = [];
    for (const raw of rawItems) {
      if (!raw || typeof raw !== 'object') continue;
      const row = raw as Record<string, unknown>;
      const name = readItemName(row);
      if (!name) continue;
      items.push({
        name,
        unitPrice: readItemPrice(row),
        unit: readItemUnit(row),
        lowStockThreshold: coercePrice(row.lowStockThreshold),
      });
    }
    if (items.length > 0) {
      categories.push({name: catName, items});
    }
  };

  if (Array.isArray(root.categories)) {
    for (const rawCat of root.categories) {
      if (!rawCat || typeof rawCat !== 'object') continue;
      const cat = rawCat as Record<string, unknown>;
      const name = String(cat.name ?? cat.category ?? cat.title ?? 'General').trim();
      const items = Array.isArray(cat.items)
        ? cat.items
        : Array.isArray(cat.products)
          ? cat.products
          : [];
      pushCategory(name, items);
    }
  }

  if (categories.length === 0 && Array.isArray(root.items)) {
    pushCategory('General', root.items);
  }
  if (categories.length === 0 && Array.isArray(root.products)) {
    pushCategory('General', root.products);
  }

  return categories;
};

const MOCK_MENU: ExtractedMenuCategory[] = [
  {
    name: 'Beverages',
    items: [
      {name: 'Coca Cola 500ml', unitPrice: 40, unit: 'bottle', lowStockThreshold: null},
      {name: 'Pepsi 500ml', unitPrice: 38, unit: 'bottle', lowStockThreshold: null},
    ],
  },
  {
    name: 'Snacks',
    items: [
      {name: 'Lays Classic', unitPrice: 20, unit: 'pack', lowStockThreshold: null},
      {name: 'Kurkure', unitPrice: 20, unit: 'pack', lowStockThreshold: null},
    ],
  },
];

const devErrorHint = (message: string): string => {
  if (process.env.NODE_ENV === 'production') return '';
  const short = message.replace(/\s+/g, ' ').slice(0, 160);
  return short ? ` (${short})` : '';
};

const mapOpenAiError = (error: unknown): ApiError => {
  const err = error as {
    status?: number;
    message?: string;
    code?: string;
    error?: {message?: string; type?: string};
  };
  const detail = err?.error?.message ?? err?.message ?? String(error);
  console.error('[menu-import] OpenAI error:', err?.status, detail);

  if (err?.status === 401) {
    return new ApiError(
      503,
      `OpenAI API key is invalid. Check OPENAI_API_KEY in bolobill-backend/.env${devErrorHint(detail)}`,
    );
  }
  if (err?.status === 429) {
    return new ApiError(503, 'Too many requests. Wait a moment and try again.');
  }
  if (err?.status === 402 || err?.code === 'insufficient_quota') {
    return new ApiError(503, 'OpenAI billing quota exceeded. Add credits at platform.openai.com.');
  }
  if (detail.includes('image') || detail.includes('Image')) {
    return new ApiError(
      400,
      `This image format could not be processed. Try JPEG or PNG.${devErrorHint(detail)}`,
    );
  }
  return new ApiError(
    503,
    `Couldn't read this photo — try a clearer picture with prices visible${devErrorHint(detail)}`,
  );
};

/** Resize / convert to JPEG so phone photos (HEIC, huge PNG) work reliably with Vision. */
export const prepareImageForVision = async (
  buffer: Buffer,
  mimeType: string,
): Promise<{buffer: Buffer; mimeType: string}> => {
  try {
    const meta = await sharp(buffer, {failOn: 'none'}).metadata();
    let pipeline = sharp(buffer, {failOn: 'none'}).rotate();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w > 2048 || h > 2048) {
      pipeline = pipeline.resize(2048, 2048, {fit: 'inside', withoutEnlargement: true});
    }
    const out = await pipeline.jpeg({quality: 84, mozjpeg: true}).toBuffer();
    if (out.length > 0) {
      return {buffer: out, mimeType: 'image/jpeg'};
    }
  } catch (e) {
    console.error('[menu-import] Image preprocess failed:', (e as Error).message, 'mime=', mimeType);
  }

  const normalizedMime =
    mimeType === 'image/jpg' ? 'image/jpeg' : mimeType || 'image/jpeg';
  return {buffer, mimeType: normalizedMime};
};

export const extractMenuFromImage = async (
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractedMenuCategory[]> => {
  if (process.env.MENU_IMPORT_MOCK === 'true') {
    return MOCK_MENU;
  }

  if (!buffer?.length) {
    throw new ApiError(400, 'Image file is empty — try uploading again');
  }

  const prepared = await prepareImageForVision(buffer, mimeType);
  const visionBuffer = prepared.buffer;
  const normalizedMime = prepared.mimeType;

  const base64 = visionBuffer.toString('base64');
  const dataUrl = `data:${normalizedMime};base64,${base64}`;
  const imageDetail: 'low' | 'high' = visionBuffer.length > 2_000_000 ? 'low' : 'high';

  try {
    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      temperature: 0,
      max_tokens: 4096,
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content: `You extract product catalog data from photos of menus, price lists, or handwritten stock lists for Indian shops.
Return ONLY JSON in this shape:
{"categories":[{"name":"Category name","items":[{"name":"Product name","unitPrice":40,"unit":"pack","lowStockThreshold":null}]}]}

Rules:
- unitPrice MUST be a JSON number (not a string) when visible; use null if missing.
- Group items into categories. Use section headers from the image when present; otherwise infer (Beverages, Snacks, etc.).
- Do NOT include stock quantities.
- Include every product line you can read. Put size in the name (e.g. "Coca Cola 500ml").
- Ignore totals, footers, and phone numbers.`,
        },
        {
          role: 'user',
          content: [
            {type: 'text', text: 'Extract all products from this menu or price list image.'},
            {type: 'image_url', image_url: {url: dataUrl, detail: imageDetail}},
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const parsed = safeParseJson(content);
    const categories = normalizeRawMenuJson(parsed);

    if (!categories.length) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          '[menu-import] No categories after normalize. Raw content sample:',
          content.slice(0, 800),
        );
      }
      throw new ApiError(
        502,
        "Couldn't read products from this photo — try a flatter photo with text in focus",
      );
    }

    return categories;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw mapOpenAiError(error);
  }
};
