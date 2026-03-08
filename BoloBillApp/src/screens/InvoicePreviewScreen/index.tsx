import React, {useMemo} from 'react';
import {Alert, Image, Linking, Pressable, ScrollView, Share, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseText} from '../../components/atoms';
import {useThemeStore} from '../../stores';
import {CreateInvoiceFromVoiceResponse} from '../../services/api/types/invoice.types';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import downloadIcon from '../../assets/icons/download.png';
import shareIcon from '../../assets/icons/share.png';

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
  const styles = useMemo(() => getStyles(theme), [theme]);
  const currentInvoice = route.params?.invoice;
  const items = currentInvoice?.items ?? [];
  const total = currentInvoice?.total ?? 0;

  const onDownloadInvoice = async () => {
    if (!currentInvoice) {
      return;
    }
    const pdfUrl = currentInvoice.pdfUrl;
    if (!pdfUrl) {
      Alert.alert('BoloBill', 'PDF not available yet. Save once and retry.');
      return;
    }
    const canOpen = await Linking.canOpenURL(pdfUrl);
    if (!canOpen) {
      Alert.alert('BoloBill', 'Could not open PDF URL.');
      return;
    }
    await Linking.openURL(pdfUrl);
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
                onPress={() => Share.share({message: currentInvoice.pdfUrl || currentInvoice.invoiceId})}
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
