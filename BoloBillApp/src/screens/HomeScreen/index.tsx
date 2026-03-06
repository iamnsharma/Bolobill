import React, {useMemo} from 'react';
import {Alert, Image, Pressable, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseButton, BaseText} from '../../components/atoms';
import {useThemeStore} from '../../stores';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import downloadIcon from '../../assets/icons/download.png';
import previewIcon from '../../assets/icons/preview.png';
import shareIcon from '../../assets/icons/share.png';
import {mockInvoices} from '../../utils/mockInvoices';

type Props = {
  navigation: {
    navigate: (route: string) => void;
  };
};

export const HomeScreen = ({navigation}: Props) => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const recentInvoices = useMemo(() => mockInvoices.slice(0, 5), []);

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
            <BaseText style={styles.statValue}>7 / 50</BaseText>
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

        {recentInvoices.map(invoice => (
          <View key={invoice.id} style={styles.invoiceCard}>
            <View style={styles.invoiceLeft}>
              <BaseText style={styles.invoiceName}>{invoice.pdfName}</BaseText>
              <BaseText style={styles.invoiceMeta}>
                {invoice.id} | Rs {invoice.amount}
              </BaseText>
            </View>
            <View style={styles.invoiceActions}>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    t(T.COMMON_DOWNLOAD),
                    `${t(T.COMMON_DOWNLOAD)} ${invoice.pdfName}`,
                  )
                }
                style={styles.iconBtn}
              >
                <Image
                  source={downloadIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(t(T.COMMON_PREVIEW), `${t(T.COMMON_PREVIEW)} ${invoice.id}`)
                }
                style={styles.iconBtn}
              >
                <Image
                  source={previewIcon}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(t(T.COMMON_SHARE), `${t(T.COMMON_SHARE)} ${invoice.pdfName}`)
                }
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
