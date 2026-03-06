import {StyleSheet} from 'react-native';
import {AppTheme} from '../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    gradient: {
      flex: 1,
      backgroundColor: theme.colors.background,
      position: 'relative',
    },
    staticGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    animatedGradientLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    fill: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      paddingHorizontal: 20,
    },
    iconWrap: {
      width: 132,
      height: 132,
      borderRadius: 30,
      backgroundColor: 'rgba(255,255,255,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.26)',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 4},
      elevation: 3,
    },
    icon: {
      width: 100,
      height: 100,
    },
    fallbackLogoText: {
      fontSize: 56,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      letterSpacing: 0.2,
    },
  });
