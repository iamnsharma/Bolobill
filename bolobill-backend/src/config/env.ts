import dotenv from 'dotenv';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3011),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 chars'),
  OPENAI_API_KEY: z
    .string()
    .min(1, 'OPENAI_API_KEY is required')
    .transform(s => s.trim()),
  BASE_URL: z.string().url().default('http://localhost:3011'),
  /** Base URL for customer-facing bill pages (admin app), e.g. http://localhost:3000 */
  PUBLIC_BILL_BASE_URL: z.string().url().optional(),
  ALLOW_X_USER_ID_AUTH: z.coerce.boolean().default(true),
  /** When set, menu/OOS photo analyze requires X-BoloBill-Ai-Demo-Pin header (demo/pitch). */
  AI_VISION_DEMO_PIN: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV !== 'production') return;
  const base = data.BASE_URL.toLowerCase();
  if (base.includes('bolobill.useaifast.com')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'BASE_URL must be the API host (e.g. https://bolobill.onrender.com), not the admin site bolobill.useaifast.com',
      path: ['BASE_URL'],
    });
  }
});

export const env = envSchema.parse(process.env);

/** Invoice/voice caps via plans. Off by default — shops billed by you outside the app. */
export function subscriptionLimitsEnabled(): boolean {
  const v = process.env.ENABLE_SUBSCRIPTION_LIMITS;
  return v === 'true' || v === '1';
}
