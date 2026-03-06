export type MockInvoice = {
  id: string;
  pdfName: string;
  amount: number;
  customerName: string;
  createdAt: string;
};

export const mockInvoices: MockInvoice[] = [
  {
    id: 'INV-9305',
    pdfName: 'invoice_kiran_store_9305.pdf',
    amount: 1860,
    customerName: 'Kiran Store',
    createdAt: 'Today, 11:35 AM',
  },
  {
    id: 'INV-9304',
    pdfName: 'invoice_mohan_traders_9304.pdf',
    amount: 920,
    customerName: 'Mohan Traders',
    createdAt: 'Today, 09:50 AM',
  },
  {
    id: 'INV-9303',
    pdfName: 'invoice_singh_mart_9303.pdf',
    amount: 2499,
    customerName: 'Singh Mart',
    createdAt: 'Yesterday, 07:42 PM',
  },
  {
    id: 'INV-9302',
    pdfName: 'invoice_rama_wholesale_9302.pdf',
    amount: 640,
    customerName: 'Rama Wholesale',
    createdAt: 'Yesterday, 05:10 PM',
  },
  {
    id: 'INV-9301',
    pdfName: 'invoice_gupta_shop_9301.pdf',
    amount: 1310,
    customerName: 'Gupta Shop',
    createdAt: 'Yesterday, 12:23 PM',
  },
  {
    id: 'INV-9300',
    pdfName: 'invoice_balaji_traders_9300.pdf',
    amount: 780,
    customerName: 'Balaji Traders',
    createdAt: 'Mar 03, 04:16 PM',
  },
  {
    id: 'INV-9299',
    pdfName: 'invoice_jain_general_9299.pdf',
    amount: 3520,
    customerName: 'Jain General',
    createdAt: 'Mar 03, 10:30 AM',
  },
];
