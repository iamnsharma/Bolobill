import {StyleSheet} from 'react-native';
import {AppTheme} from '../../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    button: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
    },
    buttonRecording: {
      backgroundColor: theme.colors.danger,
    },
    buttonPaused: {
      backgroundColor: theme.colors.warning,
    },
    pulseWrap: {
      borderRadius: 999,
      overflow: 'hidden',
    },
    recordingGif: {
      width: '100%',
      height: '100%',
      borderRadius: 60,
    },
    pauseIcon: {
      width: 58,
      height: 58,
    },
    aiMicIcon: {
      width: 66,
      height: 66,
    },
    caption: {
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    controlsRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    controlButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlButtonStop: {
      flex: 1,
      backgroundColor: theme.colors.danger,
      borderRadius: 10,
      minHeight: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    controlButtonDisabled: {
      opacity: 0.45,
    },
    controlButtonText: {
      color: theme.colors.surface,
      fontWeight: '700',
      fontSize: 13,
    },
  });
