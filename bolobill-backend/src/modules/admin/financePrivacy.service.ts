import bcrypt from 'bcryptjs';
import {ApiError} from '../../common/ApiError';
import {UserModel} from '../../models/User.model';

const pinLenOk = (pin: string) => pin.length >= 4 && pin.length <= 8;

export const financePrivacyService = {
  async getFinanceReportsHidden(userId: string): Promise<boolean> {
    const user = await UserModel.findById(userId).select('financeReportsHidden').lean();
    if (!user) return false;
    return Boolean(user.financeReportsHidden);
  },

  async verifyInventoryPin(userId: string, inventoryPin: string): Promise<void> {
    const user = await UserModel.findById(userId).select('inventoryPinHash');
    if (!user) throw new ApiError(404, 'User not found');
    if (!user.inventoryPinHash) {
      throw new ApiError(400, 'Inventory PIN is not set yet');
    }
    const ok = await bcrypt.compare(String(inventoryPin).trim(), user.inventoryPinHash);
    if (!ok) throw new ApiError(401, 'Invalid inventory PIN');
  },

  async updateFinanceReportsHidden(
    userId: string,
    hidden: boolean,
    inventoryPin?: string,
  ): Promise<{financeReportsHidden: boolean; hasInventoryPin: boolean}> {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const hasInventoryPin = Boolean(user.inventoryPinHash);

    if (hidden) {
      if (!hasInventoryPin) {
        const pin = String(inventoryPin ?? '').trim();
        if (!pinLenOk(pin)) {
          throw new ApiError(
            400,
            'Set a 4–8 character Inventory PIN before hiding revenue reports',
          );
        }
        user.inventoryPinHash = await bcrypt.hash(pin, 10);
        user.financeReportsHidden = true;
        await user.save();
        return {financeReportsHidden: true, hasInventoryPin: true};
      }
      user.financeReportsHidden = true;
      await user.save();
      return {financeReportsHidden: true, hasInventoryPin: true};
    }

    if (!hasInventoryPin) {
      throw new ApiError(400, 'Inventory PIN is not set');
    }
    const pin = String(inventoryPin ?? '').trim();
    if (!pinLenOk(pin)) {
      throw new ApiError(400, 'Inventory PIN is required to show revenue reports');
    }
    await this.verifyInventoryPin(userId, pin);
    user.financeReportsHidden = false;
    await user.save();
    return {financeReportsHidden: false, hasInventoryPin: true};
  },
};
