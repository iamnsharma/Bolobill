import {z} from 'zod';
import {normalizePhone} from '../../common/phone';

const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.union([z.string(), z.number()]).transform((v) => String(v)),
  totalPrice: z.number().min(0),
  productId: z.string().min(1).optional(),
  quantityNumeric: z.number().positive().optional(),
});

const paymentModeSchema = z.enum(['cash', 'credit']).optional().default('cash');

export const manualInvoiceSchema = z
  .object({
    customerName: z.string().trim().min(1, 'Customer name is required'),
    items: z.array(itemSchema).min(1),
    note: z.string().optional(),
    paymentMode: paymentModeSchema,
    customerPhone: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMode !== 'credit') return;
    const raw = data.customerPhone?.trim() ?? '';
    if (!raw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Customer phone is required for credit sales',
        path: ['customerPhone'],
      });
      return;
    }
    const normalized = normalizePhone(raw);
    const digits = normalized.length > 10 ? normalized.slice(-10) : normalized;
    if (digits.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid 10-digit phone number',
        path: ['customerPhone'],
      });
    }
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
