import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BaseInput, BaseText } from '../../components/atoms';
import downloadIcon from '../../assets/icons/download.png';
import previewIcon from '../../assets/icons/preview.png';
import shareIcon from '../../assets/icons/share.png';
import { useThemeStore } from '../../stores';
import { mockInvoices } from '../../utils/mockInvoices';
import { getStyles } from './style';
import { T } from '../../lang/constants';

export const InvoiceHistoryScreen = () => {
  const { t } = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<
    'all' | 'today' | 'yesterday' | 'older'
  >('all');

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return mockInvoices.filter(invoice => {
      const isToday = invoice.createdAt.toLowerCase().includes('today');
      const isYesterday = invoice.createdAt.toLowerCase().includes('yesterday');
      const isOlder = !isToday && !isYesterday;

      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && isToday) ||
        (dateFilter === 'yesterday' && isYesterday) ||
        (dateFilter === 'older' && isOlder);

      if (!normalizedQuery) {
        return matchesDate;
      }

      const searchable =
        `${invoice.id} ${invoice.pdfName} ${invoice.customerName}`.toLowerCase();
      return matchesDate && searchable.includes(normalizedQuery);
    });
  }, [dateFilter, searchQuery]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterCard}>
          <BaseInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t(T.INVOICE_HISTORY_SEARCH)}
          />
          <View style={styles.filterRow}>
            {[
              { id: 'all', label: t(T.INVOICE_HISTORY_ALL) },
              { id: 'today', label: t(T.INVOICE_HISTORY_TODAY) },
              { id: 'yesterday', label: t(T.INVOICE_HISTORY_YESTERDAY) },
              { id: 'older', label: t(T.INVOICE_HISTORY_OLDER) },
            ].map(filter => {
              const isActive = dateFilter === filter.id;
              return (
                <Pressable
                  key={filter.id}
                  onPress={() =>
                    setDateFilter(
                      filter.id as 'all' | 'today' | 'yesterday' | 'older',
                    )
                  }
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                >
                  <BaseText
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </BaseText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {filteredInvoices.map(invoice => (
          <View key={invoice.id} style={styles.invoiceCard}>
            <View style={styles.invoiceLeft}>
              <BaseText style={styles.invoiceName}>{invoice.pdfName}</BaseText>
              <BaseText style={styles.invoiceMeta}>
                {invoice.customerName} | {invoice.createdAt}
              </BaseText>
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
                  Alert.alert(
                    t(T.COMMON_PREVIEW),
                    `${t(T.COMMON_PREVIEW)} ${invoice.id}`,
                  )
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
                  Alert.alert(
                    t(T.COMMON_SHARE),
                    `${t(T.COMMON_SHARE)} ${invoice.pdfName}`,
                  )
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

        {filteredInvoices.length === 0 ? (
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
