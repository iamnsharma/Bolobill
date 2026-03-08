import {z} from 'zod';

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().min(1),
  totalPrice: z.number().min(0),
});

export const manualInvoiceSchema = z.object({
  items: z.array(itemSchema).min(1),
  note: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  items: z.array(itemSchema).min(1).optional(),
  voiceTranscript: z.string().optional(),
});

export const translateTextSchema = z.object({
  transcript: z.string().min(1),
  language: z.enum(['en', 'hi', 'pa', 'mwr', 'bgr', 'mixed']).optional(),
});
