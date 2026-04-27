import { z } from 'zod';

export const createCategoryBody = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const updateCategoryBody = createCategoryBody.partial();
