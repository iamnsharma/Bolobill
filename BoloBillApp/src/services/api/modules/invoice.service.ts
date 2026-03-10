import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {
  CreateManualInvoicePayload,
  CreateInvoiceFromVoicePayload,
  CreateInvoiceFromVoiceResponse,
  InvoiceListResponse,
  LatestPdfsResponse,
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
    formData.append('customerName', payload.customerName);
    if (payload.durationSec && payload.durationSec > 0) {
      formData.append('durationSec', String(payload.durationSec));
    }

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

  createManual: async (
    payload: CreateManualInvoicePayload,
  ): Promise<CreateInvoiceFromVoiceResponse> => {
    const response = await privateClient.post<{invoice: CreateInvoiceFromVoiceResponse}>(
      ENDPOINTS.INVOICE_MANUAL_CREATE,
      payload,
    );
    return response.data.invoice;
  },

  translateText: async (
    input: {transcript: string; language?: CreateInvoiceFromVoicePayload['language']},
  ): Promise<CreateInvoiceFromVoiceResponse> => {
    const response = await privateClient.post<{invoice: CreateInvoiceFromVoiceResponse}>(
      ENDPOINTS.INVOICE_TRANSLATE_TEXT,
      input,
    );
    return response.data.invoice;
  },

  getAll: async (): Promise<InvoiceListResponse> => {
    const response = await privateClient.get<InvoiceListResponse>(ENDPOINTS.INVOICE_LIST);
    return response.data;
  },

  getLatestPdfs: async (): Promise<LatestPdfsResponse> => {
    const response = await privateClient.get<LatestPdfsResponse>(
      ENDPOINTS.INVOICE_LATEST_PDFS,
    );
    return response.data;
  },

  getById: async (id: string): Promise<CreateInvoiceFromVoiceResponse> => {
    const response = await privateClient.get<{invoice: CreateInvoiceFromVoiceResponse}>(
      `${ENDPOINTS.INVOICE_LIST}/${id}`,
    );
    return response.data.invoice;
  },

  updateById: async (
    id: string,
    payload: Partial<
      Pick<CreateInvoiceFromVoiceResponse, 'items' | 'voiceTranscript' | 'customerName'>
    >,
  ): Promise<CreateInvoiceFromVoiceResponse> => {
    const response = await privateClient.put<{invoice: CreateInvoiceFromVoiceResponse}>(
      `${ENDPOINTS.INVOICE_LIST}/${id}`,
      payload,
    );
    return response.data.invoice;
  },

  deleteById: async (id: string): Promise<{message: string}> => {
    const response = await privateClient.delete<{message: string}>(
      `${ENDPOINTS.INVOICE_LIST}/${id}`,
    );
    return response.data;
  },
};
