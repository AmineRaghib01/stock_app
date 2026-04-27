import { z } from 'zod';

export const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileBody = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional().nullable(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password != null && data.password !== '' && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le mot de passe doit contenir au moins 8 caracteres',
        path: ['password'],
      });
    }
  });
