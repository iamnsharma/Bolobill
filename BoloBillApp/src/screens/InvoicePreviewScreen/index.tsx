import React, {useMemo, useState} from 'react';
import {Alert, Image, Pressable, ScrollView, Share, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {BaseButton, BaseInput, BaseText} from '../../components/atoms';
import {useAuthStore, useThemeStore} from '../../stores';
import {CreateInvoiceFromVoiceResponse, InvoiceItem} from '../../services/api/types/invoice.types';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import downloadIcon from '../../assets/icons/download.png';
import shareIcon from '../../assets/icons/share.png';
import {createInvoicePdfForDownload, createInvoicePdfForShare} from '../../utils/invoice/pdf';
import editIcon from '../../assets/icons/edit.png';
import {useUpdateInvoiceById} from '../../hooks/apiHooks';
import {buildInvoiceFileName} from '../../utils/invoice/fileName';

type Props = {
  route: {
    params?: {
      invoice?: CreateInvoiceFromVoiceResponse;
      editable?: boolean;
    };
  };
};

export const InvoicePreviewScreen = ({route}: Props) => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const user = useAuthStore(s => s.user);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const updateInvoiceMutation = useUpdateInvoiceById();
  const initialInvoice = route.params?.invoice;
  const canEditFromRoute = Boolean(route.params?.editable);
  const [currentInvoice, setCurrentInvoice] = useState<CreateInvoiceFromVoiceResponse | undefined>(
    initialInvoice,
  );
  const [isEditing, setIsEditing] = useState(canEditFromRoute);
  const [customerName, setCustomerName] = useState(initialInvoice?.customerName ?? '');
  const [items, setItems] = useState<InvoiceItem[]>(initialInvoice?.items ?? []);

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

  const onUpdateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string,
  ) => {
    setItems(current =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }
        if (field === 'totalPrice') {
          const parsed = Number(value);
          return {
            ...item,
            totalPrice: Number.isFinite(parsed) && parsed >= 0 ? parsed : 0,
          };
        }
        return {
          ...item,
          [field]: value,
        };
      }),
    );
  };

  const computedTotal = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0),
    [items],
  );

  const onSaveChanges = async () => {
    if (!currentInvoice?.id) {
      Alert.alert('BoloBill', 'Invoice id is missing, cannot save changes.');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('BoloBill', 'Please enter customer name.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('BoloBill', 'Please keep at least one item.');
      return;
    }
    const hasInvalidItem = items.some(
      item => !item.name.trim() || !item.quantity.trim() || Number(item.totalPrice) <= 0,
    );
    if (hasInvalidItem) {
      Alert.alert('BoloBill', 'Please fill valid item name, quantity and price.');
      return;
    }

    try {
      const updatedInvoice = await updateInvoiceMutation.mutateAsync({
        id: currentInvoice.id,
        payload: {
          customerName: customerName.trim(),
          items: items.map(item => ({
            name: item.name.trim(),
            quantity: item.quantity.trim(),
            totalPrice: Number(item.totalPrice),
          })),
        },
      });
      setCurrentInvoice(updatedInvoice);
      setCustomerName(updatedInvoice.customerName);
      setItems(updatedInvoice.items);
      setIsEditing(false);
      Alert.alert('BoloBill', 'Invoice updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update invoice';
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
              <BaseText style={styles.subTitle}>{buildInvoiceFileName(currentInvoice)}</BaseText>
              <BaseText style={styles.subTitle}>{`Customer: ${customerName || currentInvoice.customerName}`}</BaseText>
            </View>
            <View style={styles.inlineActions}>
              {canEditFromRoute ? (
                <Pressable onPress={() => setIsEditing(value => !value)} style={styles.iconActionBtn}>
                  <Image source={editIcon} style={styles.actionIcon} resizeMode="contain" />
                </Pressable>
              ) : null}
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
          {isEditing ? (
            <>
              <BaseInput
                label="Customer Name"
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Enter customer name"
              />
              {items.map((item, index) => (
                <View key={`${item.name}-${index}`} style={styles.itemCard}>
                  <BaseInput
                    label={`Item ${index + 1} Name`}
                    value={item.name}
                    onChangeText={value => onUpdateItem(index, 'name', value)}
                  />
                  <View style={styles.itemEditRow}>
                    <BaseInput
                      containerStyle={styles.itemEditField}
                      label={t(T.VOICE_QUANTITY)}
                      value={item.quantity}
                      onChangeText={value => onUpdateItem(index, 'quantity', value)}
                    />
                    <BaseInput
                      containerStyle={styles.itemEditField}
                      label={t(T.VOICE_PRICE_INR)}
                      value={String(item.totalPrice)}
                      onChangeText={value => onUpdateItem(index, 'totalPrice', value)}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              ))}
              <BaseButton
                title={updateInvoiceMutation.isPending ? 'Saving...' : 'Save Changes'}
                onPress={onSaveChanges}
                disabled={updateInvoiceMutation.isPending}
              />
            </>
          ) : (
            items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.itemCard}>
                <BaseText style={styles.itemTitle}>{`${index + 1}. ${item.name}`}</BaseText>
                <View style={styles.itemMetaRow}>
                  <BaseText style={styles.itemMeta}>{`${t(T.VOICE_QUANTITY)}: ${item.quantity}`}</BaseText>
                  <BaseText style={styles.itemPrice}>{`Rs ${item.totalPrice}`}</BaseText>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.totalCard}>
          <BaseText style={styles.totalLabel}>{t(T.INVOICE_PREVIEW_TOTAL)}</BaseText>
          <BaseText style={styles.totalValue}>Rs {computedTotal}</BaseText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};
