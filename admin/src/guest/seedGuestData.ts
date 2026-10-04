import type { AdminInvoice } from '../api/admin';
import type { GuestState } from './guestStore';
import { GUEST_STATE_VERSION, newGuestId } from './guestStore';
import { DEFAULT_SHOP_SETTINGS } from '../contexts/ShopSettingsContext';

const DEMO_USER_ID = 'guest_demo_merchant';

function inv(
  partial: Omit<AdminInvoice, 'user'> & { user?: AdminInvoice['user'] },
): AdminInvoice {
  return {
    ...partial,
    user: partial.user ?? {
      id: DEMO_USER_ID,
      name: 'Ravi Kumar',
      phone: '9876543210',
      businessName: 'Demo Kirana & Café',
    },
  };
}

export function createSeedGuestState(): GuestState {
  const catGroceries = { _id: 'gc1', name: 'Groceries', sortOrder: 0 };
  const catBeverages = { _id: 'gc2', name: 'Beverages', sortOrder: 1 };
  const catSnacks = { _id: 'gc3', name: 'Snacks', sortOrder: 2 };

  const products = [
    {
      _id: 'gp1',
      name: 'Basmati Rice 1kg',
      unit: 'kg',
      unitPrice: 120,
      quantityOnHand: 45,
      lowStockThreshold: 10,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp2',
      name: 'Toor Dal 500g',
      unit: 'pkt',
      unitPrice: 85,
      quantityOnHand: 30,
      lowStockThreshold: 8,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp3',
      name: 'Sunflower Oil 1L',
      unit: 'btl',
      unitPrice: 165,
      quantityOnHand: 18,
      lowStockThreshold: 5,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp4',
      name: 'Sugar 1kg',
      unit: 'kg',
      unitPrice: 48,
      quantityOnHand: 22,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp5',
      name: 'Tea Masala',
      unit: 'pkt',
      unitPrice: 35,
      quantityOnHand: 40,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp6',
      name: 'Masala Chai',
      unit: 'cup',
      unitPrice: 20,
      quantityOnHand: 999,
      categoryId: { _id: catBeverages._id, name: catBeverages.name },
    },
    {
      _id: 'gp7',
      name: 'Cold Coffee',
      unit: 'glass',
      unitPrice: 60,
      quantityOnHand: 999,
      categoryId: { _id: catBeverages._id, name: catBeverages.name },
    },
    {
      _id: 'gp8',
      name: 'Lassi Sweet',
      unit: 'glass',
      unitPrice: 45,
      quantityOnHand: 999,
      categoryId: { _id: catBeverages._id, name: catBeverages.name },
    },
    {
      _id: 'gp9',
      name: 'Samosa',
      unit: 'pc',
      unitPrice: 15,
      quantityOnHand: 50,
      categoryId: { _id: catSnacks._id, name: catSnacks.name },
    },
    {
      _id: 'gp10',
      name: 'Veg Sandwich',
      unit: 'pc',
      unitPrice: 55,
      quantityOnHand: 20,
      categoryId: { _id: catSnacks._id, name: catSnacks.name },
    },
    {
      _id: 'gp11',
      name: 'Biscuit Parle-G',
      unit: 'pkt',
      unitPrice: 10,
      quantityOnHand: 60,
      categoryId: { _id: catSnacks._id, name: catSnacks.name },
    },
    {
      _id: 'gp12',
      name: 'Bread Brown',
      unit: 'loaf',
      unitPrice: 42,
      quantityOnHand: 12,
      lowStockThreshold: 4,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp13',
      name: 'Milk 500ml',
      unit: 'pkt',
      unitPrice: 28,
      quantityOnHand: 35,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp14',
      name: 'Eggs (6)',
      unit: 'tray',
      unitPrice: 72,
      quantityOnHand: 15,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
    {
      _id: 'gp15',
      name: 'Paneer 200g',
      unit: 'pkt',
      unitPrice: 90,
      quantityOnHand: 8,
      lowStockThreshold: 3,
      categoryId: { _id: catGroceries._id, name: catGroceries.name },
    },
  ];

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 5);

  const inv1Token = 'guest-demo-bill-001';
  const inv2Token = 'guest-demo-bill-002';

  const invoices: AdminInvoice[] = [
    inv({
      id: 'gi1',
      invoiceId: 'INV-G1001',
      customerName: 'Walk-in customer',
      paymentMode: 'cash',
      items: [
        { name: 'Masala Chai', quantity: '2', totalPrice: 40 },
        { name: 'Samosa', quantity: '4', totalPrice: 60 },
      ],
      total: 100,
      voiceTranscript: '',
      pdfUrl: '',
      publicToken: inv1Token,
      publicBillUrl: `/bill/${inv1Token}`,
      source: 'manual',
      createdAt: weekAgo.toISOString(),
      updatedAt: weekAgo.toISOString(),
    }),
    inv({
      id: 'gi2',
      invoiceId: 'INV-G1002',
      customerName: 'Priya Sharma',
      customerPhone: '9123456780',
      paymentMode: 'credit',
      items: [
        { name: 'Basmati Rice 1kg', quantity: '2', totalPrice: 240 },
        { name: 'Sunflower Oil 1L', quantity: '1', totalPrice: 165 },
      ],
      total: 405,
      voiceTranscript: '',
      pdfUrl: '',
      publicToken: inv2Token,
      publicBillUrl: `/bill/${inv2Token}`,
      source: 'manual',
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    }),
    inv({
      id: 'gi3',
      invoiceId: 'INV-G1003',
      customerName: 'Morning rush',
      paymentMode: 'cash',
      items: [
        { name: 'Veg Sandwich', quantity: '3', totalPrice: 165 },
        { name: 'Cold Coffee', quantity: '2', totalPrice: 120 },
      ],
      total: 285,
      voiceTranscript: '',
      pdfUrl: '',
      publicToken: newGuestId('tok'),
      source: 'manual',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }),
  ];

  const creditPhone = '9123456780';
  const creditAccounts = [
    {
      phone: creditPhone,
      customerName: 'Priya Sharma',
      totalCredited: 405,
      totalPaid: 100,
      pendingBalance: 305,
      lastActivityAt: yesterday.toISOString(),
      createdAt: weekAgo.toISOString(),
      updatedAt: yesterday.toISOString(),
    },
  ];

  const creditLedgerByPhone: GuestState['creditLedgerByPhone'] = {
    [creditPhone]: [
      {
        id: 'gle1',
        type: 'sale',
        amount: 405,
        invoiceId: 'gi2',
        invoicePublicId: 'INV-G1002',
        note: 'Credit sale',
        createdAt: yesterday.toISOString(),
      },
      {
        id: 'gle2',
        type: 'payment',
        amount: 100,
        invoiceId: null,
        invoicePublicId: '',
        note: 'Partial payment',
        createdAt: yesterday.toISOString(),
      },
    ],
  };

  return {
    version: GUEST_STATE_VERSION,
    user: {
      id: DEMO_USER_ID,
      name: 'Ravi Kumar',
      businessName: 'Demo Kirana & Café',
      phone: '9876543210',
    },
    shopSettings: {
      ...DEFAULT_SHOP_SETTINGS,
      storeName: 'Demo Kirana & Café',
      storeTagline: 'Guest preview — sample data',
    },
    financeReportsHidden: false,
    inventoryPinHash: null,
    stockCategories: [catGroceries, catBeverages, catSnacks],
    stockProducts: products,
    invoices,
    creditAccounts,
    creditLedgerByPhone,
    addressBookContacts: [
      { id: 'ab1', phone: creditPhone, name: 'Priya Sharma', updatedAt: yesterday.toISOString() },
      { id: 'ab2', phone: '9988776655', name: 'Amit Verma', updatedAt: weekAgo.toISOString() },
    ],
    outOfStockItems: [
      {
        _id: 'oos1',
        name: 'Maggi Noodles',
        quantity: '12 packs',
        note: 'Supplier delay',
        createdAt: weekAgo.toISOString(),
        updatedAt: weekAgo.toISOString(),
      },
      {
        _id: 'oos2',
        name: 'Coca-Cola 750ml',
        quantity: '24 bottles',
        note: '',
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      },
    ],
    qrCodeUrl: null,
    invoiceSeq: 1004,
  };
}
