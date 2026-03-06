import {StyleSheet} from 'react-native';
import {AppTheme} from '../../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: 16,
      gap: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 48,
      color: theme.colors.textPrimary,
    },
    error: {
      color: theme.colors.danger,
      fontSize: 12,
      marginTop: -8,
    },
    summaryCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: 12,
      gap: 8,
      minHeight: 120,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    secondaryBtn: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryBtnText: {
      color: theme.colors.textPrimary,
    },
  });
