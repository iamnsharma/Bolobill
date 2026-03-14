import React, {useMemo} from 'react';
import {ActivityIndicator, Alert, Image, Linking, Platform, Pressable, ScrollView, Share, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseButton, BaseText} from '../../components/atoms';
import {useAuthStore, useThemeStore} from '../../stores';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import downloadIcon from '../../assets/icons/download.png';
import previewIcon from '../../assets/icons/preview.png';
import shareIcon from '../../assets/icons/share.png';
import {useInvoices} from '../../hooks/apiHooks';
import {createInvoicePdfForDownload, createInvoicePdfForShare} from '../../utils/invoice/pdf';
import {buildInvoiceFileName} from '../../utils/invoice/fileName';
import {mockInvoices} from '../../utils/mockInvoices';
import {CreateInvoiceFromVoiceResponse} from '../../services/api/types/invoice.types';

type Props = {
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void;
  };
};

export const HomeScreen = ({navigation}: Props) => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const user = useAuthStore(s => s.user);
  const isGuest = useAuthStore(s => s.isGuest);
  const invoicesQuery = useInvoices(!isGuest);
  const guestInvoices = useMemo<CreateInvoiceFromVoiceResponse[]>(
    () =>
      mockInvoices.slice(0, 5).map((item, index) => ({
        id: item.id,
        invoiceId: item.id,
        customerName: item.customerName,
        items: [{name: 'Sample Item', quantity: '1', totalPrice: item.amount}],
        total: item.amount,
        voiceTranscript: '',
        pdfUrl: '',
        source: 'manual',
        createdAt: new Date(Date.now() - index * 3600000).toISOString(),
      })),
    [],
  );
  const recentInvoices = useMemo(
    () => (isGuest ? guestInvoices : (invoicesQuery.data?.invoices ?? []).slice(0, 5)),
    [guestInvoices, invoicesQuery.data?.invoices, isGuest],
  );
  const thisMonthCount = useMemo(() => {
    if (isGuest) {
      return guestInvoices.length;
    }
    const now = new Date();
    return (invoicesQuery.data?.invoices ?? []).filter(invoice => {
      const created = new Date(invoice.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
  }, [guestInvoices.length, invoicesQuery.data?.invoices, isGuest]);

  const showGuestAlert = () => {
    Alert.alert('BoloBill', 'Guest mode is explore-only. Please login to use invoice actions.');
  };

  const onDownloadInvoice = async (invoice: (typeof recentInvoices)[number]) => {
    if (isGuest) {
      showGuestAlert();
      return;
    }
    try {
      const downloadUri = await createInvoicePdfForDownload(invoice, user);
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

  const onShareInvoice = async (invoice: (typeof recentInvoices)[number]) => {
    if (isGuest) {
      showGuestAlert();
      return;
    }
    try {
      const filePath = await createInvoicePdfForShare(invoice, user);
      if (!filePath) {
        Alert.alert('BoloBill', 'Failed to create PDF.');
        return;
      }
      await Share.share({
        title: `Invoice ${invoice.invoiceId}`,
        url: `file://${filePath}`,
        message: `Invoice ${invoice.invoiceId}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to share PDF';
      Alert.alert('BoloBill', message);
    }
  };

  const onShareOnWhatsApp = (invoice: (typeof recentInvoices)[number]) => {
    if (isGuest) {
      showGuestAlert();
      return;
    }
    const doShare = async (phoneDigits?: string) => {
      try {
        const filePath = await createInvoicePdfForShare(invoice, user);
        if (!filePath) {
          Alert.alert('BoloBill', 'Failed to create PDF.');
          return;
        }
        if (phoneDigits && phoneDigits.length >= 10) {
          Linking.openURL(`whatsapp://send?phone=${phoneDigits}`).catch(() => {});
          setTimeout(() => {
            Share.share({
              title: 'Share bill on WhatsApp',
              url: `file://${filePath}`,
              message: `Bill from BoloBill – Invoice ${invoice.invoiceId}. Total: Rs ${invoice.total}.`,
            }).catch(() => {});
          }, 600);
        } else {
          await Share.share({
            title: 'Share bill on WhatsApp',
            url: `file://${filePath}`,
            message: `Bill from BoloBill – Invoice ${invoice.invoiceId}. Total: Rs ${invoice.total}.`,
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to share PDF';
        Alert.alert('BoloBill', message);
      }
    };

    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Share to WhatsApp',
        'Enter phone number with country code (e.g. 919876543210). We\'ll open the chat, then you can send the bill.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Share',
            onPress: (value: string | undefined) => {
              const digits = (value ?? '').replace(/\D/g, '');
              if (digits.length > 0 && digits.length < 10) {
                Alert.alert('BoloBill', 'Please enter a valid number with country code (e.g. 919876543210).');
                return;
              }
              doShare(digits.length >= 10 ? digits : undefined);
            },
          },
        ],
        'plain-text',
        '',
        'number-pad',
      );
    } else {
      doShare();
    }
  };

  const onPreviewInvoice = (invoice: (typeof recentInvoices)[number]) => {
    if (isGuest) {
      showGuestAlert();
      return;
    }
    if (!invoice) {
      return;
    }
    navigation.navigate('InvoicePreview', {invoice});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <BaseText style={styles.title}>{t(T.HOME_TITLE)}</BaseText>
          <BaseText style={styles.heroSubtitle}>{t(T.HOME_DESCRIPTION)}</BaseText>
          <View style={styles.heroTagsRow}>
            <View style={styles.heroTag}>
              <BaseText style={styles.heroTagText}>
                {t(T.HOME_TAG_FAST_BILLING)}
              </BaseText>
            </View>
            <View style={styles.heroTag}>
              <BaseText style={styles.heroTagText}>
                {t(T.HOME_TAG_VOICE_TO_PDF)}
              </BaseText>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BaseText style={styles.statLabel}>
              {t(T.HOME_STAT_INVOICES_THIS_MONTH)}
            </BaseText>
            <BaseText style={styles.statValue}>{thisMonthCount}</BaseText>
          </View>
          <View style={styles.statCard}>
            <BaseText style={styles.statLabel}>{t(T.HOME_STAT_ACCOUNT)}</BaseText>
            <BaseText style={styles.statValue}>{t(T.AUTH_BUSINESS)}</BaseText>
          </View>
        </View>

        <BaseButton
          title={t(T.HOME_CREATE_INVOICE)}
          onPress={() => (isGuest ? showGuestAlert() : navigation.navigate('Voice'))}
        />
        <View style={styles.recentHeaderRow}>
          <BaseText style={styles.sectionTitle}>{t(T.HOME_RECENT_INVOICES)}</BaseText>
          <Pressable onPress={() => (isGuest ? showGuestAlert() : navigation.navigate('InvoiceHistory'))}>
            <BaseText style={styles.viewAllText}>{t(T.COMMON_VIEW_ALL)}</BaseText>
          </Pressable>
        </View>

        {invoicesQuery.isLoading && !isGuest ? (
          <View style={styles.statCard}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {recentInvoices.map(invoice => (
          <View key={invoice.id ?? invoice.invoiceId} style={styles.invoiceCard}>
            <View style={styles.invoiceLeft}>
              <BaseText style={styles.invoiceName}>{buildInvoiceFileName(invoice)}</BaseText>
              <BaseText style={styles.invoiceMeta}>
                {invoice.customerName} | Rs {invoice.total}
              </BaseText>
            </View>
            <View style={styles.invoiceActions}>
              <Pressable
                onPress={() => onDownloadInvoice(invoice)}
                style={styles.iconBtn}
              >
                <Image
                  source={downloadIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() => onPreviewInvoice(invoice)}
                style={styles.iconBtn}
              >
                <Image
                  source={previewIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() => onShareInvoice(invoice)}
                style={styles.iconBtn}
              >
                <Image
                  source={shareIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() => onShareOnWhatsApp(invoice)}
                style={styles.iconBtn}
                accessibilityLabel="Share on WhatsApp"
              >
                <BaseText style={styles.whatsappBtn}>WA</BaseText>
              </Pressable>
            </View>
          </View>
        ))}

        {!invoicesQuery.isLoading && recentInvoices.length === 0 ? (
          <View style={styles.emptyCard}>
            <BaseText style={styles.emptyTitle}>
              {t(T.INVOICE_HISTORY_EMPTY_TITLE)}
            </BaseText>
            <BaseText style={styles.emptySubtitle}>
              {t(T.INVOICE_HISTORY_EMPTY_DESC)}
            </BaseText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};
