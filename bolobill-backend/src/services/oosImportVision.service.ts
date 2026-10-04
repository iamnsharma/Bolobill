import OpenAI from 'openai';
import {env} from '../config/env';
import {ApiError} from '../common/ApiError';
import {prepareImageForVision} from './menuImportVision.service';
import type {OosExtractedRow} from './oosSpreadsheetImport.service';

const openai = new OpenAI({apiKey: env.OPENAI_API_KEY, timeout: 120_000, maxRetries: 1});

const extractJsonObject = (raw: string) => {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? trimmed).trim();
};

export const extractOutOfStockFromImage = async (
  buffer: Buffer,
  mimeType: string,
): Promise<OosExtractedRow[]> => {
  if (process.env.MENU_IMPORT_MOCK === 'true') {
    return [
      {name: 'Rice 25kg', quantity: '2 bags', note: 'Urgent'},
      {name: 'Cooking oil 1L', quantity: '5', note: ''},
    ];
  }

  const prepared = await prepareImageForVision(buffer, mimeType);
  const dataUrl = `data:${prepared.mimeType};base64,${prepared.buffer.toString('base64')}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.MENU_IMPORT_VISION_MODEL?.trim() || 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 4096,
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content: `Extract a restock shopping list from this image. Return ONLY JSON:
{"items":[{"name":"...","quantity":"string or empty","note":"string or empty"}]}
No prices. quantity is free text (e.g. "2 bags", "10 pcs"). Include every line you can read.`,
        },
        {
          role: 'user',
          content: [
            {type: 'text', text: 'Extract items as JSON from this list photo.'},
            {type: 'image_url', image_url: {url: dataUrl, detail: 'high'}},
          ],
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(extractJsonObject(content)) as {
      items?: Array<{name?: string; quantity?: string; note?: string}>;
    };
    const items = (parsed.items ?? [])
      .map(row => ({
        name: String(row.name ?? '').trim(),
        quantity: String(row.quantity ?? '').trim(),
        note: String(row.note ?? '').trim(),
      }))
      .filter(row => row.name);
    if (!items.length) {
      throw new ApiError(400, 'No items found in this photo');
    }
    return items;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(503, "Couldn't read this photo — try a clearer picture");
  }
};
