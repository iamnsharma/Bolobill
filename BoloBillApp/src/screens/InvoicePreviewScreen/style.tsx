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
      gap: 14,
      paddingBottom: 28,
    },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      gap: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subTitle: {
      color: theme.colors.textSecondary,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeVerified: {
      backgroundColor: theme.colors.success,
    },
    badgePersonal: {
      backgroundColor: theme.colors.warning,
    },
    badgeText: {
      color: theme.colors.surface,
      fontWeight: '700',
      fontSize: 12,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    transcriptText: {
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    itemCard: {
      gap: 10,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 10,
    },
    totalCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '700',
    },
    totalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.primary,
    },
  });
