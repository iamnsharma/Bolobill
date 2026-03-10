import {FeedbackModel} from '../../models/Feedback.model';

export const feedbackService = {
  async create(input: {userId: string; message: string}) {
    const feedback = await FeedbackModel.create({
      userId: input.userId,
      message: input.message.trim(),
    });
    return feedback;
  },
};
