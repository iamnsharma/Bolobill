import {z} from 'zod';

export const oosImportMatchSchema = z.object({
  items: z
    .array(z.object({tempId: z.string().min(1), name: z.string().min(1).max(200)}))
    .min(1)
    .max(300),
});

export const oosImportCommitSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        quantity: z.string().max(100).optional(),
        note: z.string().max(500).optional(),
      }),
    )
    .min(0)
    .max(200),
});
