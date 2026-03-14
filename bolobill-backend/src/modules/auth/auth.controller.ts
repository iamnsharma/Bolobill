import {Request, Response} from 'express';
import {ApiError} from '../../common/ApiError';
import {toAuthUserVm} from './auth.viewmodel';
import {authService} from './auth.service';
import {
  loginSchema,
  registerSchema,
  registerWithOtpSchema,
  requestOtpSchema,
  resetPinSchema,
  verifyOtpSchema,
} from './auth.validation';

export const authController = {
  async me(req: Request, res: Response) {
    if (!req.user?.userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    const user = await authService.getUserById(req.user.userId);
    return res.json({user: toAuthUserVm(user)});
  },

  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const result = await authService.register(parsed.data);
    return res.status(201).json({
      token: result.token,
      user: toAuthUserVm(result.user),
    });
  },

  async registerWithOtp(req: Request, res: Response) {
    const parsed = registerWithOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const result = await authService.registerWithOtp(parsed.data);
    return res.status(201).json({
      token: result.token,
      user: toAuthUserVm(result.user),
    });
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const result = await authService.login(parsed.data);
    return res.json({
      token: result.token,
      user: toAuthUserVm(result.user),
    });
  },

  async requestForgotOtp(req: Request, res: Response) {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const result = await authService.requestOtp(parsed.data.phone);
    return res.json(result);
  },

  async verifyOtp(req: Request, res: Response) {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const result = await authService.verifyOtp(parsed.data.phone, parsed.data.otp);
    return res.json({
      token: result.token,
      user: toAuthUserVm(result.user),
    });
  },

  async resetPin(req: Request, res: Response) {
    const parsed = resetPinSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const result = await authService.resetPin(parsed.data);
    return res.json(result);
  },
};
