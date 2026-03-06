import {StyleSheet} from 'react-native';
import {AppTheme} from '../../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
    },
    close: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
