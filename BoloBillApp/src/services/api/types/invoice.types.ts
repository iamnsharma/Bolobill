export type CreateInvoiceFromVoicePayload = {
  audioUri: string;
  language?: 'hi' | 'pa' | 'en' | 'bgr' | 'mixed';
};

export type InvoiceItem = {
  name: string;
  quantity: string;
  totalPrice: number;
};

export type CreateInvoiceFromVoiceResponse = {
  invoiceId: string;
  items: InvoiceItem[];
  total: number;
  voiceTranscript: string;
  pdfUrl: string;
  isVerified: boolean;
  createdAt: string;
};
