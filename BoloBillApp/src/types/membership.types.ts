/**
 * Membership plan identifiers.
 * Trial is launch offer; Starter/Growth/Pro are paid monthly plans.
 */
export enum MembershipPlanId {
  Trial = 'Trial',
  Starter = 'Starter',
  Growth = 'Growth',
  Pro = 'Pro',
}

/** Bill limits and trial constraints (single source of truth for billing logic). */
export const MembershipLimits = {
  TrialBills: 60,
  TrialDays: 3,
  StarterBillsPerMonth: 700,
  GrowthBillsPerMonth: 1600,
  ProBillsPerMonth: 2600,
} as const;

/** Monthly price in INR for paid plans. */
export const MembershipPriceRupees = {
  [MembershipPlanId.Starter]: 399,
  [MembershipPlanId.Growth]: 799,
  [MembershipPlanId.Pro]: 1299,
} as const;

/** Copy for membership UI (no hardcoded strings in components). */
export const MembershipCopy = {
  HeroBadge: 'Membership Plans',
  HeroTitle: 'Choose your business growth plan',
  HeroSubtitle:
    'Bill limits only. Your quota resets on your subscription renewal date each month.',
  TrialDescription:
    '3 Days OR 60 Bills (whichever earlier). All core billing features. After limit → billing stops.',
  StarterDescription:
    'Best for small kiryana / low usage. 700 bills per month (~20–25 bills/day).',
  GrowthDescription:
    'Typical Indian grocery shop. 1600 bills per month (~50 bills/day).',
  ProDescription:
    'For busy kiryana / medical / wholesale. 2600 bills per month (~80–90 bills/day).',
  BottomHint:
    'Need custom enterprise limits? Use Feedback in Settings and tell us your required daily volume.',
  CtaSubscribe: 'Subscribe',
  CtaUpgrade: 'Upgrade',
  CtaSelected: 'Selected',
  PricePerMonth: (rupees: number) => `₹${rupees} / month`,
  TrialPriceLabel: 'Free trial',
} as const;

export interface IMembershipPlanDisplay {
  id: MembershipPlanId;
  priceLabel: string;
  description: string;
  billsLimit: number;
  isTrial: boolean;
  trialDays?: number;
}

/** Paid plan IDs only (for subscription state, renewals). */
export const PAID_PLAN_IDS: readonly MembershipPlanId[] = [
  MembershipPlanId.Starter,
  MembershipPlanId.Growth,
  MembershipPlanId.Pro,
];

export function isPaidPlan(planId: MembershipPlanId): planId is MembershipPlanId.Starter | MembershipPlanId.Growth | MembershipPlanId.Pro {
  return PAID_PLAN_IDS.includes(planId);
}

/** Build plan display config from constants (no hardcoding). */
export function getMembershipPlansDisplay(): IMembershipPlanDisplay[] {
  return [
    {
      id: MembershipPlanId.Trial,
      priceLabel: MembershipCopy.TrialPriceLabel,
      description: MembershipCopy.TrialDescription,
      billsLimit: MembershipLimits.TrialBills,
      isTrial: true,
      trialDays: MembershipLimits.TrialDays,
    },
    {
      id: MembershipPlanId.Starter,
      priceLabel: MembershipCopy.PricePerMonth(MembershipPriceRupees[MembershipPlanId.Starter]),
      description: MembershipCopy.StarterDescription,
      billsLimit: MembershipLimits.StarterBillsPerMonth,
      isTrial: false,
    },
    {
      id: MembershipPlanId.Growth,
      priceLabel: MembershipCopy.PricePerMonth(MembershipPriceRupees[MembershipPlanId.Growth]),
      description: MembershipCopy.GrowthDescription,
      billsLimit: MembershipLimits.GrowthBillsPerMonth,
      isTrial: false,
    },
    {
      id: MembershipPlanId.Pro,
      priceLabel: MembershipCopy.PricePerMonth(MembershipPriceRupees[MembershipPlanId.Pro]),
      description: MembershipCopy.ProDescription,
      billsLimit: MembershipLimits.ProBillsPerMonth,
      isTrial: false,
    },
  ];
}
