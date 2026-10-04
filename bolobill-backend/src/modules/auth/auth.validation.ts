import {z} from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2),
    businessName: z.string().trim().optional(),
    phone: z.string().min(10),
    pin: z.string().min(4).max(8),
    accountType: z.enum(['personal', 'business']).optional(),
  })
  .superRefine((data, ctx) => {
    const accountType = data.accountType ?? 'personal';
    if (accountType === 'business' && !data.businessName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business / Branch Name is required for business signup',
        path: ['businessName'],
      });
    }
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

export const verifyPinSchema = z.object({
  pin: z.string().min(4).max(8),
});

export const financeReportsSchema = z
  .object({
    hidden: z.boolean(),
    inventoryPin: z.string().min(4).max(8).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hidden === false && !data.inventoryPin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Inventory PIN is required to show revenue reports',
        path: ['inventoryPin'],
      });
    }
  });

export const changePinSchema = z
  .object({
    currentPin: z.string().min(4).max(8),
    newPin: z.string().min(4).max(8),
  })
  .superRefine((data, ctx) => {
    if (data.currentPin === data.newPin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'New PIN must be different from your current PIN',
        path: ['newPin'],
      });
    }
  });

export const registerWithOtpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  name: z.string().min(2),
  businessName: z.string().trim().min(1, 'Business / Branch name is required'),
  pin: z.string().min(4).max(8),
  accountType: z.enum(['personal', 'business']).optional(),
});
