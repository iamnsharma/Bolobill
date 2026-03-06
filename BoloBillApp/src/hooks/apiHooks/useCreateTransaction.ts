import {useMutation, useQueryClient} from '@tanstack/react-query';
import {transactionService} from '../../services/api/modules/transaction.service';
import {useTransactionStore} from '../../stores';

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const setLastTransactionId = useTransactionStore(s => s.setLastTransactionId);

  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: data => {
      setLastTransactionId(data.id);
      queryClient.invalidateQueries({queryKey: ['walletBalance']});
      queryClient.invalidateQueries({queryKey: ['transactionHistory']});
    },
  });
};
