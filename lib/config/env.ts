import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url(),
  ACCESS_TOKEN_SECRET: z.string().min(16),
  REFRESH_TOKEN_SECRET: z.string().min(16),
  ACCESS_TOKEN_EXPIRES: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES: z.string().default("7d"),
  PRIMARY_DB_URI: z.string().min(1),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
});

export const env = envSchema.parse(process.env);
export type AppEnv = z.infer<typeof envSchema>;
