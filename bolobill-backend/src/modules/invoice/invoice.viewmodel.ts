import path from 'path';
import {env} from '../../config/env';

const toPdfUrl = (pdfPath: string) => {
  if (!pdfPath) {
    return '';
  }
  const fileName = path.basename(pdfPath);
  return `${env.BASE_URL}/api/files/pdfs/${fileName}`;
};

type InvoiceVmInput = {
  _id: {toString(): string};
  invoiceId: string;
  items: unknown[];
  total: number;
  voiceTranscript: string;
  pdfPath: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
};

export const toInvoiceVm = (invoice: InvoiceVmInput) => ({
  id: invoice._id.toString(),
  invoiceId: invoice.invoiceId,
  items: invoice.items,
  total: invoice.total,
  voiceTranscript: invoice.voiceTranscript,
  pdfUrl: toPdfUrl(invoice.pdfPath),
  source: invoice.source,
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
});
