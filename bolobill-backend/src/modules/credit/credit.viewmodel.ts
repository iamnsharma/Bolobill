import type {CreditAccountDocument} from '../../models/CreditAccount.model';
import type {CreditLedgerEntryDocument} from '../../models/CreditLedgerEntry.model';

export const toCreditAccountVm = (account: CreditAccountDocument | Record<string, unknown>) => {
  const a = account as CreditAccountDocument;
  return {
    phone: a.phone,
    customerName: a.customerName,
    totalCredited: a.totalCredited,
    totalPaid: a.totalPaid,
    pendingBalance: a.pendingBalance,
    lastActivityAt: a.lastActivityAt,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
};

export const toCreditLedgerVm = (entry: CreditLedgerEntryDocument | Record<string, unknown>) => {
  const e = entry as CreditLedgerEntryDocument;
  return {
    id: e._id.toString(),
    type: e.type,
    amount: e.amount,
    invoiceId: e.invoiceId ? e.invoiceId.toString() : null,
    invoicePublicId: e.invoicePublicId || '',
    note: e.note || '',
    createdAt: e.createdAt,
  };
};
