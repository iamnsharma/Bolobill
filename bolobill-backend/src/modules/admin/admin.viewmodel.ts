import path from 'path';
import {env} from '../../config/env';
import type {UserDocument} from '../../models/User.model';
import {publicBillPageUrl} from '../../utils/publicBillUrl';

const toPdfUrl = (pdfPath: string) => {
  if (!pdfPath) return '';
  const fileName = path.basename(pdfPath);
  return `${env.BASE_URL}/api/files/pdfs/${fileName}`;
};

type UserLike = Pick<
  UserDocument,
  '_id' | 'name' | 'phone' | 'businessName' | 'accountType' | 'role' | 'isBlacklisted' | 'usage' | 'createdAt' | 'updatedAt'
>;

export const toAdminUserVm = (user: UserLike) => ({
  id: user._id.toString(),
  name: user.name,
  phone: user.phone,
  businessName: user.businessName ?? '',
  accountType: user.accountType,
  role: user.role,
  isBlacklisted: user.isBlacklisted ?? false,
  usage: user.usage,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const toAdminInvoiceVm = (invoice: {
  _id: {toString(): string};
  invoiceId: string;
  customerName: string;
  items: unknown[];
  total: number;
  voiceTranscript: string;
  pdfPath: string;
  publicToken?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: {_id: unknown; name?: string; phone?: string; businessName?: string} | unknown;
}) => {
  const userId = invoice.userId as {_id: unknown; name?: string; phone?: string; businessName?: string} | undefined;
  const publicToken = invoice.publicToken ?? '';
  return {
    id: invoice._id.toString(),
    invoiceId: invoice.invoiceId,
    customerName: invoice.customerName,
    items: invoice.items,
    total: invoice.total,
    voiceTranscript: invoice.voiceTranscript,
    pdfUrl: toPdfUrl(invoice.pdfPath),
    publicToken,
    publicBillUrl: publicToken ? publicBillPageUrl(publicToken) : '',
    source: invoice.source,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    user: userId && typeof userId === 'object' && userId._id
      ? {
          id: (userId._id as {toString(): string}).toString(),
          name: userId.name,
          phone: userId.phone,
          businessName: userId.businessName,
        }
      : null,
  };
};
