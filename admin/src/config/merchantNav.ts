export type MerchantNavItem = { to: string; icon: string; labelKey: string };

export type MerchantNavSection = { labelKey: string; items: MerchantNavItem[] };

export const BUSINESS_NAV_SECTIONS: MerchantNavSection[] = [
  {
    labelKey: "nav.sections.overview",
    items: [{ to: "/dashboard", icon: "ti-home", labelKey: "nav.dashboard" }],
  },
  {
    labelKey: "nav.sections.billing",
    items: [
      { to: "/dashboard/invoices/new", icon: "ti-plus", labelKey: "nav.createBill" },
      { to: "/dashboard/invoices", icon: "ti-receipt", labelKey: "nav.billsInvoices" },
      { to: "/dashboard/credit", icon: "ti-credit-card", labelKey: "nav.credit" },
    ],
  },
  {
    labelKey: "nav.sections.inventory",
    items: [
      { to: "/dashboard/stock", icon: "ti-box", labelKey: "nav.stock" },
      { to: "/dashboard/out-of-stock", icon: "ti-alert-circle", labelKey: "nav.outOfStock" },
    ],
  },
  {
    labelKey: "nav.sections.reports",
    items: [
      { to: "/dashboard/sales", icon: "ti-chart-bar", labelKey: "nav.salesSummary" },
      { to: "/dashboard/items-sold", icon: "ti-package", labelKey: "nav.itemsSold" },
    ],
  },
  {
    labelKey: "nav.sections.store",
    items: [
      { to: "/dashboard/address-book", icon: "ti-address-book", labelKey: "nav.addressBook" },
      { to: "/dashboard/qr-code", icon: "ti-qrcode", labelKey: "nav.qrCode" },
    ],
  },
];
