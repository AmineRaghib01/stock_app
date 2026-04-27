import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().nonnegative(),
});

export const createSaleBody = z.object({
  customerName: z.string().optional().nullable(),
  saleDate: z.string().datetime().optional(),
  notes: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export const listSalesQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  search: z.string().optional(),
});
