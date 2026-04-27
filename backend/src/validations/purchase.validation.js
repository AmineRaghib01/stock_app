import { z } from 'zod';

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  unitCost: z.coerce.number().nonnegative(),
});

export const createPurchaseBody = z.object({
  supplierId: z.string().uuid(),
  orderDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'RECEIVED', 'CANCELLED']).optional().default('PENDING'),
  notes: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export const updatePurchaseBody = z.object({
  supplierId: z.string().uuid().optional(),
  orderDate: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'RECEIVED', 'CANCELLED']).optional(),
  notes: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1).optional(),
});

export const listPurchasesQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['DRAFT', 'PENDING', 'RECEIVED', 'CANCELLED']).optional(),
  supplierId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
