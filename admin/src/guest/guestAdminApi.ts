import type {
  AdminInvoice,
  AdminUser,
  AddressBookContact,
  CreditAccountSummary,
  CreditLedgerEntry,
  InvoicePaymentMode,
  ItemSold,
  MenuImportAnalyzeResponse,
  MenuImportCommitProduct,
  MenuImportMatchRow,
  OosImportPreviewResponse,
  OosImportMatchRow,
  OutOfStockItem,
  SalesSummary,
  StockCategory,
  StockProduct,
} from '../api/admin';
import {
  hashGuestInventoryPin,
  loadGuestState,
  newGuestId,
  updateGuestState,
  verifyGuestInventoryPin,
} from './guestStore';

const GUEST_ERR = (feature: string) =>
  Promise.reject(new Error(`${feature} is not available in guest preview.`));

function requireState() {
  const s = loadGuestState();
  if (!s) throw new Error('Guest data missing. Try exiting and re-entering guest mode.');
  return s;
}

function parseDate(s: string): Date {
  return new Date(s);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function computeSalesSummary(
  invoices: AdminInvoice[],
  from?: string,
  to?: string,
  hidden?: boolean,
): SalesSummary {
  const mask = (n: number) => (hidden ? null : n);
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const sumInRange = (start: Date, end?: Date) => {
    let t = 0;
    for (const inv of invoices) {
      const created = parseDate(inv.createdAt);
      if (created < start) continue;
      if (end && created >= end) continue;
      t += inv.total ?? 0;
    }
    return t;
  };

  let filtered: number | null = null;
  if (from || to) {
    const fromD = from ? startOfDay(parseDate(from)) : new Date(0);
    const toD = to ? startOfDay(parseDate(to)) : new Date(8640000000000000);
    toD.setDate(toD.getDate() + 1);
    filtered = sumInRange(fromD, toD);
  }

  const total = invoices.reduce((a, i) => a + (i.total ?? 0), 0);

  return {
    total: mask(total),
    today: mask(sumInRange(todayStart)),
    thisWeek: mask(sumInRange(weekStart)),
    thisMonth: mask(sumInRange(monthStart)),
    thisYear: mask(sumInRange(yearStart)),
    filteredTotal: filtered == null ? null : hidden ? null : filtered,
    financeRedacted: hidden,
  };
}

function demoUserFromState(): AdminUser {
  const s = requireState();
  return {
    id: s.user.id,
    name: s.user.name,
    phone: s.user.phone,
    businessName: s.user.businessName,
    accountType: 'business',
    role: 'merchant',
    financeReportsHidden: s.financeReportsHidden,
    hasInventoryPin: Boolean(s.inventoryPinHash),
    isBlacklisted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function paginate<T>(items: T[], page = 1, limit = 20) {
  const p = Math.max(1, page);
  const l = Math.max(1, limit);
  const start = (p - 1) * l;
  const slice = items.slice(start, start + l);
  return {
    items: slice,
    total: items.length,
    page: p,
    limit: l,
    totalPages: Math.max(1, Math.ceil(items.length / l)),
  };
}

const DEMO_MENU_ANALYZE: MenuImportAnalyzeResponse = {
  summary: { found: 3, newCount: 3, existsCount: 0 },
  categories: [
    { tempId: 'dc1', name: 'Demo imports', sortOrder: 0 },
  ],
  items: [
    {
      tempId: 'di1',
      categoryTempId: 'dc1',
      name: 'Demo Masala Dosa',
      unit: 'plate',
      unitPrice: 80,
      lowStockThreshold: null,
      duplicateStatus: 'new',
      matchedProductId: null,
      matchedProductName: null,
    },
    {
      tempId: 'di2',
      categoryTempId: 'dc1',
      name: 'Demo Filter Coffee',
      unit: 'cup',
      unitPrice: 25,
      lowStockThreshold: null,
      duplicateStatus: 'new',
      matchedProductId: null,
      matchedProductName: null,
    },
    {
      tempId: 'di3',
      categoryTempId: 'dc1',
      name: 'Demo Veg Thali',
      unit: 'plate',
      unitPrice: 120,
      lowStockThreshold: null,
      duplicateStatus: 'new',
      matchedProductId: null,
      matchedProductName: null,
    },
  ],
};

const DEMO_OOS_ANALYZE: OosImportPreviewResponse = {
  summary: { found: 2, newCount: 2, existsCount: 0 },
  items: [
    {
      tempId: 'oo1',
      name: 'Demo — Turmeric powder',
      quantity: '5 kg',
      note: 'Demo AI result',
      duplicateStatus: 'new',
      matchedItemId: null,
      matchedItemName: null,
    },
    {
      tempId: 'oo2',
      name: 'Demo — Dish soap',
      quantity: '10 pcs',
      note: '',
      duplicateStatus: 'new',
      matchedItemId: null,
      matchedItemName: null,
    },
  ],
};

export const guestAdminApi = {
  getMe: async () => ({
    user: demoUserFromState(),
    isSuperAdmin: false,
  }),

  patchFinanceReports: async (body: { hidden: boolean; inventoryPin?: string }) => {
    const s = requireState();
    if (body.hidden) {
      let hash = s.inventoryPinHash;
      if (body.inventoryPin?.trim()) {
        hash = await hashGuestInventoryPin(body.inventoryPin);
      }
      updateGuestState((st) => {
        st.financeReportsHidden = true;
        if (hash) st.inventoryPinHash = hash;
      });
    } else {
      const ok = await verifyGuestInventoryPin(body.inventoryPin ?? '', s.inventoryPinHash);
      if (!ok) {
        throw Object.assign(new Error('Invalid inventory PIN'), {
          response: { data: { message: 'Invalid inventory PIN' } },
        });
      }
      updateGuestState((st) => {
        st.financeReportsHidden = false;
      });
    }
    const next = requireState();
    return {
      financeReportsHidden: next.financeReportsHidden,
      hasInventoryPin: Boolean(next.inventoryPinHash),
    };
  },

  getSalesSummary: async (params?: { from?: string; to?: string }) => {
    const s = requireState();
    return computeSalesSummary(s.invoices, params?.from, params?.to, s.financeReportsHidden);
  },

  getSalesSummaryDaily: async (params: { from: string; to: string }) => {
    const s = requireState();
    const hidden = s.financeReportsHidden;
    const fromD = startOfDay(parseDate(params.from));
    const toD = startOfDay(parseDate(params.to));
    toD.setDate(toD.getDate() + 1);
    const map = new Map<string, number>();
    for (const inv of s.invoices) {
      const created = parseDate(inv.createdAt);
      if (created < fromD || created >= toD) continue;
      const key = created.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + (inv.total ?? 0));
    }
    const daily = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total: hidden ? 0 : total }));
    return { daily };
  },

  getItemsSold: async (params?: { from?: string; to?: string }) => {
    const s = requireState();
    const hidden = s.financeReportsHidden;
    const fromD = params?.from ? startOfDay(parseDate(params.from)) : null;
    const toD = params?.to ? startOfDay(parseDate(params.to)) : null;
    if (toD) toD.setDate(toD.getDate() + 1);
    const agg = new Map<string, { quantity: number; amount: number }>();
    for (const inv of s.invoices) {
      const created = parseDate(inv.createdAt);
      if (fromD && created < fromD) continue;
      if (toD && created >= toD) continue;
      for (const line of inv.items) {
        const q = Number.parseFloat(String(line.quantity)) || 1;
        const cur = agg.get(line.name) ?? { quantity: 0, amount: 0 };
        cur.quantity += q;
        cur.amount += line.totalPrice;
        agg.set(line.name, cur);
      }
    }
    const items: ItemSold[] = Array.from(agg.entries()).map(([itemName, v]) => ({
      itemName,
      quantity: v.quantity,
      amount: hidden ? null : v.amount,
    }));
    return { items };
  },

  getStockSummary: async () => {
    const s = requireState();
    const hidden = s.financeReportsHidden;
    let inventoryValue = 0;
    let lowStockCount = 0;
    for (const p of s.stockProducts) {
      inventoryValue += p.unitPrice * p.quantityOnHand;
      if (p.lowStockThreshold != null && p.quantityOnHand <= p.lowStockThreshold) {
        lowStockCount += 1;
      }
    }
    return {
      totalProducts: s.stockProducts.length,
      totalCategories: s.stockCategories.length,
      inventoryValue: hidden ? 0 : inventoryValue,
      lowStockCount,
    };
  },

  listStockCategories: async () => {
    const s = requireState();
    return [...s.stockCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },

  createStockCategory: async (body: { name: string; sortOrder?: number }) => {
    const cat: StockCategory = {
      _id: newGuestId('cat'),
      name: body.name.trim(),
      sortOrder: body.sortOrder ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateGuestState((st) => {
      st.stockCategories.push(cat);
    });
    return cat;
  },

  deleteStockCategory: async (id: string) => {
    updateGuestState((st) => {
      st.stockCategories = st.stockCategories.filter((c) => c._id !== id);
      st.stockProducts = st.stockProducts.filter((p) => {
        const cid =
          typeof p.categoryId === 'object' && p.categoryId ? p.categoryId._id : p.categoryId;
        return cid !== id;
      });
    });
    return {};
  },

  listStockProducts: async (params?: { q?: string; categoryId?: string; page?: number; limit?: number }) => {
    const s = requireState();
    let list = [...s.stockProducts];
    if (params?.categoryId) {
      list = list.filter((p) => {
        const cid =
          typeof p.categoryId === 'object' && p.categoryId ? p.categoryId._id : p.categoryId;
        return cid === params.categoryId;
      });
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    const { items, total, page, limit, totalPages } = paginate(
      list,
      params?.page ?? 1,
      params?.limit ?? 100,
    );
    return { products: items, total, page, limit, totalPages };
  },

  createStockProduct: async (body: {
    categoryId?: string;
    categoryName?: string;
    name: string;
    unit: string;
    unitPrice: number;
    quantityOnHand: number;
    lowStockThreshold?: number;
  }) => {
    const s = requireState();
    let cat = s.stockCategories.find((c) => c._id === body.categoryId);
    if (!cat && body.categoryName) {
      cat = s.stockCategories.find((c) => c.name === body.categoryName);
    }
    const product: StockProduct = {
      _id: newGuestId('prod'),
      name: body.name.trim(),
      unit: body.unit,
      unitPrice: body.unitPrice,
      quantityOnHand: body.quantityOnHand,
      lowStockThreshold: body.lowStockThreshold ?? null,
      categoryId: cat ? { _id: cat._id, name: cat.name } : body.categoryId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateGuestState((st) => {
      st.stockProducts.push(product);
    });
    return product;
  },

  bulkCreateStockProducts: async (body: {
    products: {
      categoryId?: string;
      categoryName?: string;
      name: string;
      unit: string;
      unitPrice: number;
      quantityOnHand: number;
      lowStockThreshold?: number;
    }[];
  }) => {
    const created: StockProduct[] = [];
    for (const p of body.products) {
      created.push(await guestAdminApi.createStockProduct(p));
    }
    return created;
  },

  updateStockProduct: async (
    id: string,
    body: {
      categoryId?: string;
      categoryName?: string;
      name?: string;
      unit?: string;
      unitPrice?: number;
      quantityOnHand?: number;
      lowStockThreshold?: number | null;
    },
  ) => {
    let updated: StockProduct | null = null;
    updateGuestState((st) => {
      const idx = st.stockProducts.findIndex((p) => p._id === id);
      if (idx < 0) return;
      const prev = st.stockProducts[idx];
      let catRef = prev.categoryId;
      if (body.categoryId) {
        const cat = st.stockCategories.find((c) => c._id === body.categoryId);
        catRef = cat ? { _id: cat._id, name: cat.name } : body.categoryId;
      } else if (body.categoryName) {
        const cat = st.stockCategories.find((c) => c.name === body.categoryName);
        if (cat) catRef = { _id: cat._id, name: cat.name };
      }
      updated = {
        ...prev,
        name: body.name ?? prev.name,
        unit: body.unit ?? prev.unit,
        unitPrice: body.unitPrice ?? prev.unitPrice,
        quantityOnHand: body.quantityOnHand ?? prev.quantityOnHand,
        lowStockThreshold:
          body.lowStockThreshold !== undefined ? body.lowStockThreshold : prev.lowStockThreshold,
        categoryId: catRef,
        updatedAt: new Date().toISOString(),
      };
      st.stockProducts[idx] = updated;
    });
    if (!updated) throw new Error('Product not found');
    return updated;
  },

  adjustStockProduct: async (body: { productId: string; delta: number }) => {
    let product: StockProduct | null = null;
    updateGuestState((st) => {
      const idx = st.stockProducts.findIndex((p) => p._id === body.productId);
      if (idx < 0) return;
      const next = {
        ...st.stockProducts[idx],
        quantityOnHand: Math.max(0, st.stockProducts[idx].quantityOnHand + body.delta),
        updatedAt: new Date().toISOString(),
      };
      st.stockProducts[idx] = next;
      product = next;
    });
    if (!product) throw new Error('Product not found');
    return product;
  },

  getInvoices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    from?: string;
    to?: string;
  }) => {
    const s = requireState();
    let list = [...s.invoices].sort(
      (a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime(),
    );
    if (params?.search?.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.invoiceId.toLowerCase().includes(q) ||
          i.customerName.toLowerCase().includes(q) ||
          (i.customerPhone ?? '').includes(q),
      );
    }
    if (params?.from) {
      const fromD = startOfDay(parseDate(params.from));
      list = list.filter((i) => parseDate(i.createdAt) >= fromD);
    }
    if (params?.to) {
      const toD = startOfDay(parseDate(params.to));
      toD.setDate(toD.getDate() + 1);
      list = list.filter((i) => parseDate(i.createdAt) < toD);
    }
    const { items, total, page, limit, totalPages } = paginate(list, params?.page, params?.limit);
    return { invoices: items, total, page, limit, totalPages };
  },

  createInvoice: async (body: {
    customerName?: string;
    items: Array<{
      name: string;
      quantity: string | number;
      totalPrice: number;
      productId?: string;
      quantityNumeric?: number;
    }>;
    paymentMode?: InvoicePaymentMode;
    customerPhone?: string;
  }) => {
    const s = requireState();
    const total = body.items.reduce((a, i) => a + i.totalPrice, 0);
    const seq = s.invoiceSeq;
    const publicToken = newGuestId('tok');
    const invoice: AdminInvoice = {
      id: newGuestId('inv'),
      invoiceId: `INV-G${seq}`,
      customerName: body.customerName?.trim() || 'Customer',
      customerPhone: body.customerPhone,
      paymentMode: body.paymentMode ?? 'cash',
      items: body.items.map((i) => ({
        name: i.name,
        quantity: String(i.quantity),
        totalPrice: i.totalPrice,
      })),
      total,
      voiceTranscript: '',
      pdfUrl: '',
      publicToken,
      publicBillUrl: `/bill/${publicToken}`,
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: s.user.id,
        name: s.user.name,
        phone: s.user.phone,
        businessName: s.user.businessName,
      },
    };

    updateGuestState((st) => {
      st.invoiceSeq += 1;
      st.invoices.push(invoice);
      for (const line of body.items) {
        if (!line.productId) continue;
        const idx = st.stockProducts.findIndex((p) => p._id === line.productId);
        if (idx < 0) continue;
        const delta = line.quantityNumeric ?? (Number.parseFloat(String(line.quantity)) || 1);
        st.stockProducts[idx].quantityOnHand = Math.max(
          0,
          st.stockProducts[idx].quantityOnHand - delta,
        );
      }
      if (body.paymentMode === 'credit' && body.customerPhone) {
        const phone = body.customerPhone.replace(/\D/g, '').slice(-10);
        const name = body.customerName?.trim() || 'Customer';
        let acc = st.creditAccounts.find((a) => a.phone === phone);
        if (!acc) {
          acc = {
            phone,
            customerName: name,
            totalCredited: 0,
            totalPaid: 0,
            pendingBalance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          st.creditAccounts.push(acc);
        }
        acc.totalCredited = (acc.totalCredited ?? 0) + total;
        acc.pendingBalance = (acc.pendingBalance ?? 0) + total;
        acc.lastActivityAt = new Date().toISOString();
        acc.customerName = name;
        const ledger = st.creditLedgerByPhone[phone] ?? [];
        ledger.unshift({
          id: newGuestId('gl'),
          type: 'sale',
          amount: total,
          invoiceId: invoice.id,
          invoicePublicId: invoice.invoiceId,
          note: 'Credit sale',
          createdAt: invoice.createdAt,
        });
        st.creditLedgerByPhone[phone] = ledger;
        const ab = st.addressBookContacts.find((c) => c.phone === phone);
        if (!ab) {
          st.addressBookContacts.push({
            id: newGuestId('ab'),
            phone,
            name,
            updatedAt: new Date().toISOString(),
          });
        } else {
          ab.name = name;
          ab.updatedAt = new Date().toISOString();
        }
      }
    });

    return invoice;
  },

  getInvoiceById: async (id: string) => {
    const s = requireState();
    const inv = s.invoices.find((i) => i.id === id || i.invoiceId === id);
    if (!inv) throw new Error('Invoice not found');
    return inv;
  },

  previewVoiceInvoice: () => GUEST_ERR('Voice billing'),
  createFromVoicePreview: () => GUEST_ERR('Voice billing'),
  createVoiceInvoice: () => GUEST_ERR('Voice billing'),
  intakeStockFromVoice: () => GUEST_ERR('Voice stock intake'),
  createOutOfStockFromVoice: () => GUEST_ERR('Voice out-of-stock'),

  listOutOfStock: async () => {
    const s = requireState();
    return { items: [...s.outOfStockItems] };
  },

  createOutOfStock: async (body: { name: string; quantity?: string; note?: string }) => {
    const item: OutOfStockItem = {
      _id: newGuestId('oos'),
      name: body.name.trim(),
      quantity: body.quantity ?? '',
      note: body.note ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateGuestState((st) => {
      st.outOfStockItems.unshift(item);
    });
    return item;
  },

  updateOutOfStock: async (id: string, body: { name?: string; quantity?: string; note?: string }) => {
    let item: OutOfStockItem | null = null;
    updateGuestState((st) => {
      const idx = st.outOfStockItems.findIndex((o) => o._id === id);
      if (idx < 0) return;
      item = {
        ...st.outOfStockItems[idx],
        name: body.name ?? st.outOfStockItems[idx].name,
        quantity: body.quantity ?? st.outOfStockItems[idx].quantity,
        note: body.note ?? st.outOfStockItems[idx].note,
        updatedAt: new Date().toISOString(),
      };
      st.outOfStockItems[idx] = item;
    });
    if (!item) throw new Error('Item not found');
    return item;
  },

  deleteOutOfStock: async (id: string) => {
    updateGuestState((st) => {
      st.outOfStockItems = st.outOfStockItems.filter((o) => o._id !== id);
    });
    return {};
  },

  getQrCode: async () => {
    const s = requireState();
    return { url: s.qrCodeUrl };
  },

  deleteQrCode: async () => {
    updateGuestState((st) => {
      st.qrCodeUrl = null;
    });
    return {};
  },

  uploadQrCode: async () => {
    updateGuestState((st) => {
      st.qrCodeUrl = '/app-icon.png';
    });
    return { url: '/app-icon.png' };
  },

  getAiVisionDemoPinStatus: async () => ({ required: false }),

  verifyAiVisionDemoPin: async () => ({ ok: true, required: false }),

  analyzeMenuImport: async () => DEMO_MENU_ANALYZE,

  matchMenuImportItems: async (body: { items: { tempId: string; name: string }[] }) => {
    const s = requireState();
    const matches: MenuImportMatchRow[] = body.items.map((item) => {
      const existing = s.stockProducts.find(
        (p) => p.name.toLowerCase() === item.name.toLowerCase(),
      );
      return {
        tempId: item.tempId,
        duplicateStatus: existing ? 'exists' : 'new',
        matchedProductId: existing?._id ?? null,
        matchedProductName: existing?.name ?? null,
      };
    });
    return matches;
  },

  commitMenuImport: async (body: { products: MenuImportCommitProduct[] }) => {
    const products: StockProduct[] = [];
    for (const p of body.products) {
      products.push(
        await guestAdminApi.createStockProduct({
          categoryName: p.categoryName,
          name: p.name,
          unit: p.unit,
          unitPrice: p.unitPrice,
          quantityOnHand: p.quantityOnHand,
          lowStockThreshold: p.lowStockThreshold,
        }),
      );
    }
    return {
      imported: products.length,
      skipped: 0,
      message: 'Imported in guest preview',
      products,
    };
  },

  parseStockImportFile: async () => DEMO_MENU_ANALYZE,

  parseStockImportPaste: async (body: { text: string }) => {
    const lines = body.text
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items = lines.map((line, i) => {
      const parts = line.split(/[,\t]/).map((x) => x.trim());
      const name = parts[0] || `Item ${i + 1}`;
      const price = Number.parseFloat(parts[1] ?? '') || 0;
      return {
        tempId: `paste_${i}`,
        categoryTempId: 'paste_cat',
        name,
        unit: parts[2] || 'pc',
        unitPrice: price,
        lowStockThreshold: null,
        duplicateStatus: 'new' as const,
        matchedProductId: null,
        matchedProductName: null,
      };
    });
    return {
      summary: { found: items.length, newCount: items.length, existsCount: 0 },
      categories: [{ tempId: 'paste_cat', name: 'Imported', sortOrder: 0 }],
      items,
    };
  },

  analyzeOosImport: async () => DEMO_OOS_ANALYZE,

  parseOosImportFile: async () => DEMO_OOS_ANALYZE,

  parseOosImportPaste: async (body: { text: string }) => {
    const lines = body.text
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const items = lines.map((line, i) => {
      const parts = line.split(/[,\t]/).map((x) => x.trim());
      return {
        tempId: `oos_paste_${i}`,
        name: parts[0] || `Item ${i + 1}`,
        quantity: parts[1] ?? '',
        note: parts[2] ?? '',
        duplicateStatus: 'new' as const,
        matchedItemId: null,
        matchedItemName: null,
      };
    });
    return {
      summary: { found: items.length, newCount: items.length, existsCount: 0 },
      items,
    };
  },

  matchOosImportItems: async (body: { items: { tempId: string; name: string }[] }) => {
    const s = requireState();
    const matches: OosImportMatchRow[] = body.items.map((item) => {
      const existing = s.outOfStockItems.find(
        (o) => o.name.toLowerCase() === item.name.toLowerCase(),
      );
      return {
        tempId: item.tempId,
        duplicateStatus: existing ? 'exists' : 'new',
        matchedItemId: existing?._id ?? null,
        matchedItemName: existing?.name ?? null,
      };
    });
    return matches;
  },

  commitOosImport: async (body: { items: { name: string; quantity?: string; note?: string }[] }) => {
    let imported = 0;
    for (const row of body.items) {
      await guestAdminApi.createOutOfStock(row);
      imported += 1;
    }
    return { imported, skipped: 0, message: 'Imported in guest preview' };
  },

  lookupAddressBookContact: async (phone: string) => {
    const s = requireState();
    const digits = phone.replace(/\D/g, '').slice(-10);
    const contact = s.addressBookContacts.find((c) => c.phone === digits);
    return contact ? { found: true, contact } : { found: false };
  },

  saveAddressBookContact: async (body: { phone: string; name: string }) => {
    const phone = body.phone.replace(/\D/g, '').slice(-10);
    let contact: AddressBookContact | null = null;
    updateGuestState((st) => {
      const idx = st.addressBookContacts.findIndex((c) => c.phone === phone);
      if (idx >= 0) {
        st.addressBookContacts[idx] = {
          ...st.addressBookContacts[idx],
          name: body.name.trim(),
          updatedAt: new Date().toISOString(),
        };
        contact = st.addressBookContacts[idx];
      } else {
        contact = {
          id: newGuestId('ab'),
          phone,
          name: body.name.trim(),
          updatedAt: new Date().toISOString(),
        };
        st.addressBookContacts.push(contact);
      }
    });
    return contact!;
  },

  listAddressBookContacts: async (params?: { q?: string; page?: number; limit?: number }) => {
    const s = requireState();
    let list = [...s.addressBookContacts];
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    const { items, total, page, limit, totalPages } = paginate(list, params?.page, params?.limit);
    return { contacts: items, total, page, limit, totalPages };
  },

  deleteAddressBookContact: async (id: string) => {
    updateGuestState((st) => {
      st.addressBookContacts = st.addressBookContacts.filter((c) => c.id !== id);
    });
    return {};
  },

  listCreditAccounts: async (params?: {
    q?: string;
    pendingOnly?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const s = requireState();
    const hidden = s.financeReportsHidden;
    let list = [...s.creditAccounts];
    if (params?.pendingOnly) {
      list = list.filter((a) => (a.pendingBalance ?? 0) > 0);
    }
    if (params?.q?.trim()) {
      const q = params.q.trim().toLowerCase();
      list = list.filter(
        (a) => a.customerName.toLowerCase().includes(q) || a.phone.includes(q),
      );
    }
    const { items, total, page, limit, totalPages } = paginate(list, params?.page, params?.limit);
    const accounts = items.map((a) =>
      hidden
        ? {
            ...a,
            totalCredited: null,
            totalPaid: null,
            pendingBalance: null,
            financeRedacted: true,
          }
        : a,
    );
    return { accounts, total, page, limit, totalPages, financeRedacted: hidden };
  },

  getCreditAccount: async (phone: string) => {
    const s = requireState();
    const hidden = s.financeReportsHidden;
    const digits = phone.replace(/\D/g, '').slice(-10);
    const account = s.creditAccounts.find((a) => a.phone === digits);
    if (!account) throw new Error('Credit account not found');
    const ledger = (s.creditLedgerByPhone[digits] ?? []).map((e) =>
      hidden
        ? { ...e, amount: null, financeRedacted: true }
        : e,
    );
    const invoices = s.invoices.filter(
      (i) => i.customerPhone === digits && i.paymentMode === 'credit',
    );
    return {
      account: hidden
        ? {
            ...account,
            totalCredited: null,
            totalPaid: null,
            pendingBalance: null,
            financeRedacted: true,
          }
        : account,
      ledger,
      invoices,
      financeRedacted: hidden,
    };
  },

  recordCreditPayment: async (phone: string, body: { amount: number; note?: string }) => {
    const digits = phone.replace(/\D/g, '').slice(-10);
    let account: CreditAccountSummary | null = null;
    let entry: CreditLedgerEntry | null = null;
    updateGuestState((st) => {
      const acc = st.creditAccounts.find((a) => a.phone === digits);
      if (!acc) return;
      const amt = body.amount;
      acc.totalPaid = (acc.totalPaid ?? 0) + amt;
      acc.pendingBalance = Math.max(0, (acc.pendingBalance ?? 0) - amt);
      acc.lastActivityAt = new Date().toISOString();
      entry = {
        id: newGuestId('gl'),
        type: 'payment',
        amount: amt,
        invoiceId: null,
        invoicePublicId: '',
        note: body.note ?? 'Payment',
        createdAt: new Date().toISOString(),
      };
      const ledger = st.creditLedgerByPhone[digits] ?? [];
      ledger.unshift(entry);
      st.creditLedgerByPhone[digits] = ledger;
      account = { ...acc };
    });
    if (!account || !entry) throw new Error('Credit account not found');
    return { account, entry };
  },
};
