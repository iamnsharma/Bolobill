import React, {useMemo} from 'react';
import {ActivityIndicator, Alert, Image, Pressable, ScrollView, Share, View} from 'react-native';
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
  const invoicesQuery = useInvoices();
  const recentInvoices = useMemo(
    () => (invoicesQuery.data?.invoices ?? []).slice(0, 5),
    [invoicesQuery.data?.invoices],
  );
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return (invoicesQuery.data?.invoices ?? []).filter(invoice => {
      const created = new Date(invoice.createdAt);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
  }, [invoicesQuery.data?.invoices]);

  const onDownloadInvoice = async (invoice: (typeof recentInvoices)[number]) => {
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

  const onPreviewInvoice = (invoice: (typeof recentInvoices)[number]) => {
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
          onPress={() => navigation.navigate('Voice')}
        />
        <View style={styles.recentHeaderRow}>
          <BaseText style={styles.sectionTitle}>{t(T.HOME_RECENT_INVOICES)}</BaseText>
          <Pressable onPress={() => navigation.navigate('InvoiceHistory')}>
            <BaseText style={styles.viewAllText}>{t(T.COMMON_VIEW_ALL)}</BaseText>
          </Pressable>
        </View>

        {invoicesQuery.isLoading ? (
          <View style={styles.statCard}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {recentInvoices.map(invoice => (
          <View key={invoice.id ?? invoice.invoiceId} style={styles.invoiceCard}>
            <View style={styles.invoiceLeft}>
              <BaseText style={styles.invoiceName}>{`invoice_${invoice.invoiceId}.pdf`}</BaseText>
              <BaseText style={styles.invoiceMeta}>
                {invoice.invoiceId} | Rs {invoice.total}
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
