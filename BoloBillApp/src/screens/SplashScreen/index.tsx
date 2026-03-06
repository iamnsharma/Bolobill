import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Image, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BaseText } from '../../components/atoms';
import { useThemeStore } from '../../stores';
import { getStyles } from './style';
import logoPng from '../../../appicons/android/playstore-icon.png';

export const SplashScreen = () => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const gradientPulse = useRef(new Animated.Value(0.2)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const logoOpacity = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientPulse, {
          toValue: 0.8,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(gradientPulse, {
          toValue: 0.2,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.94,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 0.8,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [gradientPulse, logoOpacity, logoScale]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        <LinearGradient
          colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.04)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.staticGradient}
        />
        <Animated.View style={[styles.animatedGradientLayer, {opacity: gradientPulse}]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.24)', 'rgba(0,0,0,0.12)']}
            start={{x: 1, y: 0}}
            end={{x: 0, y: 1}}
            style={styles.fill}
          />
        </Animated.View>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconWrap,
              {transform: [{scale: logoScale}], opacity: logoOpacity},
            ]}>
            {!logoLoadFailed ? (
              <Image
                source={logoPng}
                style={styles.icon}
                resizeMode="contain"
                onError={() => setLogoLoadFailed(true)}
              />
            ) : (
              <BaseText style={styles.fallbackLogoText}>B</BaseText>
            )}
          </Animated.View>
          <BaseText style={styles.title}>BoloBill</BaseText>
          <ActivityIndicator size="large" color={theme.colors.textPrimary} />
        </View>
      </View>
    </SafeAreaView>
  );
};
