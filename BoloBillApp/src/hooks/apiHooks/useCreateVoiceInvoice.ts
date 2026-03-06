import {useMutation} from '@tanstack/react-query';
import {invoiceService} from '../../services/api/modules/invoice.service';

export const useCreateVoiceInvoice = () =>
  useMutation({
    mutationFn: invoiceService.createFromVoice,
  });
