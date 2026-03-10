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
      gap: 16,
      paddingBottom: 28,
    },
    heroCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      padding: 16,
      gap: 10,
      elevation: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.surface,
    },
    heroSubtitle: {
      color: theme.colors.surface,
      lineHeight: 20,
      opacity: 0.95,
    },
    heroTagsRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 2,
    },
    heroTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.28)',
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    heroTagText: {
      color: theme.colors.surface,
      fontWeight: '600',
      fontSize: 12,
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      gap: 6,
    },
    statLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    recentHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
    },
    viewAllText: {
      color: theme.colors.primary,
      fontWeight: '600',
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
      gap: 6,
    },
    invoiceName: {
      fontWeight: '600',
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
