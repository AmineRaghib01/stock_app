import { z } from 'zod';

export const createProductBody = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(0).optional().default(0),
  costPrice: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
  minStockLevel: z.coerce.number().int().min(0).optional().default(0),
  unit: z.string().min(1).optional().default('pcs'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
  categoryId: z.string().uuid(),
  supplierId: z.string().uuid().optional().nullable(),
});

export const updateProductBody = createProductBody.partial();

export const listProductsQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  lowStock: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .optional()
    .transform((v) => v === true || v === 'true'),
  sortBy: z.enum(['name', 'sku', 'quantity', 'createdAt', 'sellingPrice']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
