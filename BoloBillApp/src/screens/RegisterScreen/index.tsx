import React, {useMemo, useState, useCallback} from 'react';
import {KeyboardAvoidingView, Platform, Pressable, ScrollView, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { t } from '../../lang';
import { T } from '../../lang/constants';
import { useAuthStore, useThemeStore } from '../../stores';
import { getStyles } from './style';

const RESEND_COOLDOWN_SEC = 60;

type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
  route?: {
    params?: {
      phone?: string;
    };
  };
};

export const RegisterScreen = ({ navigation, route }: Props) => {
  const theme = useThemeStore(s => s.theme);
  const registerWithOtp = useAuthStore(s => s.registerWithOtp);
  const sendOtp = useAuthStore(s => s.sendOtp);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [phone, setPhone] = useState(route?.params?.phone ?? '');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nameError, setNameError] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pinError, setPinError] = useState('');
  const [apiError, setApiError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN_SEC);
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

  const onContinueDetails = () => {
    let valid = true;
    if (name.trim().length < 2) {
      setNameError('Enter at least 2 characters for full name');
      valid = false;
    } else {
      setNameError('');
    }
    if (businessName.trim().length < 2) {
      setBusinessNameError('Enter Business / Branch Name');
      valid = false;
    } else {
      setBusinessNameError('');
    }
    if (phone.trim().length < 10) {
      setPhoneError('Enter a valid 10-digit phone number');
      valid = false;
    } else {
      setPhoneError('');
    }
    if (!valid) return;
    setStep(2);
  };

  const onSendOtp = async () => {
    setApiError('');
    try {
      await sendOtp(phone);
      setStep(3);
      startResendCooldown();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to send OTP');
    }
  };

  const onResendOtp = async () => {
    setApiError('');
    try {
      await sendOtp(phone);
      startResendCooldown();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to resend OTP');
    }
  };

  const onVerifyAndCreateAccount = async () => {
    setApiError('');
    if (otp.trim().length < 6) {
      setOtpError('Enter 6-digit OTP');
      return;
    }
    setOtpError('');
    if (pin.trim().length < 4) {
      setPinError('PIN should be at least 4 digits');
      return;
    }
    setPinError('');
    try {
      await registerWithOtp({
        phone,
        otp: otp.trim(),
        name: name.trim(),
        businessName: businessName.trim(),
        pin: pin.trim(),
      });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Registration failed');
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
            <BaseText style={styles.title}>{t(T.AUTH_REGISTER_TITLE)}</BaseText>
            <BaseText style={styles.subtitle}>
              {step === 1
                ? 'Set up your business profile.'
                : step === 2
                  ? 'Send OTP to your number.'
                  : 'Enter OTP and create PIN.'}
            </BaseText>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 ? styles.stepLineActive : null]} />
              <View style={[styles.stepDot, step >= 2 ? styles.stepDotActive : null]} />
              <View style={[styles.stepLine, step === 3 ? styles.stepLineActive : null]} />
              <View style={[styles.stepDot, step === 3 ? styles.stepDotActive : null]} />
            </View>
          </View>

          <View style={styles.formSection}>
            {apiError ? <BaseText style={styles.apiErrorText}>{apiError}</BaseText> : null}
            {step === 1 && (
              <>
                <BaseInput
                  label="Full Name"
                  value={name}
                  onChangeText={value => {
                    setName(value);
                    if (nameError) setNameError('');
                  }}
                  maxLength={40}
                  placeholder="Enter your full name"
                  error={nameError}
                />
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
                <BaseInput
                  label={t(T.AUTH_BUSINESS_BRANCH_NAME)}
                  value={businessName}
                  onChangeText={value => {
                    setBusinessName(value);
                    if (businessNameError) setBusinessNameError('');
                  }}
                  maxLength={60}
                  placeholder="e.g. Sharma Kirana - Jaipur Branch"
                  error={businessNameError}
                />
                <BaseButton
                  title="Continue"
                  onPress={onContinueDetails}
                  disabled={phone.length < 10 || name.trim().length < 2 || businessName.trim().length < 2}
                />
              </>
            )}
            {step === 2 && (
              <>
                <View style={styles.summaryCard}>
                  <BaseText style={styles.summaryText}>{`+91 ${phone}`}</BaseText>
                  <BaseText style={styles.summaryText}>{name}</BaseText>
                  <BaseText style={styles.summaryText}>{businessName}</BaseText>
                </View>
                <BaseButton
                  title={t(T.AUTH_SEND_OTP)}
                  onPress={onSendOtp}
                  loading={isLoading}
                />
                <Pressable onPress={() => setStep(1)}>
                  <BaseText style={styles.changeText}>Back</BaseText>
                </Pressable>
              </>
            )}
            {step === 3 && (
              <>
                <View style={styles.summaryCard}>
                  <BaseText style={styles.summaryText}>{`+91 ${phone}`}</BaseText>
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
                <BaseInput
                  label="Create PIN (4–8 digits)"
                  value={pin}
                  onChangeText={value => {
                    setPin(value);
                    if (pinError) setPinError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={8}
                  placeholder="Enter PIN"
                  error={pinError}
                />
                <View style={styles.actionRow}>
                  <BaseButton
                    title={resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                    onPress={onResendOtp}
                    disabled={resendCooldown > 0 || isLoading}
                    style={styles.secondaryBtn}
                  />
                  <BaseButton
                    title={t(T.AUTH_VERIFY_CONTINUE)}
                    onPress={onVerifyAndCreateAccount}
                    loading={isLoading}
                    disabled={otp.length < 6 || pin.length < 4}
                    style={styles.primaryBtn}
                  />
                </View>
                <Pressable onPress={() => setStep(2)}>
                  <BaseText style={styles.changeText}>Back</BaseText>
                </Pressable>
              </>
            )}

            <Pressable style={styles.singleLinkWrap} onPress={() => navigation.navigate('Login')}>
              <BaseText style={styles.linkRight}>Already have an account? Login</BaseText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
