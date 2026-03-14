import React, {useMemo, useState} from 'react';
import {Image, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BaseButton, BaseText} from '../../components/atoms';
import {useThemeStore} from '../../stores';
import {
  MembershipCopy,
  MembershipPlanId,
  getMembershipPlansDisplay,
  type IMembershipPlanDisplay,
} from '../../types/membership.types';
import {getStyles} from './style';
import crownIcon from '../../assets/icons/crown.png';
import starterIcon from '../../assets/icons/starter.png';
import growthIcon from '../../assets/icons/growth.png';
import proIcon from '../../assets/icons/pro.png';

const PLAN_ICON_MAP: Record<MembershipPlanId, number> = {
  [MembershipPlanId.Trial]: crownIcon,
  [MembershipPlanId.Starter]: starterIcon,
  [MembershipPlanId.Growth]: growthIcon,
  [MembershipPlanId.Pro]: proIcon,
};

export const MembershipScreen = () => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [activePlan, setActivePlan] = useState<MembershipPlanId | null>(null);
  const hasSubscription = Boolean(activePlan && activePlan !== MembershipPlanId.Trial);

  const plans: IMembershipPlanDisplay[] = useMemo(() => getMembershipPlansDisplay(), []);

  const getCtaTitle = (plan: IMembershipPlanDisplay, isActive: boolean): string => {
    if (isActive) return MembershipCopy.CtaSelected;
    if (plan.isTrial) return MembershipCopy.CtaSubscribe;
    if (hasSubscription) return MembershipCopy.CtaUpgrade;
    return MembershipCopy.CtaSubscribe;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Image source={crownIcon} style={styles.heroIcon} resizeMode="contain" />
            <BaseText style={styles.heroBadge}>{MembershipCopy.HeroBadge}</BaseText>
          </View>
          <BaseText style={styles.heroTitle}>{MembershipCopy.HeroTitle}</BaseText>
          <BaseText style={styles.heroSubtitle}>{MembershipCopy.HeroSubtitle}</BaseText>
        </View>

        {plans.map(plan => {
          const isActive = activePlan === plan.id;
          const icon = PLAN_ICON_MAP[plan.id];
          return (
            <View
              key={plan.id}
              style={[styles.planCard, isActive ? styles.planCardActive : null]}>
              <View style={styles.planRow}>
                <Image source={icon} style={styles.planIcon} resizeMode="contain" />
                <View style={styles.planTextWrap}>
                  <BaseText style={styles.planName}>{plan.id}</BaseText>
                  <BaseText style={styles.planPrice}>{plan.priceLabel}</BaseText>
                </View>
                <BaseButton
                  title={getCtaTitle(plan, isActive)}
                  onPress={() => setActivePlan(plan.id)}
                  style={styles.planBtn}
                />
              </View>
              <BaseText style={styles.planDescription}>{plan.description}</BaseText>
            </View>
          );
        })}

        <BaseText style={styles.bottomHint}>{MembershipCopy.BottomHint}</BaseText>
      </ScrollView>
    </SafeAreaView>
  );
};
