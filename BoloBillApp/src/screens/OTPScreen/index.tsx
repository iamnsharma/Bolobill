import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { t } from '../../lang';
import { T } from '../../lang/constants';
import { useAuthStore, useThemeStore } from '../../stores';
import { getStyles } from '../LoginScreen/style';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, string>) => void;
  };
  route?: {
    params?: {
      phone?: string;
      flow?: 'register' | 'login';
      name?: string;
      businessName?: string;
      accountType?: 'business' | 'personal';
    };
  };
};

export const OTPScreen = ({ navigation, route }: Props) => {
  const theme = useThemeStore(s => s.theme);
  const verifyFirebaseOtp = useAuthStore(s => s.verifyFirebaseOtp);
  const sendFirebaseOtp = useAuthStore(s => s.sendFirebaseOtp);
  const pendingPhone = useAuthStore(s => s.pendingPhone);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const displayPhone = route?.params?.phone || pendingPhone || 'Phone';
  const firebaseProfile =
    route?.params?.flow === 'register'
      ? {
          name: route.params?.name?.trim(),
          businessName: route.params?.businessName?.trim(),
          accountType: route.params?.accountType ?? 'business',
        }
      : undefined;

  const onVerify = async () => {
    setApiError('');
    if (otp.trim().length < 6) {
      setOtpError('Enter valid 6-digit OTP');
      return;
    }
    setOtpError('');
    try {
      await verifyFirebaseOtp(otp.trim(), firebaseProfile);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'OTP verification failed';
      setApiError(message);
    }
  };

  const onResend = async () => {
    if (!pendingPhone) {
      setApiError('Session expired. Please enter phone again.');
      navigation.navigate('PhoneNumber');
      return;
    }
    try {
      await sendFirebaseOtp(pendingPhone);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not resend OTP';
      setApiError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <BaseText style={styles.title}>Verify OTP</BaseText>
            <BaseText style={styles.subtitle}>
              Enter the code sent to {displayPhone}
            </BaseText>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={[styles.stepLine, styles.stepLineActive]} />
              <View style={[styles.stepDot, styles.stepDotActive]} />
            </View>
          </View>

          <View style={styles.formSection}>
            {apiError ? (
              <BaseText style={styles.apiErrorText}>{apiError}</BaseText>
            ) : null}
            <BaseInput
              label={t(T.AUTH_OTP)}
              value={otp}
              onChangeText={value => {
                setOtp(value);
                if (otpError) {
                  setOtpError('');
                }
              }}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              error={otpError}
            />
            <View style={styles.actionRow}>
              <BaseButton
                title={t(T.AUTH_SEND_OTP)}
                onPress={onResend}
                loading={isLoading}
                style={styles.secondaryBtn}
              />
              <BaseButton
                title={t(T.AUTH_LOGIN_TITLE)}
                onPress={onVerify}
                loading={isLoading}
                disabled={otp.trim().length < 6}
                style={styles.primaryBtn}
              />
            </View>
            <Pressable
              style={styles.singleLinkWrap}
              onPress={() => navigation.navigate('PhoneNumber')}
            >
              <BaseText style={styles.linkRight}>Change phone number</BaseText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
