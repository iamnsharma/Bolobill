import {Router} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {authMiddleware} from '../../middleware/auth.middleware';
import {feedbackController} from './feedback.controller';

export const feedbackRouter = Router();

feedbackRouter.use(authMiddleware);
feedbackRouter.post('/', asyncHandler(feedbackController.create));
