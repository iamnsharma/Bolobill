import {Router} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {authMiddleware} from '../../middleware/auth.middleware';
import {authController} from './auth.controller';

export const authRouter = Router();

authRouter.get('/me', authMiddleware, asyncHandler(authController.me));
authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/register-with-otp', asyncHandler(authController.registerWithOtp));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/send-otp', asyncHandler(authController.requestForgotOtp));
authRouter.post('/verify-otp', asyncHandler(authController.verifyOtp));
authRouter.post('/forgot/request-otp', asyncHandler(authController.requestForgotOtp));
authRouter.post('/forgot/verify-otp', asyncHandler(authController.verifyOtp));
authRouter.post('/forgot/reset-pin', asyncHandler(authController.resetPin));
