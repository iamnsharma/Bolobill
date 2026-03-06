import {useMemo, useState} from 'react';
import {t} from '../../lang';
import {T} from '../../lang/constants';
import {useCreateTransaction} from '../apiHooks/useCreateTransaction';

type Step = 'form' | 'confirm';

export const useSendTransactionBottomSheet = () => {
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const createTx = useCreateTransaction();

  const amountNumber = useMemo(() => Number(amount), [amount]);
  const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0;
  const isAddressValid = toAddress.trim().length >= 6;

  const canProceed = isAmountValid && isAddressValid;

  const amountError =
    amount.length > 0 && !isAmountValid ? t(T.TX_INVALID_AMOUNT) : '';
  const addressError =
    toAddress.length > 0 && !isAddressValid ? t(T.TX_INVALID_ADDRESS) : '';

  const goToConfirm = () => {
    if (!canProceed) {
      return;
    }
    setStep('confirm');
  };

  const goBack = () => setStep('form');

  const submit = async () => {
    await createTx.mutateAsync({
      amount: amountNumber,
      toAddress: toAddress.trim(),
    });
  };

  const reset = () => {
    setStep('form');
    setAmount('');
    setToAddress('');
  };

  return {
    step,
    amount,
    toAddress,
    amountError,
    addressError,
    canProceed,
    isSubmitting: createTx.isPending,
    setAmount,
    setToAddress,
    goToConfirm,
    goBack,
    submit,
    reset,
  };
};
