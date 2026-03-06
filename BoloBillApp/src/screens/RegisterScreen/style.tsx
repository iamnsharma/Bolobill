import {StyleSheet} from 'react-native';
import {AppTheme} from '../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      padding: 16,
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
    },
    row: {
      flexDirection: 'row',
      gap: 10,
    },
    optionButton: {
      flex: 1,
    },
    link: {
      color: theme.colors.primary,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
