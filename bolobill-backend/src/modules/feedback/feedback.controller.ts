import {Request, Response} from 'express';
import {ApiError} from '../../common/ApiError';
import {createFeedbackSchema} from './feedback.validation';
import {feedbackService} from './feedback.service';

export const feedbackController = {
  async create(req: Request, res: Response) {
    if (!req.user?.userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const parsed = createFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    await feedbackService.create({
      userId: req.user.userId,
      message: parsed.data.message,
    });

    return res.status(201).json({message: 'Feedback submitted'});
  },
};
