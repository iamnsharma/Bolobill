import React, {useMemo, useState, useRef, useCallback} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, View, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { t } from '../../lang';
import { T } from '../../lang/constants';
import { useAuthStore, useThemeStore } from '../../stores';
import { getStyles } from './style';
import appLogo from '../../assets/icons/bolobill-logo.png';

const LOGO_CLICK_WINDOW_MS = 4000;
const LOGO_CLICKS_NEEDED = 4;
const RESEND_OTP_COOLDOWN_SEC = 60;

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, string>) => void;
  };
};

export const LoginScreen = ({ navigation }: Props) => {
  const theme = useThemeStore(s => s.theme);
  const sendOtp = useAuthStore(s => s.sendOtp);
  const loginWithOtp = useAuthStore(s => s.loginWithOtp);
  const loginWithPin = useAuthStore(s => s.loginWithPin);
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [apiError, setApiError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLogoTimer = useCallback(() => {
    if (logoClickTimer.current) {
      clearTimeout(logoClickTimer.current);
      logoClickTimer.current = null;
    }
    logoClickCount.current = 0;
  }, []);

  const handleLogoPress = useCallback(() => {
    logoClickCount.current += 1;
    if (logoClickCount.current >= LOGO_CLICKS_NEEDED) {
      clearLogoTimer();
      setShowAdminForm(true);
      setApiError('');
      return;
    }
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => {
      clearLogoTimer();
    }, LOGO_CLICK_WINDOW_MS);
  }, [clearLogoTimer]);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_OTP_COOLDOWN_SEC);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

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
    if (!validateStepOne()) return;
    try {
      await sendOtp(phone);
      setIsOtpSent(true);
      startResendCooldown();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send OTP';
      setApiError(message);
    }
  };

  const onResendOtp = async () => {
    setApiError('');
    try {
      await sendOtp(phone);
      startResendCooldown();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not resend OTP';
      setApiError(message);
    }
  };

  const onLogin = async () => {
    setApiError('');
    if (otp.trim().length < 6) {
      setOtpError('Enter 6-digit OTP');
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

  const onAdminLogin = async () => {
    setApiError('');
    if (phone.trim().length < 10 || pin.trim().length < 4) {
      setApiError('Enter phone and PIN');
      return;
    }
    try {
      await loginWithPin({ phone, pin });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid phone or PIN';
      setApiError(message);
    }
  };

  const hideAdminForm = useCallback(() => {
    setShowAdminForm(false);
    setApiError('');
    setPin('');
    clearLogoTimer();
  }, [clearLogoTimer]);

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
            <Pressable style={styles.logoWrap} onPress={handleLogoPress}>
              <Image source={appLogo} style={styles.logo} resizeMode="contain" />
            </Pressable>
            <BaseText style={styles.title}>
              {showAdminForm ? 'Admin sign in' : t(T.AUTH_LOGIN_TITLE)}
            </BaseText>
            <BaseText style={styles.subtitle}>
              {showAdminForm
                ? 'Sign in with phone and PIN'
                : isOtpSent
                  ? 'Enter the OTP sent to your mobile number.'
                  : 'Secure login with one-time password.'}
            </BaseText>
            {!showAdminForm && (
              <View style={styles.stepRow}>
                <View style={[styles.stepDot, styles.stepDotActive]} />
                <View style={[styles.stepLine, isOtpSent ? styles.stepLineActive : null]} />
                <View style={[styles.stepDot, isOtpSent ? styles.stepDotActive : null]} />
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            {apiError ? <BaseText style={styles.apiErrorText}>{apiError}</BaseText> : null}
            {showAdminForm ? (
              <>
                <BaseInput
                  label={t(T.AUTH_PHONE)}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                />
                <BaseInput
                  label="PIN"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  maxLength={8}
                  placeholder="Enter PIN"
                  secureTextEntry
                />
                <View style={styles.actionRow}>
                  <BaseButton
                    title="Back"
                    onPress={hideAdminForm}
                    style={styles.secondaryBtn}
                  />
                  <BaseButton
                    title="Sign in (Admin)"
                    onPress={onAdminLogin}
                    loading={isLoading}
                    disabled={phone.trim().length < 10 || pin.trim().length < 4}
                    style={styles.primaryBtn}
                  />
                </View>
              </>
            ) : !isOtpSent ? (
              <>
                <BaseInput
                  label={t(T.AUTH_PHONE)}
                  value={phone}
                  onChangeText={value => {
                    setPhone(value);
                    if (phoneError) setPhoneError('');
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
                  <Pressable onPress={() => { setIsOtpSent(false); setOtp(''); }}>
                    <BaseText style={styles.changeText}>Change</BaseText>
                  </Pressable>
                </View>
                <BaseInput
                  label={t(T.AUTH_OTP)}
                  value={otp}
                  onChangeText={value => {
                    setOtp(value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  error={otpError}
                />
                <View style={styles.actionRow}>
                  <BaseButton
                    title={resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                    onPress={onResendOtp}
                    loading={isLoading}
                    disabled={resendCooldown > 0}
                    style={styles.secondaryBtn}
                  />
                  <BaseButton
                    title={t(T.AUTH_LOGIN_TITLE)}
                    onPress={onLogin}
                    loading={isLoading}
                    disabled={otp.trim().length < 6}
                    style={styles.primaryBtn}
                  />
                </View>
              </>
            )}

            {!showAdminForm && (
              <>
                <Pressable style={styles.singleLinkWrap} onPress={() => navigation.navigate('Register')}>
                  <BaseText style={styles.linkRight}>New here? Register</BaseText>
                </Pressable>
                <Pressable style={styles.guestWrap} onPress={loginAsGuest}>
                  <BaseText style={styles.guestLink}>Continue as Guest (Explore Only)</BaseText>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
