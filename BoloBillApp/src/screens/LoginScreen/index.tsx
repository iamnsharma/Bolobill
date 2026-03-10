import React, {useMemo, useState} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, View, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { t } from '../../lang';
import { T } from '../../lang/constants';
import { useAuthStore, useThemeStore } from '../../stores';
import { getStyles } from './style';
import appLogo from '../../assets/icons/bolobill-logo.png';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, string>) => void;
  };
};

export const LoginScreen = ({ navigation }: Props) => {
  const theme = useThemeStore(s => s.theme);
  const sendOtp = useAuthStore(s => s.sendOtp);
  const loginWithOtp = useAuthStore(s => s.loginWithOtp);
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');

  const validateStepOne = () => {
    let valid = true;
    if (phone.trim().length !== 10) {
      setPhoneError('Enter a valid 10-digit phone number');
      valid = false;
    } else {
      setPhoneError('');
    }
    return valid;
  };

  const onSendOtp = async () => {
    setApiError('');
    if (!validateStepOne()) {
      return;
    }
    try {
      await sendOtp(phone);
      setIsOtpSent(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send OTP';
      setApiError(message);
    }
  };

  const onLogin = async () => {
    setApiError('');
    if (otp.trim().length < 4) {
      setOtpError('Enter valid OTP');
      return;
    }
    setOtpError('');
    try {
      await loginWithOtp({
        phone,
        otp,
        name: 'Business User',
        accountType: 'business',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setApiError(message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.logoWrap}>
              <Image source={appLogo} style={styles.logo} resizeMode="contain" />
            </View>
            <BaseText style={styles.title}>{t(T.AUTH_LOGIN_TITLE)}</BaseText>
            <BaseText style={styles.subtitle}>
              {isOtpSent
                ? 'Enter the OTP sent to your mobile number.'
                : 'Secure login with one-time password.'}
            </BaseText>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={[styles.stepLine, isOtpSent ? styles.stepLineActive : null]} />
              <View style={[styles.stepDot, isOtpSent ? styles.stepDotActive : null]} />
            </View>
          </View>

          <View style={styles.formSection}>
            {apiError ? <BaseText style={styles.apiErrorText}>{apiError}</BaseText> : null}
            {!isOtpSent ? (
              <>
                <BaseInput
                  label={t(T.AUTH_PHONE)}
                  value={phone}
                  onChangeText={value => {
                    setPhone(value);
                    if (phoneError) {
                      setPhoneError('');
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  error={phoneError}
                />
                <BaseButton
                  title={t(T.AUTH_SEND_OTP)}
                  onPress={onSendOtp}
                  loading={isLoading}
                  disabled={phone.trim().length < 10}
                />
              </>
            ) : (
              <>
                <View style={styles.phoneBadge}>
                  <BaseText style={styles.phoneBadgeText}>{`+91 ${phone}`}</BaseText>
                  <Pressable onPress={() => setIsOtpSent(false)}>
                    <BaseText style={styles.changeText}>Change</BaseText>
                  </Pressable>
                </View>
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
                    onPress={onSendOtp}
                    loading={isLoading}
                    disabled={phone.trim().length < 10}
                    style={styles.secondaryBtn}
                  />
                  <BaseButton
                    title={t(T.AUTH_LOGIN_TITLE)}
                    onPress={onLogin}
                    loading={isLoading}
                    disabled={otp.trim().length < 4}
                    style={styles.primaryBtn}
                  />
                </View>
              </>
            )}

            <Pressable style={styles.singleLinkWrap} onPress={() => navigation.navigate('Register')}>
              <BaseText style={styles.linkRight}>New here? Register</BaseText>
            </Pressable>
            <Pressable
              style={styles.guestWrap}
              onPress={loginAsGuest}>
              <BaseText style={styles.guestLink}>Continue as Guest (Explore Only)</BaseText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
