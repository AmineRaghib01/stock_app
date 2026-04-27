import { z } from 'zod';

export const createStockMovementBody = z
  .object({
    productId: z.string().uuid(),
    type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: z.coerce.number().int(),
    reason: z.string().optional().nullable(),
    reference: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'ADJUSTMENT' && data.quantity <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La quantite doit etre positive', path: ['quantity'] });
    }
    if (data.type === 'ADJUSTMENT' && data.quantity === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "L'ajustement ne peut pas etre zero", path: ['quantity'] });
    }
  });

export const listStockMovementsQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  productId: z.string().uuid().optional(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
