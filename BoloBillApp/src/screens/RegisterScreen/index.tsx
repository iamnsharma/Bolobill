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
  const register = useAuthStore(s => s.register);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);

  const [phone, setPhone] = useState(route?.params?.phone ?? '');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [nameError, setNameError] = useState('');
  const [businessNameError, setBusinessNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [pinError, setPinError] = useState('');
  const [apiError, setApiError] = useState('');

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

    if (!valid) {
      return;
    }
    setStep(2);
  };

  const onVerifyAndContinue = async () => {
    setApiError('');
    if (pin.trim().length < 4) {
      setPinError('PIN should be at least 4 digits');
      return;
    }
    setPinError('');
    try {
      await register({
        phone,
        name,
        businessName,
        pin,
        accountType: 'business',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
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
            <BaseText style={styles.title}>{t(T.AUTH_REGISTER_TITLE)}</BaseText>
            <BaseText style={styles.subtitle}>
              {step === 1
                ? 'Set up your business profile in two quick steps.'
                : 'Create a secure 6-digit PIN for your account.'}
            </BaseText>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={[styles.stepLine, step === 2 ? styles.stepLineActive : null]} />
              <View style={[styles.stepDot, step === 2 ? styles.stepDotActive : null]} />
            </View>
          </View>

          <View style={styles.formSection}>
            {apiError ? <BaseText style={styles.apiErrorText}>{apiError}</BaseText> : null}
            {step === 1 ? (
              <>
                <BaseInput
                  label="Full Name"
                  value={name}
                  onChangeText={value => {
                    setName(value);
                    if (nameError) {
                      setNameError('');
                    }
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
                    if (phoneError) {
                      setPhoneError('');
                    }
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
                    if (businessNameError) {
                      setBusinessNameError('');
                    }
                  }}
                  maxLength={60}
                  placeholder="e.g. Sharma Kirana - Jaipur Branch"
                  error={businessNameError}
                />
                <BaseButton
                  title="Continue"
                  onPress={onContinueDetails}
                  disabled={
                    phone.length < 10 || name.trim().length < 2 || businessName.trim().length < 2
                  }
                />
              </>
            ) : (
              <>
                <View style={styles.summaryCard}>
                  <BaseText style={styles.summaryText}>{`+91 ${phone}`}</BaseText>
                  <BaseText style={styles.summaryText}>{name}</BaseText>
                  <BaseText style={styles.summaryText}>{businessName}</BaseText>
                </View>
                <BaseInput
                  label="Create 6-digit PIN"
                  value={pin}
                  onChangeText={value => {
                    setPin(value);
                    if (pinError) {
                      setPinError('');
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="Enter PIN"
                  error={pinError}
                />
                <View style={styles.actionRow}>
                  <BaseButton title="Back" onPress={() => setStep(1)} style={styles.secondaryBtn} />
                  <BaseButton
                    title={t(T.AUTH_VERIFY_CONTINUE)}
                    onPress={onVerifyAndContinue}
                    loading={isLoading}
                    disabled={pin.length < 4}
                    style={styles.primaryBtn}
                  />
                </View>
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
