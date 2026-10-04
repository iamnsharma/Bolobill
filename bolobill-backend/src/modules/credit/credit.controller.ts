import {Request, Response} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {ApiError} from '../../common/ApiError';
import type {AdminContext} from '../../middleware/admin.middleware';
import {financePrivacyService} from '../admin/financePrivacy.service';
import {
  redactCreditAccountVm,
  redactCreditLedgerVm,
  redactInvoiceVm,
} from '../../utils/financeRedact';
import {toAdminInvoiceVm} from '../admin/admin.viewmodel';
import {creditService} from './credit.service';
import {listCreditAccountsSchema, recordCreditPaymentSchema} from './credit.validation';
import {toCreditAccountVm, toCreditLedgerVm} from './credit.viewmodel';

const getAdminContext = (req: Request): AdminContext => {
  const ctx = (req as Request & {adminContext?: AdminContext}).adminContext;
  if (!ctx) throw new ApiError(403, 'Admin context required');
  return ctx;
};

const shouldRedactFinance = async (ctx: AdminContext) => {
  if (ctx.isSuperAdmin) return false;
  return financePrivacyService.getFinanceReportsHidden(ctx.userId);
};

export const creditController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const parsed = listCreditAccountsSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid query');
    }
    const result = await creditService.listAccounts(ctx.userId, {
      q: parsed.data.q,
      pendingOnly: parsed.data.pendingOnly,
      page: parsed.data.page,
      limit: parsed.data.limit,
    });
    const redact = await shouldRedactFinance(ctx);
    let accounts = result.accounts.map((a) => toCreditAccountVm(a));
    if (redact) {
      accounts = accounts.map((a) => redactCreditAccountVm(a));
    }
    return res.json({
      accounts,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      ...(redact ? {financeRedacted: true} : {}),
    });
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    const phoneParam = Array.isArray(req.params.phone) ? req.params.phone[0] : req.params.phone;
    if (!phoneParam) throw new ApiError(400, 'Phone is required');
    const detail = await creditService.getAccountDetail(ctx.userId, phoneParam);
    const redact = await shouldRedactFinance(ctx);

    let accountVm = toCreditAccountVm(detail.account);
    let ledgerVm = detail.ledger.map((e) => toCreditLedgerVm(e));
    let invoicesVm = detail.invoices.map((inv) =>
      toAdminInvoiceVm(inv as Parameters<typeof toAdminInvoiceVm>[0]),
    );

    if (redact) {
      accountVm = redactCreditAccountVm(accountVm);
      ledgerVm = ledgerVm.map((e) => redactCreditLedgerVm(e));
      invoicesVm = invoicesVm.map((inv) => redactInvoiceVm(inv));
    }

    return res.json({
      account: accountVm,
      ledger: ledgerVm,
      invoices: invoicesVm,
      ...(redact ? {financeRedacted: true} : {}),
    });
  }),

  recordPayment: asyncHandler(async (req: Request, res: Response) => {
    const ctx = getAdminContext(req);
    if (await shouldRedactFinance(ctx)) {
      throw new ApiError(403, 'Unlock finance reports to record payments');
    }
    const phoneParam = Array.isArray(req.params.phone) ? req.params.phone[0] : req.params.phone;
    if (!phoneParam) throw new ApiError(400, 'Phone is required');
    const parsed = recordCreditPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const {account, entry} = await creditService.recordPayment(
      ctx.userId,
      phoneParam,
      parsed.data.amount,
      parsed.data.note,
    );
    return res.status(201).json({
      account: toCreditAccountVm(account),
      entry: toCreditLedgerVm(entry),
    });
  }),
};
