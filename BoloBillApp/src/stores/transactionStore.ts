import {create} from 'zustand';

type TransactionState = {
  lastTransactionId?: string;
  setLastTransactionId: (id: string) => void;
};

export const useTransactionStore = create<TransactionState>(set => ({
  lastTransactionId: undefined,
  setLastTransactionId: id => set({lastTransactionId: id}),
}));
