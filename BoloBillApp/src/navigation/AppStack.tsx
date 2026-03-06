import React from 'react';
import {Image, Pressable, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootTabs} from './RootTabs';
import {AuthStack} from './AuthStack';
import {useAuthStore, useThemeStore} from '../stores';
import {SplashScreen} from '../screens/SplashScreen';
import {InvoicePreviewScreen} from '../screens/InvoicePreviewScreen';
import {InvoiceHistoryScreen} from '../screens/InvoiceHistoryScreen';
import {T} from '../lang/constants';
import backIcon from '../assets/icons/back.png';

const Stack = createNativeStackNavigator();

export const AppStack = () => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  const isBootstrapped = useAuthStore(s => s.isBootstrapped);

  if (!isBootstrapped) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="RootTabs" component={RootTabs} />
          <Stack.Screen
            name="InvoicePreview"
            component={InvoicePreviewScreen}
            options={({navigation}) => ({
              headerShown: true,
              title: t(T.INVOICE_PREVIEW_TITLE),
              headerStyle: {backgroundColor: theme.colors.surface},
              headerTintColor: theme.colors.textPrimary,
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerLeft: () => (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.backBtn}>
                  <Image
                    source={backIcon}
                    resizeMode="contain"
                    style={[
                      styles.backIcon,
                      {tintColor: theme.colors.textPrimary},
                    ]}
                  />
                </Pressable>
              ),
            })}
          />
          <Stack.Screen
            name="InvoiceHistory"
            component={InvoiceHistoryScreen}
            options={({navigation}) => ({
              headerShown: true,
              title: t(T.INVOICE_HISTORY_TITLE),
              headerStyle: {backgroundColor: theme.colors.surface},
              headerTintColor: theme.colors.textPrimary,
              headerShadowVisible: false,
              headerBackTitleVisible: false,
              // eslint-disable-next-line react/no-unstable-nested-components
              headerLeft: () => (
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.backBtn}>
                  <Image
                    source={backIcon}
                    resizeMode="contain"
                    style={[
                      styles.backIcon,
                      {tintColor: theme.colors.textPrimary},
                    ]}
                  />
                </Pressable>
              ),
            })}
          />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  backBtn: {paddingRight: 8},
  backIcon: {width: 18, height: 18},
});
