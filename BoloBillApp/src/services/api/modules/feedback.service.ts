import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {CreateFeedbackPayload, CreateFeedbackResponse} from '../types/feedback.types';

export const feedbackService = {
  create: async (payload: CreateFeedbackPayload): Promise<CreateFeedbackResponse> => {
    const response = await privateClient.post<CreateFeedbackResponse>(
      ENDPOINTS.FEEDBACK_CREATE,
      payload,
    );
    return response.data;
  },
};
