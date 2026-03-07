import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  Pressable,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Sound from 'react-native-nitro-sound';
import { BaseText } from '../../atoms';
import { useThemeStore } from '../../../stores';
import { T } from '../../../lang/constants';
import { getStyles } from './style';
import pauseButtonIcon from '../../../assets/icons/pause-button.png';
import recordingGif from '../../../assets/gifs/recording.gif';
import aiMicrophoneIcon from '../../../assets/icons/ai-microphone.png';

type RecordingMeta = {
  durationSec: number;
  recordedAt: string;
  fileName: string;
};

type Props = {
  onRecorded: (audioUri: string, meta: RecordingMeta) => void;
};

export const VoiceRecorder = ({ onRecorded }: Props) => {
  const { t } = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const recordingPathRef = useRef<string | undefined>(undefined);
  const pulse = useRef(new Animated.Value(1)).current;

  const askPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );
    if (alreadyGranted) {
      return true;
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Microphone permission',
        message: 'BoloBill needs microphone access to record invoice voice.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission blocked',
        'Microphone permission is blocked. Please enable it from app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }

    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  useEffect(() => {
    return () => {
      Sound.removeRecordBackListener();
    };
  }, []);

  useEffect(() => {
    if (status !== 'recording') {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.14,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse, status]);

  const startRecording = async () => {
    if (status !== 'idle') {
      return;
    }

    const granted = await askPermission();
    if (!granted) {
      return;
    }

    try {
      setElapsedSec(0);
      const path = await Sound.startRecorder();
      recordingPathRef.current = path;
      Sound.addRecordBackListener(meta => {
        setElapsedSec(Math.floor(meta.currentPosition / 1000));
      });
      setStatus('recording');
    } catch (_error) {
      Alert.alert('Error', 'Unable to start recording');
    }
  };

  const pauseOrResumeRecording = async () => {
    if (status === 'recording') {
      try {
        await Sound.pauseRecorder();
        setStatus('paused');
      } catch (_error) {
        Alert.alert('Error', 'Unable to pause recording');
      }
      return;
    }

    if (status === 'paused') {
      try {
        await Sound.resumeRecorder();
        setStatus('recording');
      } catch (_error) {
        Alert.alert('Error', 'Unable to resume recording');
      }
    }
  };

  const stopRecording = async () => {
    if (status === 'idle') {
      return;
    }

    try {
      const uri = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      const timestamp = Date.now();
      const resolvedPath = uri || recordingPathRef.current || '';
      const fileName = resolvedPath.split('/').pop() || `voice-${timestamp}.m4a`;
      const meta: RecordingMeta = {
        durationSec: elapsedSec,
        recordedAt: new Date().toISOString(),
        fileName,
      };
      setStatus('idle');
      onRecorded(resolvedPath, meta);
    } catch (_error) {
      setStatus('idle');
      Alert.alert('Error', 'Unable to stop recording');
    }
  };

  const getStatusText = () => {
    if (status === 'recording') {
      return `${t(T.VOICE_RECORDING)} ${elapsedSec}s`;
    }

    if (status === 'paused') {
      return t(T.VOICE_PAUSED_AT, {seconds: elapsedSec});
    }

    return t(T.VOICE_TAP_TO_RECORD);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseWrap,
          status === 'recording' && { transform: [{ scale: pulse }] },
        ]}
      >
        <Pressable
          onPress={startRecording}
          style={[
            styles.button,
            status === 'recording' && styles.buttonRecording,
            status === 'paused' && styles.buttonPaused,
          ]}
        >
          {status === 'recording' ? (
            <Image
              source={recordingGif}
              style={styles.recordingGif}
              resizeMode="cover"
            />
          ) : status === 'paused' ? (
            <Image
              source={pauseButtonIcon}
              style={styles.pauseIcon}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={aiMicrophoneIcon}
              tintColor={theme.colors.surface}
              style={styles.aiMicIcon}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Animated.View>

      <BaseText style={styles.caption}>{getStatusText()}</BaseText>

      <View style={styles.controlsRow}>
        <Pressable
          onPress={startRecording}
          disabled={status !== 'idle'}
          style={[
            styles.controlButton,
            status !== 'idle' && styles.controlButtonDisabled,
          ]}
        >
          <BaseText style={styles.controlButtonText}>{t(T.COMMON_RECORD)}</BaseText>
        </Pressable>
        <Pressable
          onPress={pauseOrResumeRecording}
          disabled={status === 'idle'}
          style={[
            styles.controlButton,
            status === 'idle' && styles.controlButtonDisabled,
          ]}
        >
          <BaseText style={styles.controlButtonText}>
            {status === 'paused' ? t(T.COMMON_RESUME) : t(T.COMMON_PAUSE)}
          </BaseText>
        </Pressable>
        <Pressable
          onPress={stopRecording}
          disabled={status === 'idle'}
          style={[
            styles.controlButtonStop,
            status === 'idle' && styles.controlButtonDisabled,
          ]}
        >
          <BaseText style={styles.controlButtonText}>{t(T.COMMON_STOP)}</BaseText>
        </Pressable>
      </View>
    </View>
  );
};
