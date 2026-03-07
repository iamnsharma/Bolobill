import React, {useMemo, useState} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseButton, BaseInput, BaseText} from '../../components/atoms';
import {useAuthStore, useThemeStore} from '../../stores';
import {CreateInvoiceFromVoiceResponse, InvoiceItem} from '../../services/api/types/invoice.types';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import {generateInvoicePdf} from '../../utils/invoice/pdf';

type Props = {
  navigation: {
    goBack: () => void;
  };
  route: {
    params?: {
      invoice?: CreateInvoiceFromVoiceResponse;
    };
  };
};

const fallbackInvoice: CreateInvoiceFromVoiceResponse = {
  invoiceId: `KB-${Date.now()}-LOCAL`,
  items: [
    {name: 'Sugar', quantity: '2 kg', totalPrice: 90},
    {name: 'Tea', quantity: '1 packet', totalPrice: 140},
  ],
  total: 230,
  voiceTranscript: 'do kilo chini aur ek chai packet',
  pdfUrl: '',
  isVerified: false,
  createdAt: new Date().toISOString(),
};

export const InvoicePreviewScreen = ({navigation, route}: Props) => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const user = useAuthStore(s => s.user);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const sourceInvoice = route.params?.invoice ?? fallbackInvoice;
  const [items, setItems] = useState<InvoiceItem[]>(sourceInvoice.items);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number.isNaN(item.totalPrice) ? 0 : item.totalPrice), 0),
    [items],
  );

  const updateItem = (
    index: number,
    key: keyof InvoiceItem,
    value: string,
  ) => {
    setItems(current =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        if (key === 'totalPrice') {
          const parsed = Number(value);
          return {...item, totalPrice: Number.isNaN(parsed) ? 0 : parsed};
        }

        return {...item, [key]: value};
      }),
    );
  };

  const onDownloadInvoice = async () => {
    try {
      setIsGeneratingPdf(true);
      const invoiceToExport: CreateInvoiceFromVoiceResponse = {
        ...sourceInvoice,
        items,
        total,
      };
      const pdfPath = await generateInvoicePdf(invoiceToExport, user);
      Alert.alert('BoloBill', `PDF created successfully.\n${pdfPath ?? ''}`);
    } catch (_error) {
      Alert.alert('BoloBill', 'Could not create PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <BaseText style={styles.title}>{t(T.INVOICE_PREVIEW_TITLE)}</BaseText>
          <BaseText style={styles.subTitle}>#{sourceInvoice.invoiceId}</BaseText>
          <View
            style={[
              styles.badge,
              sourceInvoice.isVerified ? styles.badgeVerified : styles.badgePersonal,
            ]}>
            <BaseText style={styles.badgeText}>
              {sourceInvoice.isVerified
                ? t(T.INVOICE_PREVIEW_VERIFIED)
                : t(T.INVOICE_PREVIEW_PERSONAL)}
            </BaseText>
          </View>
        </View>

        <View style={styles.section}>
          <BaseText style={styles.sectionTitle}>{t(T.INVOICE_PREVIEW_TRANSCRIPT)}</BaseText>
          <BaseText style={styles.transcriptText}>
            {sourceInvoice.voiceTranscript || t(T.INVOICE_PREVIEW_NO_TRANSCRIPT)}
          </BaseText>
        </View>

        <View style={styles.section}>
          <BaseText style={styles.sectionTitle}>{t(T.INVOICE_PREVIEW_EDIT_ITEMS)}</BaseText>
          {items.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.itemCard}>
              <BaseInput
                label={t(T.VOICE_ITEM_NAME)}
                value={item.name}
                onChangeText={value => updateItem(index, 'name', value)}
              />
              <BaseInput
                label={t(T.VOICE_QUANTITY)}
                value={item.quantity}
                onChangeText={value => updateItem(index, 'quantity', value)}
              />
              <BaseInput
                label={t(T.VOICE_PRICE_INR)}
                keyboardType="number-pad"
                value={String(item.totalPrice)}
                onChangeText={value => updateItem(index, 'totalPrice', value)}
              />
            </View>
          ))}
        </View>

        <View style={styles.totalCard}>
          <BaseText style={styles.totalLabel}>{t(T.INVOICE_PREVIEW_TOTAL)}</BaseText>
          <BaseText style={styles.totalValue}>Rs {total}</BaseText>
        </View>

        <BaseButton
          title={t(T.INVOICE_PREVIEW_CONFIRM)}
          onPress={() => Alert.alert('BoloBill', t(T.INVOICE_PREVIEW_CONFIRM_INFO))}
        />
        <BaseButton
          title={t(T.INVOICE_PREVIEW_DOWNLOAD)}
          onPress={onDownloadInvoice}
          disabled={isGeneratingPdf}
        />
        <BaseButton
          title={t(T.INVOICE_PREVIEW_SHARE)}
          disabled={!sourceInvoice.isVerified}
          onPress={() => Alert.alert('BoloBill', t(T.INVOICE_PREVIEW_SHARE_INFO))}
        />
        <BaseButton title={t(T.INVOICE_PREVIEW_BACK)} onPress={navigation.goBack} />
      </ScrollView>
    </SafeAreaView>
  );
};
