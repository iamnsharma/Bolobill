import {useMutation, useQueryClient} from '@tanstack/react-query';
import {invoiceService} from '../../services/api/modules/invoice.service';

export const useCreateVoiceInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.createFromVoice,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['invoices']});
    },
  });
};
