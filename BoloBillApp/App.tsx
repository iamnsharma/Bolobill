import React, {useEffect, useRef} from 'react';
import {Alert, BackHandler, Platform, StatusBar, StyleSheet} from 'react-native';
import {
  DarkTheme as NavigationDarkTheme,
  createNavigationContainerRef,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {QueryClientProvider} from '@tanstack/react-query';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppStack} from './src/navigation';
import {queryClient} from './src/services/api/core/queryClient';
import {T} from './src/lang/constants';
import {useAuthStore, useLanguageStore, useThemeStore} from './src/stores';
import './src/lang';

const navigationRef = createNavigationContainerRef();

function App() {
  const {t} = useTranslation();
  const isExitAlertVisible = useRef(false);
  const theme = useThemeStore(s => s.theme);
  const isDark = useThemeStore(s => s.isDark);
  const initializeTheme = useThemeStore(s => s.initializeTheme);
  const initializeLanguage = useLanguageStore(s => s.initializeLanguage);
  const initializeAuth = useAuthStore(s => s.initializeAuth);

  useEffect(() => {
    initializeTheme();
    initializeLanguage();
    initializeAuth();
  }, [initializeAuth, initializeLanguage, initializeTheme]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const showExitAlert = () => {
      if (isExitAlertVisible.current) {
        return true;
      }

      isExitAlertVisible.current = true;
      Alert.alert(
        t(T.COMMON_EXIT_APP_TITLE),
        t(T.COMMON_EXIT_APP_MESSAGE),
        [
          {
            text: t(T.COMMON_CANCEL),
            style: 'cancel',
            onPress: () => {
              isExitAlertVisible.current = false;
            },
          },
          {
            text: t(T.COMMON_EXIT_APP_CONFIRM),
            style: 'destructive',
            onPress: () => {
              isExitAlertVisible.current = false;
              BackHandler.exitApp();
            },
          },
        ],
      );
      return true;
    };

    const onHardwareBack = () => {
      if (!navigationRef.isReady()) {
        return showExitAlert();
      }

      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return showExitAlert();
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBack,
    );

    return () => subscription.remove();
  }, [t]);

  const navigationTheme = isDark
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }
    : {
        ...NavigationDefaultTheme,
        colors: {
          ...NavigationDefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      };

  return (
    <GestureHandlerRootView
      style={[styles.root, {backgroundColor: theme.colors.background}]}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef} theme={navigationTheme}>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.background}
              translucent={false}
            />
            <AppStack />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});

export default App;
