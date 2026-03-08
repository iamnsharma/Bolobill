import React, {useMemo} from 'react';
import {ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, Share, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseButton, BaseText} from '../../components/atoms';
import {useThemeStore} from '../../stores';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import downloadIcon from '../../assets/icons/download.png';
import previewIcon from '../../assets/icons/preview.png';
import shareIcon from '../../assets/icons/share.png';
import {useInvoices} from '../../hooks/apiHooks';

type Props = {
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void;
  };
};

export const HomeScreen = ({navigation}: Props) => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
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

  const openPdf = async (pdfUrl?: string) => {
    if (!pdfUrl) {
      Alert.alert('BoloBill', 'PDF is not available yet.');
      return;
    }
    const canOpen = await Linking.canOpenURL(pdfUrl);
    if (!canOpen) {
      Alert.alert('BoloBill', 'Unable to open PDF URL.');
      return;
    }
    await Linking.openURL(pdfUrl);
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
                onPress={() => openPdf(invoice.pdfUrl)}
                style={styles.iconBtn}
              >
                <Image
                  source={downloadIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('InvoicePreview', {invoice})}
                style={styles.iconBtn}
              >
                <Image
                  source={previewIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() => Share.share({message: invoice.pdfUrl || invoice.invoiceId})}
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
      </ScrollView>
    </SafeAreaView>
  );
};
