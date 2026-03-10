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
      paddingBottom: 28,
    },
    heroCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      padding: 14,
      gap: 8,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    heroIcon: {
      width: 22,
      height: 22,
      tintColor: theme.colors.surface,
    },
    heroBadge: {
      color: theme.colors.surface,
      fontWeight: '800',
      fontSize: 12,
      textTransform: 'uppercase',
    },
    heroTitle: {
      color: theme.colors.surface,
      fontSize: 21,
      fontWeight: '900',
    },
    heroSubtitle: {
      color: theme.colors.surface,
      opacity: 0.92,
      lineHeight: 18,
      fontSize: 12,
    },
    planCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      padding: 12,
      gap: 8,
    },
    planCardActive: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    planRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    planIcon: {
      width: 40,
      height: 40,
    },
    planTextWrap: {
      flex: 1,
      gap: 2,
    },
    planName: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },
    planPrice: {
      color: theme.colors.primary,
      fontWeight: '800',
      fontSize: 13,
    },
    planBtn: {
      minWidth: 104,
      paddingHorizontal: 8,
    },
    planDescription: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    bottomHint: {
      marginTop: 4,
      color: theme.colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
  });
