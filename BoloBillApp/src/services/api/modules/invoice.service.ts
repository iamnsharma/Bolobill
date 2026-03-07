import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {
  CreateInvoiceFromVoicePayload,
  CreateInvoiceFromVoiceResponse,
} from '../types/invoice.types';

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
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invoice creation failed');
    }
  },
};
