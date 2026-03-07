import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { VoiceRecorder } from '../../components/organisms';
import { T } from '../../lang/constants';
import { useCreateVoiceInvoice } from '../../hooks/apiHooks';
import { useLanguageStore, useThemeStore } from '../../stores';
import { getStyles } from './style';
import {
  CreateInvoiceFromVoiceResponse,
  InvoiceItem,
} from '../../services/api/types/invoice.types';
import {parseSpokenInvoiceText} from '../../utils/invoice/spokenInvoice';
import editIcon from '../../assets/icons/edit.png';
import deleteIcon from '../../assets/icons/delete.png';

type Props = {
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void;
  };
};

export const VoiceInvoiceScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const language = useLanguageStore(s => s.language);
  const apiLanguage = language === 'mwr' || language === 'bgr' ? 'mixed' : language;
  const styles = useMemo(() => getStyles(theme), [theme]);
  const createInvoice = useCreateVoiceInvoice();
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
  const [spokenText, setSpokenText] = useState('');

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
    if (!audioUri) {
      Alert.alert('BoloBill', t(T.VOICE_TAP_TO_RECORD));
      return;
    }

    try {
      const invoice = await createInvoice.mutateAsync({
        audioUri,
        language: apiLanguage,
      });
      setGeneratedVoiceInvoice(invoice);
      navigation.navigate('InvoicePreview', { invoice });
    } catch (_error) {
      Alert.alert('Error', t(T.VOICE_PROCESSING));
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

  const createManualInvoice = () => {
    if (manualItems.length === 0) {
      Alert.alert('BoloBill', t(T.VOICE_ADD_ONE_ITEM));
      return;
    }

    const total = manualItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const invoice: CreateInvoiceFromVoiceResponse = {
      invoiceId: `MANUAL-${Date.now()}`,
      items: manualItems,
      total,
      voiceTranscript: '',
      pdfUrl: '',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    Alert.alert('BoloBill', t(T.VOICE_MANUAL_SAVED));
    navigation.navigate('InvoicePreview', { invoice });
  };

  const createFromSpokenText = () => {
    if (!spokenText.trim()) {
      Alert.alert(
        'BoloBill',
        'Type spoken lines first, e.g. "1kilo chawal 45 rs".',
      );
      return;
    }

    const invoice = parseSpokenInvoiceText(spokenText);
    if (!invoice) {
      Alert.alert(
        'BoloBill',
        'Could not parse items. Use one item per line like "10kg chaipati 800 rs".',
      );
      return;
    }

    navigation.navigate('InvoicePreview', {invoice});
  };

  const resetManualInvoiceForm = () => {
    if (
      !manualItemName.trim() &&
      !manualQuantity.trim() &&
      !manualPrice.trim() &&
      manualItems.length === 0
    ) {
      return;
    }

    Alert.alert(t(T.VOICE_RESET_CONFIRM_TITLE), t(T.VOICE_RESET_CONFIRM_DESC), [
      { text: t(T.COMMON_CANCEL), style: 'cancel' },
      {
        text: t(T.COMMON_RESET),
        style: 'destructive',
        onPress: () => {
          setManualItemName('');
          setManualQuantity('');
          setManualPrice('');
          setManualItems([]);
        },
      },
    ]);
  };

  const openInvoiceItemDetail = () => {
    if (!audioUri) {
      Alert.alert('BoloBill', t(T.VOICE_TAP_TO_RECORD));
      return;
    }

    if (!generatedVoiceInvoice) {
      onCreateInvoice();
      return;
    }

    navigation.navigate('InvoicePreview', { invoice: generatedVoiceInvoice });
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <BaseText style={styles.title}>{t(T.VOICE_TITLE)}</BaseText>
          <BaseText style={styles.heroSubtitle}>
            {t(T.VOICE_DESCRIPTION)}
          </BaseText>
        </View>

        <View style={styles.card}>
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

          {createInvoice.isPending ? (
            <View style={styles.processing}>
              <ActivityIndicator color={theme.colors.primary} />
              <BaseText>{t(T.VOICE_PROCESSING)}</BaseText>
            </View>
          ) : null}

          <BaseButton
            title={t(T.VOICE_CREATE)}
            onPress={onCreateInvoice}
            disabled={!audioUri || createInvoice.isPending}
          />
        </View>

        <View style={styles.card}>
          <BaseText style={styles.sectionTitle}>Spoken Text to Bill</BaseText>
          <BaseText style={styles.manualHint}>
            Write exactly what you speak, one item per line.
          </BaseText>
          <BaseInput
            value={spokenText}
            onChangeText={setSpokenText}
            placeholder={'1kilo chawal 45 rs\n10kg chaipati 800rs'}
            multiline
            textAlignVertical="top"
            inputStyle={styles.spokenTextInput}
          />
          <BaseButton title="Create Invoice From Spoken Text" onPress={createFromSpokenText} />

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
              />
            </>
          ) : (
            <>
              <BaseText style={styles.sectionTitle}>
                {t(T.VOICE_MANUAL_FORM_TITLE)}
              </BaseText>
              <BaseInput
                label={t(T.VOICE_ITEM_NAME)}
                value={manualItemName}
                onChangeText={setManualItemName}
                placeholder={t(T.VOICE_PLACEHOLDER_ITEM)}
              />
              <BaseInput
                label={t(T.VOICE_QUANTITY)}
                value={manualQuantity}
                onChangeText={setManualQuantity}
                placeholder={t(T.VOICE_PLACEHOLDER_QTY)}
              />
              <BaseInput
                label={t(T.VOICE_PRICE_INR)}
                value={manualPrice}
                onChangeText={setManualPrice}
                keyboardType="number-pad"
                placeholder={t(T.VOICE_PLACEHOLDER_PRICE)}
              />
              <BaseButton title={t(T.VOICE_ADD_ITEM)} onPress={addManualItem} />

              {manualItems.length ? (
                <View style={styles.manualItemsWrap}>
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
                </View>
              ) : null}

              <BaseButton
                title={t(T.VOICE_CREATE_SAVE_MANUAL)}
                onPress={createManualInvoice}
                disabled={!manualItems.length}
              />
              <BaseButton
                title={t(T.VOICE_RESET_MANUAL_FORM)}
                onPress={resetManualInvoiceForm}
              />
              <BaseButton
                title={t(T.VOICE_CLOSE_MANUAL_FORM)}
                onPress={() => setShowManualForm(false)}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
