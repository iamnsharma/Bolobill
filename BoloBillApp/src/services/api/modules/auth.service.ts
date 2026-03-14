import {privateClient} from '../clients/privateClient';
import {ENDPOINTS} from '../endpoints';
import {
  RegisterPayload,
  RegisterWithOtpPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  LoginWithPinPayload,
} from '../types/auth.types';

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

  registerWithOtp: async (payload: RegisterWithOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await privateClient.post<VerifyOtpResponse>(
      ENDPOINTS.AUTH_REGISTER_WITH_OTP,
      payload,
    );
    return response.data;
  },

  login: async (payload: LoginWithPinPayload): Promise<VerifyOtpResponse> => {
    const response = await privateClient.post<VerifyOtpResponse>(ENDPOINTS.AUTH_LOGIN, payload);
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
