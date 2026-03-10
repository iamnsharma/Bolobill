import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {invoiceService} from '../../services/api/modules/invoice.service';
import {CreateInvoiceFromVoiceResponse} from '../../services/api/types/invoice.types';

export const useInvoiceById = (id?: string) =>
  useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id as string),
    enabled: Boolean(id),
  });

export const useCreateManualInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.createManual,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['invoices']});
    },
  });
};

export const useTranslateTextInvoice = () =>
  useMutation({
    mutationFn: invoiceService.translateText,
  });

export const useUpdateInvoiceById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<
        Pick<CreateInvoiceFromVoiceResponse, 'items' | 'voiceTranscript' | 'customerName'>
      >;
    }) =>
      invoiceService.updateById(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({queryKey: ['invoices']});
      queryClient.invalidateQueries({queryKey: ['invoice', variables.id]});
    },
  });
};

export const useDeleteInvoiceById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceService.deleteById,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['invoices']});
    },
  });
};
