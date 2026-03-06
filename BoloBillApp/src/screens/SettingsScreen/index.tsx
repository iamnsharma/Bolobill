import React, {useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, Switch, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BaseButton, BaseText} from '../../components/atoms';
import {useAuthStore, useLanguageStore, useThemeStore} from '../../stores';
import {getStyles} from './style';
import {T} from '../../lang/constants';

export const SettingsScreen = () => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const isDark = useThemeStore(s => s.isDark);
  const setTheme = useThemeStore(s => s.setTheme);
  const language = useLanguageStore(s => s.language);
  const setLanguage = useLanguageStore(s => s.setLanguage);
  const logout = useAuthStore(s => s.logout);
  const [profileType, setProfileType] = useState<'personal' | 'business'>(
    'business',
  );
  const styles = useMemo(() => getStyles(theme), [theme]);
  const languageOptions = useMemo(
    () => [
      {code: 'en' as const, label: 'English'},
      {code: 'hi' as const, label: 'Hindi'},
      {code: 'pa' as const, label: 'Punjabi'},
      {code: 'mwr' as const, label: 'Marwari'},
    ],
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <BaseText style={styles.profileAvatarText}>
                {profileType === 'personal' ? 'P' : 'B'}
              </BaseText>
            </View>
            <View style={styles.profileHeaderTextWrap}>
              <BaseText style={styles.sectionTitle}>
                {t(T.SETTINGS_PROFILE_MANAGEMENT)}
              </BaseText>
              <BaseText style={styles.helperText}>
                {t(T.SETTINGS_PROFILE_DESCRIPTION)}
              </BaseText>
            </View>
          </View>
          <View style={styles.profileToggleWrap}>
            <Pressable
              onPress={() => {
                Alert.alert('BoloBill', t(T.SETTINGS_PERSONAL_COMING_SOON));
              }}
              style={[
                styles.profileToggleItem,
                profileType === 'personal' ? styles.profileToggleActive : null,
              ]}>
              <BaseText
                style={[
                  styles.profileToggleText,
                  profileType === 'personal'
                    ? styles.profileToggleTextActive
                    : null,
                ]}>
                {t(T.AUTH_PERSONAL)}
              </BaseText>
            </Pressable>
            <Pressable
              onPress={() => setProfileType('business')}
              style={[
                styles.profileToggleItem,
                profileType === 'business' ? styles.profileToggleActive : null,
              ]}>
              <BaseText
                style={[
                  styles.profileToggleText,
                  profileType === 'business'
                    ? styles.profileToggleTextActive
                    : null,
                ]}>
                {t(T.AUTH_BUSINESS)}
              </BaseText>
            </Pressable>
          </View>
          <View style={styles.profileInfoCard}>
            <BaseText style={styles.profileInfoTitle}>
              {profileType === 'personal'
                ? t(T.SETTINGS_PERSONAL_PROFILE)
                : t(T.SETTINGS_BUSINESS_PROFILE)}
            </BaseText>
            <BaseText style={styles.profileInfoText}>
              {profileType === 'personal'
                ? t(T.SETTINGS_PERSONAL_PROFILE_DESC)
                : t(T.SETTINGS_BUSINESS_PROFILE_DESC)}
            </BaseText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderTextWrap}>
              <BaseText style={styles.sectionTitle}>{t(T.SETTINGS_THEME)}</BaseText>
              <BaseText style={styles.helperText}>
                {t(T.SETTINGS_THEME_DESCRIPTION)}
              </BaseText>
            </View>
            <Switch
              value={isDark}
              onValueChange={value => setTheme(value ? 'dark' : 'light')}
              thumbColor={theme.colors.surface}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
            />
          </View>
          <View style={styles.themePillRow}>
            <View
              style={[styles.themePill, !isDark ? styles.themePillActive : null]}>
              <BaseText
                style={[
                  styles.themePillText,
                  !isDark ? styles.themePillTextActive : null,
                ]}>
                {t(T.SETTINGS_LIGHT)}
              </BaseText>
            </View>
            <View style={[styles.themePill, isDark ? styles.themePillActive : null]}>
              <BaseText
                style={[
                  styles.themePillText,
                  isDark ? styles.themePillTextActive : null,
                ]}>
                {t(T.SETTINGS_DARK)}
              </BaseText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <BaseText style={styles.sectionTitle}>{t(T.SETTINGS_LANGUAGE)}</BaseText>
          <BaseText style={styles.helperText}>
            {t(T.COMMON_LANGUAGE_CURRENT)}: {language.toUpperCase()}
          </BaseText>
          <BaseText style={styles.helperText}>{t(T.SETTINGS_LANGUAGE_DESCRIPTION)}</BaseText>
          <View style={styles.languageTabs}>
            {languageOptions.map(option => (
              <Pressable
                key={option.code}
                onPress={() => setLanguage(option.code)}
                style={[
                  styles.languageTab,
                  language === option.code ? styles.languageTabActive : null,
                ]}>
                <BaseText
                  style={[
                    styles.languageTabText,
                    language === option.code ? styles.languageTabTextActive : null,
                  ]}>
                  {option.label}
                </BaseText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <BaseButton title={t(T.AUTH_LOGOUT)} onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
