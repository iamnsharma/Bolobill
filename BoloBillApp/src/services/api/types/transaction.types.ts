export type CreateTransactionPayload = {
  amount: number;
  toAddress: string;
  note?: string;
};

export type CreateTransactionResponse = {
  id: string;
  status: 'pending' | 'success' | 'failed';
};
