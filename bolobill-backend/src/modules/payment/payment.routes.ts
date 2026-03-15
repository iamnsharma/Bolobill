import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../common/asyncHandler';
import { paymentController } from './payment.controller';

export const paymentRouter = Router();

// Only authenticated users can trigger payments
paymentRouter.use(authMiddleware);

paymentRouter.post('/create-order', asyncHandler(paymentController.createOrder));
paymentRouter.post('/verify', asyncHandler(paymentController.verifyPayment));
