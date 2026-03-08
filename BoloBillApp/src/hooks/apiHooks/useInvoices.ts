import {useQuery} from '@tanstack/react-query';
import {invoiceService} from '../../services/api/modules/invoice.service';

export const useInvoices = () =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: invoiceService.getAll,
  });
