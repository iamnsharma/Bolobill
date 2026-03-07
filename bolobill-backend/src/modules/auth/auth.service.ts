import bcrypt from 'bcryptjs';
import {ApiError} from '../../common/ApiError';
import {signAuthToken} from '../../common/jwt';
import {UserModel} from '../../models/User.model';

export const STATIC_OTP = '123456';

export const authService = {
  async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async register(input: {
    name: string;
    phone: string;
    pin: string;
    accountType?: 'personal' | 'shop';
  }) {
    const existing = await UserModel.findOne({phone: input.phone});
    if (existing) {
      throw new ApiError(409, 'Phone already registered');
    }

    const pinHash = await bcrypt.hash(input.pin, 10);
    const user = await UserModel.create({
      name: input.name,
      phone: input.phone,
      pinHash,
      accountType: input.accountType ?? 'personal',
    });

    const token = signAuthToken({userId: user._id.toString(), phone: user.phone});
    return {token, user};
  },

  async login(input: {phone: string; pin: string}) {
    const user = await UserModel.findOne({phone: input.phone});
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isPinValid = await bcrypt.compare(input.pin, user.pinHash);
    if (!isPinValid) {
      throw new ApiError(401, 'Invalid PIN');
    }

    const token = signAuthToken({userId: user._id.toString(), phone: user.phone});
    return {token, user};
  },

  async requestOtp(phone: string) {
    const user = await UserModel.findOne({phone});
    if (!user) {
      throw new ApiError(404, 'User not found for this phone');
    }

    return {
      message: 'OTP sent (static for now)',
      otp: STATIC_OTP,
    };
  },

  async verifyOtp(phone: string, otp: string) {
    if (otp !== STATIC_OTP) {
      throw new ApiError(401, 'Invalid OTP');
    }

    const user = await UserModel.findOne({phone});
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const token = signAuthToken({userId: user._id.toString(), phone: user.phone});
    return {token, user};
  },

  async resetPin(input: {phone: string; otp: string; newPin: string}) {
    if (input.otp !== STATIC_OTP) {
      throw new ApiError(401, 'Invalid OTP');
    }

    const user = await UserModel.findOne({phone: input.phone});
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.pinHash = await bcrypt.hash(input.newPin, 10);
    await user.save();
    return {message: 'PIN reset successful'};
  },
};
