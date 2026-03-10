import React, {useMemo} from 'react';
import {Alert, Image, Pressable, ScrollView, Share, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseText} from '../../components/atoms';
import {useAuthStore, useThemeStore} from '../../stores';
import {CreateInvoiceFromVoiceResponse} from '../../services/api/types/invoice.types';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import downloadIcon from '../../assets/icons/download.png';
import shareIcon from '../../assets/icons/share.png';
import {createInvoicePdfForDownload, createInvoicePdfForShare} from '../../utils/invoice/pdf';

type Props = {
  route: {
    params?: {
      invoice?: CreateInvoiceFromVoiceResponse;
    };
  };
};

export const InvoicePreviewScreen = ({route}: Props) => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const user = useAuthStore(s => s.user);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const currentInvoice = route.params?.invoice;
  const items = currentInvoice?.items ?? [];
  const total = currentInvoice?.total ?? 0;

  const onDownloadInvoice = async () => {
    if (!currentInvoice) {
      return;
    }
    try {
      const downloadUri = await createInvoicePdfForDownload(currentInvoice, user);
      if (!downloadUri) {
        Alert.alert('BoloBill', 'Failed to create PDF.');
        return;
      }
      Alert.alert('BoloBill', 'PDF saved to your Downloads folder.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download PDF';
      Alert.alert('BoloBill', message);
    }
  };

  const onShareInvoice = async () => {
    if (!currentInvoice) {
      return;
    }
    try {
      const filePath = await createInvoicePdfForShare(currentInvoice, user);
      if (!filePath) {
        Alert.alert('BoloBill', 'Failed to create PDF.');
        return;
      }
      await Share.share({
        title: `Invoice ${currentInvoice.invoiceId}`,
        url: `file://${filePath}`,
        message: `Invoice ${currentInvoice.invoiceId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share PDF';
      Alert.alert('BoloBill', message);
    }
  };

  if (!currentInvoice) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.section}>
          <BaseText style={styles.sectionTitle}>Invoice not found</BaseText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextWrap}>
              <BaseText style={styles.title}>{t(T.INVOICE_PREVIEW_TITLE)}</BaseText>
              <BaseText style={styles.subTitle}>#{currentInvoice.invoiceId}</BaseText>
            </View>
            <View style={styles.inlineActions}>
              <Pressable onPress={onDownloadInvoice} style={styles.iconActionBtn}>
                <Image source={downloadIcon} style={styles.actionIcon} resizeMode="contain" />
              </Pressable>
              <Pressable
                onPress={onShareInvoice}
                style={styles.iconActionBtn}>
                <Image source={shareIcon} style={styles.actionIcon} resizeMode="contain" />
              </Pressable>
            </View>
          </View>
          <View
            style={[
              styles.badge,
              currentInvoice.source === 'voice'
                ? styles.badgeVerified
                : styles.badgePersonal,
            ]}>
            <BaseText style={styles.badgeText}>
              {currentInvoice.source === 'voice'
                ? t(T.INVOICE_PREVIEW_VERIFIED)
                : t(T.INVOICE_PREVIEW_PERSONAL)}
            </BaseText>
          </View>
        </View>

        <View style={styles.section}>
          <BaseText style={styles.sectionTitle}>{t(T.INVOICE_PREVIEW_TRANSCRIPT)}</BaseText>
          <BaseText style={styles.transcriptText}>
            {currentInvoice.voiceTranscript || t(T.INVOICE_PREVIEW_NO_TRANSCRIPT)}
          </BaseText>
        </View>

        <View style={styles.section}>
          <BaseText style={styles.sectionTitle}>{t(T.INVOICE_PREVIEW_EDIT_ITEMS)}</BaseText>
          {items.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.itemCard}>
              <BaseText style={styles.itemTitle}>{`${index + 1}. ${item.name}`}</BaseText>
              <View style={styles.itemMetaRow}>
                <BaseText style={styles.itemMeta}>{`${t(T.VOICE_QUANTITY)}: ${item.quantity}`}</BaseText>
                <BaseText style={styles.itemPrice}>{`Rs ${item.totalPrice}`}</BaseText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.totalCard}>
          <BaseText style={styles.totalLabel}>{t(T.INVOICE_PREVIEW_TOTAL)}</BaseText>
          <BaseText style={styles.totalValue}>Rs {total}</BaseText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
