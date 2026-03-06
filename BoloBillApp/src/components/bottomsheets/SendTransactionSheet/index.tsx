import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {TextInput, View} from 'react-native';
import {useThemeStore} from '../../../stores';
import {BaseButton, BaseText} from '../../atoms';
import {t} from '../../../lang';
import {T} from '../../../lang/constants';
import {getStyles} from './style';
import {useSendTransactionBottomSheet} from '../../../hooks/featureHooks/useSendTransactionBottomSheet';
import {CommonBottomSheetHeader} from '../CommonBottomSheetHeader';
import {CommonBackdrop} from '../CommonBackdrop';

export type SendTransactionSheetRef = {
  open: () => void;
  close: () => void;
};

export const SendTransactionSheet = forwardRef<SendTransactionSheetRef>(
  (_props, ref) => {
    const theme = useThemeStore(s => s.theme);
    const styles = useMemo(() => getStyles(theme), [theme]);
    const sheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['60%'], []);
    const {
      step,
      amount,
      toAddress,
      amountError,
      addressError,
      canProceed,
      isSubmitting,
      setAmount,
      setToAddress,
      goToConfirm,
      goBack,
      submit,
      reset,
    } = useSendTransactionBottomSheet();

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.snapToIndex(0),
      close: () => {
        sheetRef.current?.close();
        reset();
      },
    }));

    const handleClose = useCallback(() => {
      sheetRef.current?.close();
      reset();
    }, [reset]);

    return (
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={CommonBackdrop}
        onClose={reset}>
        <BottomSheetView style={styles.container}>
          <CommonBottomSheetHeader
            title={
              step === 'form' ? t(T.TX_SEND_TITLE) : t(T.TX_CONFIRM_TITLE)
            }
            onClose={handleClose}
          />

          {step === 'form' ? (
            <>
              <BaseText>{t(T.TX_FORM_AMOUNT)}</BaseText>
              <TextInput
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
              />
              {amountError ? <BaseText style={styles.error}>{amountError}</BaseText> : null}

              <BaseText>{t(T.TX_FORM_ADDRESS)}</BaseText>
              <TextInput
                value={toAddress}
                onChangeText={setToAddress}
                style={styles.input}
                autoCapitalize="none"
              />
              {addressError ? (
                <BaseText style={styles.error}>{addressError}</BaseText>
              ) : null}

              <BaseButton
                title={t(T.COMMON_NEXT)}
                onPress={goToConfirm}
                disabled={!canProceed}
              />
            </>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.row}>
                  <BaseText>{t(T.TX_FORM_AMOUNT)}</BaseText>
                  <BaseText>{amount}</BaseText>
                </View>
                <View style={styles.row}>
                  <BaseText>{t(T.TX_FORM_ADDRESS)}</BaseText>
                  <BaseText>{toAddress}</BaseText>
                </View>
              </View>

              <BaseButton
                title={t(T.TX_SUBMIT)}
                onPress={submit}
                loading={isSubmitting}
              />
              <BaseButton
                title={t(T.COMMON_BACK)}
                onPress={goBack}
                style={styles.secondaryBtn}
              />
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);
