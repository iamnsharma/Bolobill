import {z} from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  pin: z.string().min(4).max(8),
  accountType: z.enum(['personal', 'business']).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(10),
  pin: z.string().min(4).max(8),
});

export const requestOtpSchema = z.object({
  phone: z.string().min(10),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

export const resetPinSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  newPin: z.string().min(4).max(8),
});
