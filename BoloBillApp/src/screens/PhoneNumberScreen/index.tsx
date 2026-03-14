import React, { useMemo, useState } from 'react';
import {
  Image,
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
import appLogo from '../../assets/icons/bolobill-logo.png';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, string>) => void;
  };
};

export const PhoneNumberScreen = ({ navigation }: Props) => {
  const theme = useThemeStore(s => s.theme);
  const sendFirebaseOtp = useAuthStore(s => s.sendFirebaseOtp);
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');

  const onSendOtp = async () => {
    setApiError('');
    if (phone.trim().length !== 10) {
      setPhoneError('Enter a valid 10-digit phone number');
      return;
    }
    setPhoneError('');
    try {
      await sendFirebaseOtp(phone.trim());
      navigation.navigate('OTPScreen', {
        phone: `+91 ${phone.trim()}`,
        flow: 'login',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not send OTP';
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
            <View style={styles.logoWrap}>
              <Image
                source={appLogo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <BaseText style={styles.title}>{t(T.AUTH_LOGIN_TITLE)}</BaseText>
            <BaseText style={styles.subtitle}>
              Enter phone number to receive Firebase OTP.
            </BaseText>
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepDotActive]} />
              <View style={styles.stepLine} />
              <View style={styles.stepDot} />
            </View>
          </View>

          <View style={styles.formSection}>
            {apiError ? (
              <BaseText style={styles.apiErrorText}>{apiError}</BaseText>
            ) : null}
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
            <Pressable
              style={styles.singleLinkWrap}
              onPress={() => navigation.navigate('Register')}
            >
              <BaseText style={styles.linkRight}>New here? Register</BaseText>
            </Pressable>
            <Pressable style={styles.guestWrap} onPress={loginAsGuest}>
              <BaseText style={styles.guestLink}>
                Continue as Guest (Explore Only)
              </BaseText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
