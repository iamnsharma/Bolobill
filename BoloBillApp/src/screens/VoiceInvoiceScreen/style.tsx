import {StyleSheet} from 'react-native';
import {AppTheme} from '../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      gap: 12,
      paddingBottom: 120,
    },
    heroCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      padding: 16,
      gap: 8,
      elevation: 2,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.surface,
    },
    heroSubtitle: {
      color: theme.colors.surface,
      lineHeight: 20,
      opacity: 0.95,
    },
    processing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    savedCard: {
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      gap: 4,
      backgroundColor: theme.colors.background,
    },
    savedTitle: {
      fontWeight: '700',
      marginBottom: 2,
    },
    savedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    savedHeaderActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    savedDeleteBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    savedDeleteIcon: {
      width: 14,
      height: 14,
      tintColor: theme.colors.danger,
    },
    sectionTitle: {
      fontWeight: '700',
      fontSize: 16,
      color: theme.colors.textPrimary,
    },
    manualTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    manualHint: {
      color: theme.colors.textSecondary,
      lineHeight: 19,
    },
    manualInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    manualField: {
      flex: 1,
    },
    manualItemsWrap: {
      maxHeight: 200,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
    },
    manualItemsContent: {
      padding: 10,
      gap: 8,
    },
    manualItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      alignItems: 'flex-start',
    },
    manualItemInfo: {
      flex: 1,
      gap: 2,
    },
    manualItemText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '500',
    },
    deleteItemBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: theme.colors.surface,
    },
    addItemInlineBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 42,
      height: 42,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
    },
    addItemIcon: {
      width: 14,
      height: 14,
      tintColor: theme.colors.surface,
    },
    addPlusText: {
      color: theme.colors.surface,
      fontSize: 24,
      lineHeight: 24,
      fontWeight: '700',
      marginTop: -2,
    },
    deleteItemText: {
      color: theme.colors.danger,
      fontSize: 12,
      fontWeight: '600',
    },
    manualDeleteIcon: {
      width: 12,
      height: 12,
      tintColor: theme.colors.danger,
    },
    closeIcon: {
      width: 12,
      height: 12,
      tintColor: theme.colors.textPrimary,
    },
  });
