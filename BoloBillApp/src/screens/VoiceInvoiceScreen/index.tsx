import React, { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { VoiceRecorder } from '../../components/organisms';
import { T } from '../../lang/constants';
import {
  useCreateManualInvoice,
  useCreateVoiceInvoice,
} from '../../hooks/apiHooks';
import { useAuthStore, useLanguageStore, useThemeStore } from '../../stores';
import { getStyles } from './style';
import {
  CreateInvoiceFromVoiceResponse,
  InvoiceItem,
} from '../../services/api/types/invoice.types';
import editIcon from '../../assets/icons/edit.png';
import deleteIcon from '../../assets/icons/delete.png';
import menuIcon from '../../assets/icons/menu.png';

type Props = {
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void;
  };
};

export const VoiceInvoiceScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const language = useLanguageStore(s => s.language);
  const isGuest = useAuthStore(s => s.isGuest);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const createInvoice = useCreateVoiceInvoice();
  const createManualInvoiceMutation = useCreateManualInvoice();
  const [audioUri, setAudioUri] = useState<string>();
  const [generatedVoiceInvoice, setGeneratedVoiceInvoice] =
    useState<CreateInvoiceFromVoiceResponse>();
  const [lastRecording, setLastRecording] = useState<{
    fileName: string;
    durationSec: number;
    recordedAt: string;
  }>();
  const [manualItemName, setManualItemName] = useState('');
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualItems, setManualItems] = useState<InvoiceItem[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const formatIstTime = (isoTime: string) =>
    new Date(isoTime).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  const onRecorded = (
    uri: string,
    meta: { fileName: string; durationSec: number; recordedAt: string },
  ) => {
    setAudioUri(uri);
    setLastRecording(meta);
    setGeneratedVoiceInvoice(undefined);
  };

  const onCreateInvoice = async () => {
    if (isGuest) {
      Alert.alert('BoloBill', 'Guest mode is explore-only. Please login to create invoices.');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('BoloBill', 'Please enter customer name first.');
      return;
    }
    if (!audioUri) {
      Alert.alert('BoloBill', t(T.VOICE_TAP_TO_RECORD));
      return;
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        audioUri,
        customerName: customerName.trim(),
        language: language === 'mwr' || language === 'bgr' ? 'mixed' : language,
        durationSec: lastRecording?.durationSec ?? 0,
      });
      setAudioUri(undefined);
      setLastRecording(undefined);
      setGeneratedVoiceInvoice(undefined);
      setManualItemName('');
      setManualQuantity('');
      setManualPrice('');
      setManualItems([]);
      setShowManualForm(false);
      setCustomerName('');
      navigation.navigate('InvoicePreview', {invoice, editable: true});
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const apiMessage = axiosError.response?.data?.message;
      const fallbackMessage =
        error instanceof Error ? error.message : t(T.VOICE_PROCESSING);
      Alert.alert('Error', apiMessage || fallbackMessage);
    }
  };

  const addManualItem = () => {
    if (
      !manualItemName.trim() ||
      !manualQuantity.trim() ||
      !manualPrice.trim()
    ) {
      Alert.alert('BoloBill', t(T.VOICE_FILL_MANUAL_FIELDS));
      return;
    }

    const parsedPrice = Number(manualPrice);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('BoloBill', t(T.VOICE_INVALID_PRICE));
      return;
    }

    setManualItems(current => [
      ...current,
      {
        name: manualItemName.trim(),
        quantity: manualQuantity.trim(),
        totalPrice: parsedPrice,
      },
    ]);
    setManualItemName('');
    setManualQuantity('');
    setManualPrice('');
  };

  const removeManualItem = (index: number) => {
    setManualItems(current =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const createManualInvoice = async () => {
    if (isGuest) {
      Alert.alert('BoloBill', 'Guest mode is explore-only. Please login to create invoices.');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('BoloBill', 'Please enter customer name first.');
      return;
    }
    if (manualItems.length === 0) {
      Alert.alert('BoloBill', t(T.VOICE_ADD_ONE_ITEM));
      return;
    }

    try {
      const invoice = await createManualInvoiceMutation.mutateAsync({
        customerName: customerName.trim(),
        items: manualItems,
      });
      Alert.alert('BoloBill', t(T.VOICE_MANUAL_SAVED));
      setAudioUri(undefined);
      setLastRecording(undefined);
      setGeneratedVoiceInvoice(undefined);
      setManualItemName('');
      setManualQuantity('');
      setManualPrice('');
      setManualItems([]);
      setShowManualForm(false);
      setCustomerName('');
      navigation.navigate('InvoicePreview', {invoice, editable: true});
    } catch (error) {
      const axiosError = error as AxiosError<{message?: string}>;
      Alert.alert(
        'Error',
        axiosError.response?.data?.message ?? 'Could not save manual invoice',
      );
    }
  };

  const closeManualForm = () => {
    setManualItemName('');
    setManualQuantity('');
    setManualPrice('');
    setManualItems([]);
    setShowManualForm(false);
  };

  const openInvoiceItemDetail = () => {
    if (isGuest) {
      Alert.alert('BoloBill', 'Guest mode is explore-only. Please login to continue.');
      return;
    }
    if (!audioUri) {
      Alert.alert('BoloBill', t(T.VOICE_TAP_TO_RECORD));
      return;
    }

    if (!generatedVoiceInvoice) {
      onCreateInvoice();
      return;
    }

    navigation.navigate('InvoicePreview', {invoice: generatedVoiceInvoice, editable: true});
  };

  const deleteSavedRecording = () => {
    if (!lastRecording) {
      return;
    }

    Alert.alert(
      t(T.VOICE_DELETE_CONFIRM_TITLE),
      t(T.VOICE_DELETE_CONFIRM_DESC),
      [
        { text: t(T.COMMON_CANCEL), style: 'cancel' },
        {
          text: t(T.COMMON_DELETE),
          style: 'destructive',
          onPress: () => {
            setAudioUri(undefined);
            setLastRecording(undefined);
            setGeneratedVoiceInvoice(undefined);
          },
        },
      ],
    );
  };

  const isAnyMutationPending =
    createInvoice.isPending ||
    createManualInvoiceMutation.isPending;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <BaseText style={styles.title}>{t(T.VOICE_TITLE)}</BaseText>
          <BaseText style={styles.heroSubtitle}>
            {t(T.VOICE_DESCRIPTION)}
          </BaseText>
        </View>

        <View style={styles.card}>
          <BaseInput
            label="Customer Name"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Enter customer name"
          />
          <VoiceRecorder onRecorded={onRecorded} />

          {lastRecording ? (
            <View style={styles.savedCard}>
              <View style={styles.savedHeader}>
                <BaseText style={styles.savedTitle}>
                  {t(T.VOICE_LAST_SAVED_RECORDING)}
                </BaseText>
                <View style={styles.savedHeaderActions}>
                  <Pressable
                    onPress={openInvoiceItemDetail}
                    style={styles.savedDeleteBtn}
                  >
                    <Image source={editIcon} style={styles.savedDeleteIcon} />
                  </Pressable>
                  <Pressable
                    onPress={deleteSavedRecording}
                    style={styles.savedDeleteBtn}
                  >
                    <Image source={deleteIcon} style={styles.savedDeleteIcon} />
                  </Pressable>
                </View>
              </View>
              <BaseText>
                {t(T.VOICE_SAVED_FILE, { fileName: lastRecording.fileName })}
              </BaseText>
              <BaseText>
                {t(T.VOICE_DURATION, { seconds: lastRecording.durationSec })}
              </BaseText>
              <BaseText>
                {t(T.VOICE_AT_TIME, {
                  time: formatIstTime(lastRecording.recordedAt),
                })}
              </BaseText>
            </View>
          ) : null}

          {isAnyMutationPending ? (
            <View style={styles.processing}>
              <ActivityIndicator color={theme.colors.primary} />
              <BaseText>{t(T.VOICE_PROCESSING)}</BaseText>
            </View>
          ) : null}

          <BaseButton
            title={t(T.VOICE_CREATE)}
            onPress={onCreateInvoice}
            disabled={!audioUri || isAnyMutationPending}
          />
        </View>

        <View style={styles.card}>
          {!showManualForm ? (
            <>
              <BaseText style={styles.sectionTitle}>
                {t(T.VOICE_NEED_MANUAL_BILLING)}
              </BaseText>
              <BaseText style={styles.manualHint}>
                {t(T.VOICE_MANUAL_BILLING_DESC)}
              </BaseText>
              <BaseButton
                title={t(T.VOICE_CREATE_MANUALLY)}
                onPress={() => setShowManualForm(true)}
                disabled={isAnyMutationPending}
              />
            </>
          ) : (
            <>
              <View style={styles.manualTitleRow}>
                <BaseText style={styles.sectionTitle}>
                  {t(T.VOICE_MANUAL_FORM_TITLE)}
                </BaseText>
                <Pressable onPress={closeManualForm} style={styles.savedDeleteBtn}>
                  <Image source={menuIcon} style={styles.closeIcon} />
                </Pressable>
              </View>
              <BaseInput
                label={t(T.VOICE_ITEM_NAME)}
                value={manualItemName}
                onChangeText={setManualItemName}
                placeholder={t(T.VOICE_PLACEHOLDER_ITEM)}
              />
              <View style={styles.manualInputRow}>
                <BaseInput
                  containerStyle={styles.manualField}
                  label={t(T.VOICE_QUANTITY)}
                  value={manualQuantity}
                  onChangeText={setManualQuantity}
                  placeholder={t(T.VOICE_PLACEHOLDER_QTY)}
                />
                <BaseInput
                  containerStyle={styles.manualField}
                  label={t(T.VOICE_PRICE_INR)}
                  value={manualPrice}
                  onChangeText={setManualPrice}
                  keyboardType="number-pad"
                  placeholder={t(T.VOICE_PLACEHOLDER_PRICE)}
                />
                <Pressable
                  onPress={addManualItem}
                  style={styles.addItemInlineBtn}
                  disabled={isAnyMutationPending}>
                  <BaseText style={styles.addPlusText}>+</BaseText>
                </Pressable>
              </View>

              {manualItems.length ? (
                <ScrollView
                  style={styles.manualItemsWrap}
                  contentContainerStyle={styles.manualItemsContent}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled">
                  {manualItems.map((item, index) => (
                    <View
                      key={`${item.name}-${index}`}
                      style={styles.manualItemRow}
                    >
                      <View style={styles.manualItemInfo}>
                        <BaseText style={styles.manualItemText}>
                          {index + 1}. {item.name} ({item.quantity})
                        </BaseText>
                        <BaseText style={styles.manualItemText}>
                          Rs {item.totalPrice}
                        </BaseText>
                      </View>
                      <Pressable
                        onPress={() => removeManualItem(index)}
                        style={styles.deleteItemBtn}
                      >
                        <Image
                          source={deleteIcon}
                          style={styles.manualDeleteIcon}
                        />
                        <BaseText style={styles.deleteItemText}>
                          {t(T.COMMON_DELETE)}
                        </BaseText>
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}

              <BaseButton
                title={t(T.VOICE_CREATE_SAVE_MANUAL)}
                onPress={createManualInvoice}
                disabled={!manualItems.length || isAnyMutationPending}
              />
            </>
          )}
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
