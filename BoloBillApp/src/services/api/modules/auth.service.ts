import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {RegisterPayload, VerifyOtpPayload, VerifyOtpResponse} from '../types/auth.types';

export const authService = {
  sendOtp: async (phone: string) => {
    const response = await privateClient.post<{message: string}>(ENDPOINTS.AUTH_SEND_OTP, {
      phone,
    });
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<VerifyOtpResponse> => {
    const response = await privateClient.post<VerifyOtpResponse>(
      ENDPOINTS.AUTH_REGISTER,
      payload,
    );
    return response.data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await privateClient.post<VerifyOtpResponse>(ENDPOINTS.AUTH_VERIFY_OTP, {
      phone: payload.phone,
      otp: payload.otp,
    });
    return response.data;
  },
};
