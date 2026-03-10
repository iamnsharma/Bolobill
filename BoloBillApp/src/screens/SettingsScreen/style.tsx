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
      paddingBottom: 24,
    },
    walletHero: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      padding: 14,
      gap: 6,
    },
    walletHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    walletTitle: {
      color: theme.colors.surface,
      fontSize: 16,
      fontWeight: '800',
    },
    walletBadge: {
      backgroundColor: theme.colors.surface,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    walletBadgeText: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: '800',
    },
    walletAmount: {
      color: theme.colors.surface,
      fontSize: 28,
      fontWeight: '900',
    },
    walletSubtitle: {
      color: theme.colors.surface,
      opacity: 0.9,
      fontSize: 12,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      gap: 10,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    sectionHeaderTextWrap: {
      flex: 1,
      gap: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    profileHeader: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    profileAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileAvatarText: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
      fontSize: 20,
    },
    profileHeaderTextWrap: {
      flex: 1,
      gap: 4,
    },
    profileToggleWrap: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.colors.background,
    },
    profileToggleItem: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    profileToggleActive: {
      backgroundColor: theme.colors.primary,
    },
    profileToggleText: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
    },
    profileToggleTextActive: {
      color: theme.colors.surface,
    },
    profileInfoCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      backgroundColor: theme.colors.background,
      padding: 12,
      gap: 6,
    },
    profileInfoTitle: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
      fontSize: 14,
    },
    profileInfoText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    profileFieldRow: {
      marginTop: 6,
      gap: 2,
    },
    profileFieldLabel: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    profileFieldValue: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '700',
    },
    themePillRow: {
      flexDirection: 'row',
      gap: 8,
    },
    themePill: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
    },
    themePillActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    themePillText: {
      fontWeight: '600',
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    themePillTextActive: {
      color: theme.colors.surface,
    },
    languageTabs: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    languageTab: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.background,
    },
    languageTabActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    languageTabText: {
      fontWeight: '600',
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    languageTabTextActive: {
      color: theme.colors.surface,
    },
    feedbackInput: {
      minHeight: 110,
      paddingTop: 12,
    },
    feedbackHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    feedbackHeaderTextWrap: {
      flex: 1,
      gap: 4,
    },
    feedbackToggleText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },
  });
