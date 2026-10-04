type SalesSummaryLike = {
  total?: number;
  today?: number;
  thisWeek?: number;
  thisMonth?: number;
  thisYear?: number;
  filteredTotal?: number;
};

export function redactSalesSummary<T extends SalesSummaryLike>(summary: T): T {
  return {
    ...summary,
    total: null as unknown as number,
    today: null as unknown as number,
    thisWeek: null as unknown as number,
    thisMonth: null as unknown as number,
    thisYear: null as unknown as number,
    filteredTotal: null as unknown as number,
    financeRedacted: true,
  } as T & {financeRedacted: true};
}

export function redactDailySales(
  daily: Array<{date: string; total: number}>,
): Array<{date: string; total: number | null}> {
  return daily.map((row) => ({...row, total: null}));
}

export function redactStockSummary<T extends {inventoryValue: number}>(summary: T): T {
  return {
    ...summary,
    inventoryValue: null as unknown as number,
    financeRedacted: true,
  } as T & {financeRedacted: true};
}

export function redactItemsSold<T extends {amount: number}>(
  items: T[],
): Array<Omit<T, 'amount'> & {amount: number | null}> {
  return items.map((row) => ({...row, amount: null}));
}

type InvoiceItemLike = {totalPrice?: number; [key: string]: unknown};

export function redactInvoiceVm<T extends {total: number; items: unknown[]}>(invoice: T): T {
  const items = (invoice.items as InvoiceItemLike[]).map((it) => ({
    ...it,
    totalPrice: it.totalPrice != null ? null : it.totalPrice,
  }));
  return {
    ...invoice,
    total: null as unknown as number,
    items,
    financeRedacted: true,
  } as T & {financeRedacted: true};
}

type CreditAccountVmLike = {
  totalCredited: number;
  totalPaid: number;
  pendingBalance: number;
};

export function redactCreditAccountVm<T extends CreditAccountVmLike>(account: T): T {
  return {
    ...account,
    totalCredited: null as unknown as number,
    totalPaid: null as unknown as number,
    pendingBalance: null as unknown as number,
    financeRedacted: true,
  } as T & {financeRedacted: true};
}

export function redactCreditLedgerVm<T extends {amount: number}>(entry: T): T {
  return {
    ...entry,
    amount: null as unknown as number,
    financeRedacted: true,
  } as T & {financeRedacted: true};
}
