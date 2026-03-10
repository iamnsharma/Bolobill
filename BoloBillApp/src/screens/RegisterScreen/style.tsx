import { StyleSheet } from 'react-native';
import { AppTheme } from '../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: 16,
      gap: 18,
      paddingBottom: 40,
    },
    heroCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 22,
      gap: 10,
      elevation: 2,
      alignItems: 'center',
    },
    logoWrap: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    logo: {
      width: 180,
      height: 180,
    },
    formSection: {
      backgroundColor: 'transparent',
      gap: 16,
      paddingHorizontal: 2,
    },
    apiErrorText: {
      color: theme.colors.danger,
      fontSize: 13,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.surface,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.surface,
      lineHeight: 19,
      opacity: 0.95,
      textAlign: 'center',
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    stepDot: {
      width: 10,
      height: 10,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      backgroundColor: 'transparent',
    },
    stepDotActive: {
      backgroundColor: theme.colors.surface,
    },
    stepLine: {
      width: 40,
      height: 2,
      marginHorizontal: 6,
      backgroundColor: 'rgba(255,255,255,0.35)',
    },
    stepLineActive: {
      backgroundColor: theme.colors.surface,
    },
    summaryCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.background,
      gap: 4,
    },
    summaryText: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
    },
    primaryBtn: {
      flex: 1.2,
    },
    secondaryBtn: {
      flex: 1,
    },
    singleLinkWrap: {
      alignSelf: 'flex-end',
      marginTop: 2,
    },
    linkRight: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
