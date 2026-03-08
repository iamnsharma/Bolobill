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
  const [pin, setPin] = useState('');

  const onVerifyAndContinue = async () => {
    await register({
      phone,
      name,
      pin,
      accountType: 'business',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.card}>
        <BaseText style={styles.title}>{t(T.AUTH_REGISTER_TITLE)}</BaseText>
        <BaseInput
          label={t(T.AUTH_PHONE)}
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          maxLength={10}
        />
        <BaseInput
          label={t(T.AUTH_NAME)}
          value={name}
          onChangeText={setName}
          maxLength={40}
        />
        <BaseInput
          label={t(T.AUTH_OTP)}
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          maxLength={6}
        />

        <BaseButton
          title={t(T.AUTH_VERIFY_CONTINUE)}
          onPress={onVerifyAndContinue}
          loading={isLoading}
          disabled={
            phone.length < 10 || name.trim().length < 2 || pin.length < 4
          }
        />

        <Pressable onPress={() => navigation.navigate('Login')}>
          <BaseText style={styles.link}>{t(T.AUTH_GO_LOGIN)}</BaseText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
