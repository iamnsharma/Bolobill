import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseButton, BaseInput, BaseText } from '../../components/atoms';
import { t } from '../../lang';
import { T } from '../../lang/constants';
import { useAuthStore, useThemeStore } from '../../stores';
import { getStyles } from './style';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, string>) => void;
  };
};

export const LoginScreen = ({ navigation }: Props) => {
  const theme = useThemeStore(s => s.theme);
  const sendOtp = useAuthStore(s => s.sendOtp);
  const loginWithOtp = useAuthStore(s => s.loginWithOtp);
  const isLoading = useAuthStore(s => s.isLoading);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const onSendOtp = async () => {
    await sendOtp(phone);
    setIsOtpSent(true);
  };

  const onLogin = async () => {
    await loginWithOtp({
      phone,
      otp,
      name: 'Business User',
      accountType: 'business',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.card}>
        <BaseText style={styles.title}>{t(T.AUTH_LOGIN_TITLE)}</BaseText>
        <BaseInput
          label={t(T.AUTH_PHONE)}
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          maxLength={10}
        />
        <BaseButton
          title={t(T.AUTH_SEND_OTP)}
          onPress={onSendOtp}
          loading={isLoading}
          disabled={phone.trim().length < 10}
        />
        {isOtpSent ? (
          <>
            <BaseInput
              label={t(T.AUTH_OTP)}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <BaseButton
              title={t(T.AUTH_LOGIN_TITLE)}
              onPress={onLogin}
              loading={isLoading}
              disabled={otp.trim().length < 4}
            />
          </>
        ) : null}
        <Pressable onPress={() => navigation.navigate('Register')}>
          <BaseText style={styles.link}>{t(T.AUTH_GO_REGISTER)}</BaseText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
