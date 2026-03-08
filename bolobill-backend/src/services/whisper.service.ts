import fs from 'fs';
import OpenAI from 'openai';
import {env} from '../config/env';
import type {InvoiceItemInput} from './transcriptParser.service';

const openai = new OpenAI({apiKey: env.OPENAI_API_KEY});

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

export const transcribeAudio = async (
  localFilePath: string,
  language?: string,
): Promise<string> => {
  const whisperLanguage =
    language && !['mixed', 'bgr', 'mwr'].includes(language) ? language : undefined;

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(localFilePath),
    model: 'whisper-1',
    language: whisperLanguage,
    response_format: 'text',
  });

  return String(transcription || '').trim();
};

const getTargetLanguageInstruction = (language?: string) => {
  switch (language) {
    case 'hi':
      return 'Hindi in Devanagari script';
    case 'pa':
      return 'Punjabi in Gurmukhi script';
    case 'mwr':
      return 'Marwadi in Devanagari script';
    case 'bgr':
      return 'Bagdi in Devanagari script';
    case 'en':
      return 'English in plain Latin script';
    case 'mixed':
      return 'Hindi in Devanagari script';
    default:
      return '';
  }
};

export const localizeItemNamesByLanguage = async (
  items: InvoiceItemInput[],
  language?: string,
): Promise<InvoiceItemInput[]> => {
  if (!items.length) {
    return items;
  }

  const targetLanguageInstruction = getTargetLanguageInstruction(language);
  if (!targetLanguageInstruction) {
    return items;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content:
            `Convert ONLY grocery item names to ${targetLanguageInstruction}. Return JSON only in this shape: {"items":[{"name":"..."}]}. Keep the same order. Use natural kirana/shop words. Do not include quantity, units, or prices in names.`,
        },
        {
          role: 'user',
          content: JSON.stringify({
            items: items.map(item => ({name: item.name})),
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const parsed = safeParseJson(content) as {items?: Array<{name?: string}>} | null;
    const translatedNames = parsed?.items ?? [];
    if (translatedNames.length !== items.length) {
      return items;
    }

    return items.map((item, index) => ({
      ...item,
      name: translatedNames[index]?.name?.trim() || item.name,
    }));
  } catch {
    return items;
  }
};

export const extractInvoiceItemsFromTranscript = async (
  transcript: string,
): Promise<InvoiceItemInput[] | null> => {
  const cleanedTranscript = transcript.trim();
  if (!cleanedTranscript) {
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      response_format: {type: 'json_object'},
      messages: [
        {
          role: 'system',
          content:
            'Extract bill items from spoken transcript. Return ONLY JSON: {"items":[{"name":"...", "quantity":"...", "totalPrice":123}]}. totalPrice must be a number. Ignore lines where price is missing or unclear.',
        },
        {role: 'user', content: cleanedTranscript},
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    const parsed = safeParseJson(content) as
      | {items?: Array<{name?: string; quantity?: string; totalPrice?: unknown}>}
      | null;

    const items = parsed?.items ?? [];
    const normalizedItems = items
      .map(item => {
        const name = String(item.name ?? '').trim();
        const quantity = String(item.quantity ?? '').trim() || '1';
        const totalPrice = Number(item.totalPrice);
        if (!name || Number.isNaN(totalPrice) || totalPrice <= 0) {
          return null;
        }
        return {name, quantity, totalPrice};
      })
      .filter((item): item is InvoiceItemInput => Boolean(item));

    return normalizedItems.length ? normalizedItems : null;
  } catch {
    return null;
  }
};
