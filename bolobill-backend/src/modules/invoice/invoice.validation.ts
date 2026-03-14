import {z} from 'zod';

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.union([z.string(), z.number()]).transform((v) => String(v)),
  totalPrice: z.number().min(0),
});

export const manualInvoiceSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  items: z.array(itemSchema).min(1),
  note: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  customerName: z.string().trim().min(1).optional(),
  items: z.array(itemSchema).min(1).optional(),
  voiceTranscript: z.string().optional(),
});

export const translateTextSchema = z.object({
  transcript: z.string().min(1),
  language: z.enum(['en', 'hi', 'pa', 'mwr', 'bgr', 'mixed']).optional(),
});

export const createFromVoicePreviewSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  transcript: z.string().optional(),
  durationSec: z.number().min(0).optional(),
});
