import {StyleSheet} from 'react-native';
import {AppTheme} from '../../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      flexDirection: 'row',
      gap: 8,
    },
    disabled: {
      opacity: 0.6,
    },
    title: {
      color: theme.colors.surface,
      fontWeight: '700',
    },
  });
