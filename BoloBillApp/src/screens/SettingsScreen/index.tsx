import React, {useMemo, useState} from 'react';
import {Alert, Pressable, ScrollView, Switch, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BaseButton, BaseInput, BaseText} from '../../components/atoms';
import {useAuthStore, useLanguageStore, useThemeStore} from '../../stores';
import {getStyles} from './style';
import {T} from '../../lang/constants';
import {useCreateFeedback} from '../../hooks/apiHooks';

export const SettingsScreen = () => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const isDark = useThemeStore(s => s.isDark);
  const setTheme = useThemeStore(s => s.setTheme);
  const language = useLanguageStore(s => s.language);
  const setLanguage = useLanguageStore(s => s.setLanguage);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const feedbackMutation = useCreateFeedback();
  const [profileType, setProfileType] = useState<'personal' | 'business'>(
    'business',
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const businessDisplayName = useMemo(
    () => user?.businessName?.trim() || user?.name?.trim() || 'Business',
    [user?.businessName, user?.name],
  );
  const businessInitial = useMemo(
    () => businessDisplayName.charAt(0).toUpperCase(),
    [businessDisplayName],
  );
  const languageOptions = useMemo(
    () => [
      {code: 'en' as const, label: 'English'},
      {code: 'hi' as const, label: 'हिंदी'},
      {code: 'pa' as const, label: 'ਪੰਜਾਬੀ'},
      {code: 'mwr' as const, label: 'मारवाड़ी'},
      {code: 'bgr' as const, label: 'बागड़ी'},
    ],
    [],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.walletHero}>
          <View style={styles.walletHeaderRow}>
            <BaseText style={styles.walletTitle}>Business Wallet</BaseText>
            <View style={styles.walletBadge}>
              <BaseText style={styles.walletBadgeText}>LIVE</BaseText>
            </View>
          </View>
          <BaseText style={styles.walletAmount}>Rs 0.00</BaseText>
          <BaseText style={styles.walletSubtitle}>
            Highlight area for credits, usage and billing controls.
          </BaseText>
        </View>

        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <BaseText style={styles.profileAvatarText}>
                {businessInitial}
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
            <View style={styles.profileFieldRow}>
              <BaseText style={styles.profileFieldLabel}>Business / Shop Name:</BaseText>
              <BaseText style={styles.profileFieldValue}>
                {businessDisplayName || '-'}
              </BaseText>
            </View>
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
          <Pressable
            onPress={() => setIsFeedbackOpen(value => !value)}
            style={styles.feedbackHeader}>
            <View style={styles.feedbackHeaderTextWrap}>
              <BaseText style={styles.sectionTitle}>Feedback & Feature Request</BaseText>
              <BaseText style={styles.helperText}>
                Send what you want to improve in BoloBill.
              </BaseText>
            </View>
            <BaseText style={styles.feedbackToggleText}>
              {isFeedbackOpen ? 'Close' : 'Open'}
            </BaseText>
          </Pressable>
          {isFeedbackOpen ? (
            <>
              <BaseInput
                value={feedbackMessage}
                onChangeText={setFeedbackMessage}
                placeholder="Write your message..."
                multiline
                numberOfLines={4}
                inputStyle={styles.feedbackInput}
                textAlignVertical="top"
                maxLength={2000}
              />
              <BaseButton
                title={feedbackMutation.isPending ? 'Sending...' : 'Send Feedback'}
                onPress={async () => {
                  const message = feedbackMessage.trim();
                  if (message.length < 5) {
                    Alert.alert('BoloBill', 'Please enter at least 5 characters.');
                    return;
                  }
                  try {
                    await feedbackMutation.mutateAsync({message});
                    setFeedbackMessage('');
                    setIsFeedbackOpen(false);
                    Alert.alert('BoloBill', 'Feedback sent successfully.');
                  } catch (error) {
                    const errMessage =
                      error instanceof Error ? error.message : 'Failed to submit feedback';
                    Alert.alert('BoloBill', errMessage);
                  }
                }}
                disabled={feedbackMutation.isPending}
              />
            </>
          ) : null}
        </View>

        <View style={styles.section}>
          <BaseButton title={t(T.AUTH_LOGOUT)} onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
