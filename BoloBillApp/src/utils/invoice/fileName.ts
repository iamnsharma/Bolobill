import {CreateInvoiceFromVoiceResponse} from '../../services/api/types/invoice.types';

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_]/g, '')
    .slice(0, 32);

export const buildInvoiceFileBaseName = (invoice: CreateInvoiceFromVoiceResponse) => {
  const invoiceSegment = sanitizeSegment(invoice.invoiceId || 'invoice');
  const customerSegment = sanitizeSegment(invoice.customerName || 'customer');
  const timestamp = new Date(invoice.createdAt || Date.now()).getTime();
  return `invoice_${invoiceSegment}_${customerSegment}_${timestamp}`;
};

export const buildInvoiceFileName = (invoice: CreateInvoiceFromVoiceResponse) =>
  `${buildInvoiceFileBaseName(invoice)}.pdf`;
