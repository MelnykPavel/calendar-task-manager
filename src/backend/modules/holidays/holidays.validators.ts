import { z } from 'zod';

export const holidaysQuerySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Expected ISO country code (2 letters)')
    .transform((v) => v.toUpperCase()),
});
