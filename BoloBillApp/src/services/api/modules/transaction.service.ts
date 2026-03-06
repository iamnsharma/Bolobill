import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {
  CreateTransactionPayload,
  CreateTransactionResponse,
} from '../types/transaction.types';

export const transactionService = {
  create: async (
    payload: CreateTransactionPayload,
  ): Promise<CreateTransactionResponse> => {
    const response = await privateClient.post<CreateTransactionResponse>(
      ENDPOINTS.TRANSACTION_CREATE,
      payload,
    );
    return response.data;
  },
};
