import {z} from 'zod';

export const lookupPhoneSchema = z.object({
  phone: z.string().min(1),
});

export const upsertContactSchema = z.object({
  phone: z.string().min(1),
  name: z.string().trim().min(1).max(120),
});

export const listContactsSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
