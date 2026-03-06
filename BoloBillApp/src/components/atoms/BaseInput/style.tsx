import {StyleSheet} from 'react-native';
import {AppTheme} from '../../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: 6,
      width: '100%',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      minHeight: 46,
      color: theme.colors.textPrimary,
      paddingHorizontal: 12,
    },
    error: {
      color: theme.colors.danger,
      fontSize: 12,
    },
  });
