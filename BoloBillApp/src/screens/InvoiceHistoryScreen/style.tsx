import { StyleSheet } from 'react-native';
import { AppTheme } from '../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 6,
      gap: 10,
      paddingBottom: 28,
    },
    heroCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 16,
      gap: 8,
      elevation: 2,
    },
    heroTitle: {
      color: theme.colors.surface,
      fontSize: 22,
      fontWeight: '800',
    },
    heroSubtitle: {
      color: theme.colors.surface,
      opacity: 0.95,
      lineHeight: 20,
    },
    resultCount: {
      color: theme.colors.surface,
      fontSize: 12,
      opacity: 0.92,
      fontWeight: '600',
    },
    filterCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      gap: 10,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 7,
      backgroundColor: theme.colors.background,
    },
    filterChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    filterChipTextActive: {
      color: theme.colors.surface,
    },
    invoiceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    invoiceLeft: {
      flex: 1,
      gap: 4,
    },
    invoiceName: {
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    invoiceMeta: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    invoiceActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    actionIcon: {
      width: 17,
      height: 17,
      tintColor: theme.colors.primary,
    },
    emptyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 6,
      alignItems: 'center',
    },
    emptyTitle: {
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptySubtitle: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
