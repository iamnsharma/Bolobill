import {ApiError} from '../../common/ApiError';
import {InvoiceModel} from '../../models/Invoice.model';
import {UserModel} from '../../models/User.model';
import type {UserDocument} from '../../models/User.model';

export const adminService = {
  async getStats() {
    const [totalInvoices, totalUsers, blacklistedUsers] = await Promise.all([
      InvoiceModel.countDocuments(),
      UserModel.countDocuments({role: {$ne: 'admin'}}),
      UserModel.countDocuments({role: {$ne: 'admin'}, isBlacklisted: true}),
    ]);
    return {
      totalInvoices,
      totalUsers,
      blacklistedUsers,
      activeMemberships: 0, // Not implemented yet
    };
  },

  async listUsers(params: { page?: number; limit?: number; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {role: {$ne: 'admin'}};
    if (params.search?.trim()) {
      const s = params.search.trim();
      filter.$or = [
        {name: new RegExp(s, 'i')},
        {phone: new RegExp(s, 'i')},
        {businessName: new RegExp(s, 'i')},
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(filter)
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUserById(id: string): Promise<UserDocument> {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async setBlacklist(userId: string, blacklisted: boolean) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {$set: {isBlacklisted: blacklisted}},
      {new: true},
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user;
  },

  async listInvoices(params: {
    page?: number;
    limit?: number;
    userId?: string;
    search?: string;
  }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (params.userId?.trim()) {
      filter.userId = params.userId.trim();
    }
    if (params.search?.trim()) {
      filter.$or = [
        {invoiceId: new RegExp(params.search.trim(), 'i')},
        {customerName: new RegExp(params.search.trim(), 'i')},
      ];
    }

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(filter)
        .populate('userId', 'name phone businessName')
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .lean(),
      InvoiceModel.countDocuments(filter),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getInvoiceById(id: string) {
    const invoice = await InvoiceModel.findById(id)
      .populate('userId', 'name phone businessName')
      .lean();
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }
    return invoice;
  },
};
