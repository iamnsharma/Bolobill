import {useMutation} from '@tanstack/react-query';
import {feedbackService} from '../../services/api/modules/feedback.service';

export const useCreateFeedback = () =>
  useMutation({
    mutationFn: feedbackService.create,
  });
