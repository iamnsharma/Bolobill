import {StyleSheet} from 'react-native';
import {AppTheme} from '../../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    text: {
      color: theme.colors.textPrimary,
      fontSize: 16,
    },
  });
