import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3011),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 chars'),
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  BASE_URL: z.string().url().default('http://localhost:3011'),
  ALLOW_X_USER_ID_AUTH: z.coerce.boolean().default(true),
  FIREBASE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
});

export const env = envSchema.parse(process.env);
