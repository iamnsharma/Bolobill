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
  accountType: 'business' | 'personal';
};

export type RegisterPayload = {
  name: string;
  phone: string;
  pin: string;
  accountType?: 'business' | 'personal';
};

export type VerifyOtpResponse = {
  token: string;
  user: AuthUser;
};
