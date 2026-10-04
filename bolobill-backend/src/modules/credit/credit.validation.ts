import {z} from 'zod';

export const recordCreditPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero'),
  note: z.string().trim().max(500).optional(),
});

export const listCreditAccountsSchema = z.object({
  q: z.string().optional(),
  pendingOnly: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .optional()
    .transform((v) => v !== 'false' && v !== false),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
