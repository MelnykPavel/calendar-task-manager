import { z } from 'zod';

const mongoEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DB: z.string().min(1).optional(),
});

export type MongoEnv = z.infer<typeof mongoEnvSchema>;

export function getMongoEnv(): MongoEnv {
  const parsed = mongoEnvSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
  });

  if (parsed.success) return parsed.data;

  const issues = parsed.error.issues
    .map((i) => `${i.path.join('.') || 'env'}: ${i.message}`)
    .join(', ');
  throw new Error(`Invalid MongoDB env (${issues}). Set MONGODB_URI (and optional MONGODB_DB).`);
}
