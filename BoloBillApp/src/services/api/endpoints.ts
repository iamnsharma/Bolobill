export const ENDPOINTS = {
  TRANSACTION_CREATE: '/transactions/create',
  WALLET_BALANCE: '/wallet/balance',
  AUTH_REGISTER: '/auth/register',
  AUTH_SEND_OTP: '/auth/send-otp',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_ME: '/auth/me',
  INVOICE_CREATE: '/invoice/create',
  INVOICE_TRANSLATE_TEXT: '/invoices/translate-text',
  INVOICE_MANUAL_CREATE: '/invoices/manual',
  INVOICE_LIST: '/invoices',
  INVOICE_LATEST_PDFS: '/invoices/latest/pdfs',
} as const;
