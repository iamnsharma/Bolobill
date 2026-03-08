import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BaseInput, BaseText } from '../../components/atoms';
import downloadIcon from '../../assets/icons/download.png';
import previewIcon from '../../assets/icons/preview.png';
import deleteIcon from '../../assets/icons/delete.png';
import { useThemeStore } from '../../stores';
import { useDeleteInvoiceById, useInvoices } from '../../hooks/apiHooks';
import { getStyles } from './style';
import { T } from '../../lang/constants';

type Props = {
  navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void;
  };
};

export const InvoiceHistoryScreen = ({navigation}: Props) => {
  const { t } = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const invoicesQuery = useInvoices();
  const deleteInvoiceMutation = useDeleteInvoiceById();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<
    'all' | 'today' | 'yesterday' | 'older'
  >('all');

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const invoices = invoicesQuery.data?.invoices ?? [];
    const now = new Date();
    const startToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startYesterday = new Date(startToday);
    startYesterday.setDate(startYesterday.getDate() - 1);

    return invoices.filter(invoice => {
      const created = new Date(invoice.createdAt);
      const isToday = created >= startToday;
      const isYesterday = created >= startYesterday && created < startToday;
      const isOlder = !isToday && !isYesterday;

      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && isToday) ||
        (dateFilter === 'yesterday' && isYesterday) ||
        (dateFilter === 'older' && isOlder);

      if (!normalizedQuery) {
        return matchesDate;
      }

      const searchable = `${invoice.id ?? ''} ${invoice.invoiceId} ${
        invoice.voiceTranscript
      }`.toLowerCase();
      return matchesDate && searchable.includes(normalizedQuery);
    });
  }, [dateFilter, invoicesQuery.data?.invoices, searchQuery]);

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

  const onDeleteInvoice = (id?: string) => {
    if (!id) {
      Alert.alert('BoloBill', 'Invoice id not found');
      return;
    }
    Alert.alert('BoloBill', 'Delete this invoice?', [
      {text: t(T.COMMON_CANCEL), style: 'cancel'},
      {
        text: t(T.COMMON_DELETE),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInvoiceMutation.mutateAsync(id);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete invoice';
            Alert.alert('BoloBill', message);
          }
        },
      },
    ]);
  };

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

        {invoicesQuery.isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {filteredInvoices.map(invoice => (
          <View
            key={invoice.id ?? invoice.invoiceId}
            style={styles.invoiceCard}
          >
            <View style={styles.invoiceLeft}>
              <BaseText
                style={styles.invoiceName}
              >{`invoice_${invoice.invoiceId}.pdf`}</BaseText>
              <BaseText style={styles.invoiceMeta}>
                {new Date(invoice.createdAt).toLocaleString('en-IN')}
              </BaseText>
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
                onPress={() => onDeleteInvoice(invoice.id)}
                style={styles.iconBtn}
              >
                <Image
                  source={deleteIcon}
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
