export type SendOtpPayload = {
  phone: string;
  countryCode?: string;
};

export type VerifyOtpPayload = {
  phone: string;
  otp: string;
  name: string;
  accountType: 'business' | 'personal';
};

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  businessName?: string;
  membershipPlan?: 'Starter' | 'Growth' | 'Pro';
  invoiceCreditsLeft?: number;
  voiceMinutesLeft?: number;
  accountType: 'business' | 'personal';
};

export type RegisterPayload = {
  name: string;
  businessName?: string;
  phone: string;
  pin: string;
  accountType?: 'business' | 'personal';
};

export type RegisterWithOtpPayload = {
  phone: string;
  otp: string;
  name: string;
  businessName: string;
  pin: string;
};

export type LoginWithPinPayload = {
  phone: string;
  pin: string;
};

export type VerifyOtpResponse = {
  token: string;
  user: AuthUser;
};
