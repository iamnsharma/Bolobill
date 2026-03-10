export type CreateInvoiceFromVoicePayload = {
  audioUri: string;
  customerName: string;
  language?: 'hi' | 'pa' | 'en' | 'mwr' | 'bgr' | 'mixed';
  durationSec?: number;
};

export type InvoiceItem = {
  name: string;
  quantity: string;
  totalPrice: number;
};

export type CreateInvoiceFromVoiceResponse = {
  id?: string;
  invoiceId: string;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  voiceTranscript: string;
  pdfUrl: string;
  source?: 'voice' | 'manual';
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type CreateManualInvoicePayload = {
  customerName: string;
  items: InvoiceItem[];
  note?: string;
};

export type InvoiceListResponse = {
  invoices: CreateInvoiceFromVoiceResponse[];
};

export type LatestPdfsResponse = {
  invoices: Array<{
    id: string;
    invoiceId: string;
    pdfUrl: string;
    createdAt: string;
  }>;
};
