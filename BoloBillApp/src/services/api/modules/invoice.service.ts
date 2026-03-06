import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {
  CreateInvoiceFromVoicePayload,
  CreateInvoiceFromVoiceResponse,
} from '../types/invoice.types';

const mockResponse: CreateInvoiceFromVoiceResponse = {
  invoiceId: `KB-${Date.now()}-MOCK`,
  items: [
    {name: 'Rice', quantity: '3 kg', totalPrice: 150},
    {name: 'Oil', quantity: '2 bottles', totalPrice: 200},
  ],
  total: 350,
  voiceTranscript: 'teen kilo chawal pachaas, do oil do sau',
  pdfUrl: 'https://example.com/mock.pdf',
  isVerified: false,
  createdAt: new Date().toISOString(),
};

export const invoiceService = {
  createFromVoice: async (
    payload: CreateInvoiceFromVoicePayload,
  ): Promise<CreateInvoiceFromVoiceResponse> => {
    const formData = new FormData();
    formData.append('audio', {
      uri: payload.audioUri,
      type: 'audio/m4a',
      name: 'voice.m4a',
    } as never);
    formData.append('language', payload.language ?? 'hi');

    try {
      const response = await privateClient.post<{invoice: CreateInvoiceFromVoiceResponse}>(
        ENDPOINTS.INVOICE_CREATE,
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );
      return response.data.invoice;
    } catch (_error) {
      // Fallback while backend endpoint is being wired.
      return mockResponse;
    }
  },
};
