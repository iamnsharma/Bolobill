import React, {useMemo, useState} from 'react';
import {Alert, Image, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BaseButton, BaseText} from '../../components/atoms';
import {useThemeStore} from '../../stores';
import {getStyles} from './style';
import crownIcon from '../../assets/icons/crown.png';
import starterIcon from '../../assets/icons/starter.png';
import growthIcon from '../../assets/icons/growth.png';
import proIcon from '../../assets/icons/pro.png';

type PlanName = 'Starter' | 'Growth' | 'Pro';

const PLANS: Array<{
  id: PlanName;
  priceLabel: string;
  description: string;
  icon: number;
}> = [
  {
    id: 'Starter',
    priceLabel: 'Rs 199 / month',
    description:
      'Up to 200 invoices OR 200 voice-to-text minutes, whichever completes first.',
    icon: starterIcon,
  },
  {
    id: 'Growth',
    priceLabel: 'Rs 499 / month',
    description:
      'Up to 700 invoices OR 700 voice-to-text minutes, whichever completes first.',
    icon: growthIcon,
  },
  {
    id: 'Pro',
    priceLabel: 'Rs 999 / month',
    description:
      'Up to 2000 invoices OR 2000 voice-to-text minutes, whichever completes first.',
    icon: proIcon,
  },
];

export const MembershipScreen = () => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [activePlan, setActivePlan] = useState<PlanName | null>(null);
  const hasSubscription = Boolean(activePlan);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Image source={crownIcon} style={styles.heroIcon} resizeMode="contain" />
            <BaseText style={styles.heroBadge}>Membership Plans</BaseText>
          </View>
          <BaseText style={styles.heroTitle}>Choose your business growth plan</BaseText>
          <BaseText style={styles.heroSubtitle}>
            Voice minutes and invoice limits are bundled together. The first limit you complete
            ends the current cycle quota.
          </BaseText>
        </View>

        {PLANS.map(plan => {
          const isActive = activePlan === plan.id;
          return (
            <View
              key={plan.id}
              style={[styles.planCard, isActive ? styles.planCardActive : null]}>
              <View style={styles.planRow}>
                <Image source={plan.icon} style={styles.planIcon} resizeMode="contain" />
                <View style={styles.planTextWrap}>
                  <BaseText style={styles.planName}>{plan.id}</BaseText>
                  <BaseText style={styles.planPrice}>{plan.priceLabel}</BaseText>
                </View>
                <BaseButton
                  title={isActive ? 'Selected' : hasSubscription ? 'Upgrade' : 'Subscribe'}
                  onPress={() => setActivePlan(plan.id)}
                  style={styles.planBtn}
                />
              </View>
              <BaseText style={styles.planDescription}>{plan.description}</BaseText>
            </View>
          );
        })}

        <BaseText style={styles.bottomHint}>
          Need custom enterprise limits? Use Feedback in Settings and tell us your required daily
          volume.
        </BaseText>
      </ScrollView>
    </SafeAreaView>
  );
};
