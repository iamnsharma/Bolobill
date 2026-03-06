import {VerifyOtpPayload, VerifyOtpResponse} from '../types/auth.types';

const wait = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const authService = {
  sendOtp: async () => {
    await wait(500);
    return {success: true};
  },
  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    await wait(700);

    return {
      token: `demo-token-${payload.phone}`,
      user: {
        id: `${Date.now()}`,
        phone: payload.phone,
        name: payload.name,
        accountType: payload.accountType,
      },
    };
  },
};
