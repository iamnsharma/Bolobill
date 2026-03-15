import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ApiError } from '../../common/ApiError';
import { PlanModel } from '../../models/Plan.model';
import { adminService } from '../admin/admin.service';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZOR_API_KEY;
  const key_secret = process.env.RAZOR_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new ApiError(500, 'Razorpay keys not configured in environment');
  }
  return new Razorpay({ key_id, key_secret });
};

export const paymentService = {
  async createOrder(userId: string, planId: string) {
    const plan = await PlanModel.findById(planId);
    if (!plan) throw new ApiError(404, 'Plan not found');
    if (!plan.isActive) throw new ApiError(400, 'Selected plan is not active');
    
    // Price usually in INR, razorpay expects it in paisa
    const amountInPaisa = Math.round((plan.price || 0) * 100);
    
    if (amountInPaisa === 0) {
      // Free plan assignment directly
      await adminService.assignPlan(userId, planId);
      return { isFree: true, message: 'Free plan assigned successfully' };
    }

    const rzp = getRazorpayInstance();
    const order = await rzp.orders.create({
      amount: amountInPaisa,
      currency: 'INR',
      receipt: `rcpt_${userId.substring(0, 10)}_${Date.now()}`,
      notes: {
        userId,
        planId
      }
    });
    
    return { 
      isFree: false, 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency, 
      keyId: process.env.RAZOR_API_KEY 
    };
  },

  async verifyPayment(userId: string, orderId: string, paymentId: string, signature: string, planId: string) {
    const key_secret = process.env.RAZOR_KEY_SECRET;
    if (!key_secret) throw new ApiError(500, 'Razorpay keys not configured');

    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new ApiError(400, 'Invalid payment signature');
    }

    // Payment verified, assign the plan
    // AdminService.assignPlan sets expiresAt to 30 days from now if we don't pass third param.
    await adminService.assignPlan(userId, planId);

    return { success: true, message: 'Payment verified and plan assigned' };
  }
};
