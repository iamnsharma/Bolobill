import {useQuery} from '@tanstack/react-query';
import {invoiceService} from '../../services/api/modules/invoice.service';

export const useInvoices = (enabled = true) =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getAll,
    enabled,
  });
