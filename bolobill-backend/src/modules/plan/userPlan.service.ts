import {UserModel} from '../../models/User.model';
import {ApiError} from '../../common/ApiError';
import {PlanDocument} from '../../models/Plan.model';

export const userPlanService = {
  /**
   * Returns the user's active plan if any, their usage, and remaining quotas.
   */
  async getUserLimits(userId: string) {
    const user = await UserModel.findById(userId).populate('subscription.planId');
    if (!user) throw new ApiError(404, 'User not found');

    const sub = user.subscription;
    const now = new Date();
    const isActive = sub?.status === 'active' && sub.expiresAt && sub.expiresAt > now;

    let invoiceLimit = 0;
    let voiceMinutesLimit = 0;
    let features: string[] = [];

    if (isActive && sub.planId) {
      const plan = sub.planId as unknown as PlanDocument;
      invoiceLimit = plan.invoiceLimit;
      voiceMinutesLimit = plan.voiceMinutesLimit;
      features = plan.features || [];
    } else {
      // Default limits for users without active subscriptions (or expired)
      invoiceLimit = 30; // 30 free invoices
      voiceMinutesLimit = 15; // 15 free voice minutes
    }

    const invoicesUsed = user.usage?.invoiceRequestSuccessCount || 0;
    const voiceSecondsUsed = user.usage?.voiceToTextSecondsUsed || 0;
    const voiceMinutesUsed = voiceSecondsUsed / 60;

    return {
      isActive,
      expiresAt: sub?.expiresAt,
      invoiceLimit,
      invoicesUsed,
      invoicesRemaining: Math.max(0, invoiceLimit - invoicesUsed),
      voiceMinutesLimit,
      voiceMinutesUsed,
      voiceSecondsRemaining: Math.max(0, (voiceMinutesLimit * 60) - voiceSecondsUsed),
      features,
    };
  },

  async enforceInvoiceLimit(userId: string) {
    const limits = await this.getUserLimits(userId);
    if (limits.invoicesRemaining <= 0) {
      throw new ApiError(403, 'Invoice limit reached. Please upgrade your plan.');
    }
  },

  async enforceVoiceLimit(userId: string, requestedDurationSec = 0) {
    const limits = await this.getUserLimits(userId);
    if (limits.voiceSecondsRemaining < requestedDurationSec) {
      throw new ApiError(403, 'Voice minutes limit reached. Please upgrade your plan.');
    }
  },
};
