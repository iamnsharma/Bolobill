import { Request, Response } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { ApiError } from '../../common/ApiError';
import { paymentService } from './payment.service';

const getUserId = (req: Request) => {
  if (!req.user?.userId) throw new ApiError(401, 'Unauthorized');
  return req.user.userId;
};

export const paymentController = {
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { planId } = req.body;
    if (!planId) {
      throw new ApiError(400, 'planId is required');
    }
    const result = await paymentService.createOrder(userId, planId);
    return res.json(result);
  }),

  verifyPayment: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { orderId, paymentId, signature, planId } = req.body;
    if (!orderId || !paymentId || !signature || !planId) {
      throw new ApiError(400, 'orderId, paymentId, signature, and planId are required');
    }
    const result = await paymentService.verifyPayment(userId, orderId, paymentId, signature, planId);
    return res.json(result);
  })
};
