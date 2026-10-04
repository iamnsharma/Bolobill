import mongoose, {type ClientSession} from 'mongoose';
import {ApiError} from '../../common/ApiError';
import {CreditAccountModel} from '../../models/CreditAccount.model';
import {CreditLedgerEntryModel} from '../../models/CreditLedgerEntry.model';
import {InvoiceModel} from '../../models/Invoice.model';
import {addressBookService, phoneForAddressBook} from '../address-book/addressBook.service';

export const creditService = {
  async applyCreditSale(
    input: {
      userId: string;
      phone: string;
      customerName: string;
      invoiceMongoId: string;
      invoicePublicId: string;
      amount: number;
    },
    session?: ClientSession,
  ) {
    const phone = phoneForAddressBook(input.phone);
    const amount = Math.round(input.amount * 100) / 100;
    if (amount <= 0) {
      throw new ApiError(400, 'Credit amount must be positive');
    }

    const name = input.customerName.trim() || 'Customer';
    const now = new Date();
    const userOid = new mongoose.Types.ObjectId(input.userId);
    const invoiceOid = new mongoose.Types.ObjectId(input.invoiceMongoId);

    let account = await CreditAccountModel.findOneAndUpdate(
      {userId: userOid, phone},
      {
        $set: {customerName: name, lastActivityAt: now},
        $inc: {
          totalCredited: amount,
          pendingBalance: amount,
        },
      },
      {new: true, upsert: true, session, runValidators: true},
    );

    if (!account) {
      throw new ApiError(500, 'Could not update credit account');
    }

    await CreditLedgerEntryModel.create(
      [
        {
          userId: userOid,
          accountId: account._id,
          type: 'sale',
          amount,
          invoiceId: invoiceOid,
          invoicePublicId: input.invoicePublicId,
          note: '',
        },
      ],
      session ? {session} : undefined,
    );

    await addressBookService.upsert(input.userId, phone, name);

    return account;
  },

  async listAccounts(
    userId: string,
    opts: {q?: string; pendingOnly?: boolean; page: number; limit: number},
  ) {
    const filter: Record<string, unknown> = {userId: new mongoose.Types.ObjectId(userId)};
    if (opts.pendingOnly !== false) {
      filter.pendingBalance = {$gt: 0};
    }
    const q = opts.q?.trim();
    if (q) {
      const digits = q.replace(/\D/g, '');
      if (digits.length >= 3) {
        filter.$or = [
          {phone: {$regex: digits}},
          {customerName: {$regex: q, $options: 'i'}},
        ];
      } else {
        filter.customerName = {$regex: q, $options: 'i'};
      }
    }
    const skip = (opts.page - 1) * opts.limit;
    const [accounts, total] = await Promise.all([
      CreditAccountModel.find(filter)
        .sort({pendingBalance: -1, lastActivityAt: -1})
        .skip(skip)
        .limit(opts.limit)
        .lean(),
      CreditAccountModel.countDocuments(filter),
    ]);
    return {
      accounts,
      total,
      page: opts.page,
      limit: opts.limit,
      totalPages: Math.max(1, Math.ceil(total / opts.limit)),
    };
  },

  async getAccountDetail(userId: string, rawPhone: string, ledgerLimit = 100) {
    const phone = phoneForAddressBook(rawPhone);
    const userOid = new mongoose.Types.ObjectId(userId);
    const account = await CreditAccountModel.findOne({userId: userOid, phone}).lean();
    if (!account) {
      throw new ApiError(404, 'No credit account for this phone number');
    }

    const [ledger, invoices] = await Promise.all([
      CreditLedgerEntryModel.find({accountId: account._id})
        .sort({createdAt: -1})
        .limit(ledgerLimit)
        .lean(),
      InvoiceModel.find({
        userId: userOid,
        customerPhone: phone,
        paymentMode: 'credit',
      })
        .sort({createdAt: -1})
        .limit(50)
        .lean(),
    ]);

    return {account, ledger, invoices};
  },

  async recordPayment(userId: string, rawPhone: string, amount: number, note?: string) {
    const phone = phoneForAddressBook(rawPhone);
    const payAmount = Math.round(amount * 100) / 100;
    if (payAmount <= 0) {
      throw new ApiError(400, 'Amount must be greater than zero');
    }

    const userOid = new mongoose.Types.ObjectId(userId);
    const account = await CreditAccountModel.findOne({userId: userOid, phone});
    if (!account) {
      throw new ApiError(404, 'No credit account for this phone number');
    }
    if (payAmount > account.pendingBalance) {
      throw new ApiError(
        400,
        `Payment cannot exceed pending balance (${account.pendingBalance})`,
      );
    }

    const now = new Date();
    account.totalPaid += payAmount;
    account.pendingBalance -= payAmount;
    account.lastActivityAt = now;
    await account.save();

    const entry = await CreditLedgerEntryModel.create({
      userId: userOid,
      accountId: account._id,
      type: 'payment',
      amount: payAmount,
      note: note?.trim() || '',
    });

    return {account, entry};
  },
};
