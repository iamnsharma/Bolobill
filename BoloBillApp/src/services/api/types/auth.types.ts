export type SendOtpPayload = {
  phone: string;
  countryCode?: string;
};

export type VerifyOtpPayload = {
  phone: string;
  otp: string;
  name: string;
  accountType: 'business' | 'shop';
};

export type AuthUser = {
  id: string;
  phone: string;
  name: string;
  accountType: 'business' | 'shop';
};

export type VerifyOtpResponse = {
  token: string;
  user: AuthUser;
};
