import {z} from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(80).optional(),
  sortOrder: z.number().int().optional(),
});

export const createProductSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    categoryName: z.string().min(1).max(80).optional(),
    name: z.string().min(1).max(120),
    unit: z.string().min(1).max(20).default('pcs'),
    unitPrice: z.number().min(0),
    quantityOnHand: z.number().min(0).default(0),
    lowStockThreshold: z.number().min(0).optional(),
  })
  .refine(data => Boolean(data.categoryId?.trim() || data.categoryName?.trim()), {
    message: 'Category is required (categoryId or categoryName)',
  });

export const updateProductSchema = z.object({
  categoryId: z.string().min(1).optional(),
  categoryName: z.string().min(1).max(80).optional(),
  name: z.string().min(1).max(120).optional(),
  unit: z.string().min(1).max(20).optional(),
  unitPrice: z.number().min(0).optional(),
  quantityOnHand: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).nullable().optional(),
});

export const adjustProductSchema = z.object({
  productId: z.string().min(1),
  delta: z.number().refine(n => n !== 0, 'delta must be non-zero'),
  note: z.string().max(500).optional(),
});

export const bulkCreateProductsSchema = z.object({
  products: z.array(createProductSchema).min(1).max(50),
});
