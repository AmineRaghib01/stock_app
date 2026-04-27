import { z } from 'zod';

export const reportQuery = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const activityListQuery = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
  action: z.string().optional(),
  userId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
