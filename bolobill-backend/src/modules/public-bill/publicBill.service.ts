import path from 'path';
import crypto from 'crypto';
import { ApiError } from '../../common/ApiError';
import { env } from '../../config/env';
import { InvoiceModel } from '../../models/Invoice.model';
import { publicBillPageUrl } from '../../utils/publicBillUrl';

const toPdfUrl = (pdfPath: string) => {
  if (!pdfPath) return '';
  return `${env.BASE_URL}/api/files/pdfs/${path.basename(pdfPath)}`;
};

const toQrUrl = (qrCodePath?: string) => {
  if (!qrCodePath) return '';
  return `${env.BASE_URL}/api/files/qr/${path.basename(qrCodePath)}`;
};

async function ensurePublicToken(invoice: {
  publicToken?: string | null;
  save: () => Promise<unknown>;
}): Promise<string> {
  if (invoice.publicToken) return invoice.publicToken;
  const token = crypto.randomUUID();
  invoice.publicToken = token;
  await invoice.save();
  return token;
}

export const publicBillService = {
  async getByToken(token: string) {
    const invoice = await InvoiceModel.findOne({ publicToken: token })
      .populate('userId', 'name phone businessName qrCodePath')
      .lean();
    if (!invoice) {
      throw new ApiError(404, 'Bill not found');
    }

    const user = invoice.userId as
      | {
          name?: string;
          phone?: string;
          businessName?: string;
          qrCodePath?: string;
        }
      | null
      | undefined;

    const shopName = user?.businessName?.trim() || user?.name?.trim() || 'Our shop';
    const tokenStr = invoice.publicToken as string;

    return {
      invoiceId: invoice.invoiceId,
      customerName: invoice.customerName,
      items: invoice.items,
      total: invoice.total,
      createdAt: invoice.createdAt,
      pdfUrl: toPdfUrl(invoice.pdfPath as string),
      qrUrl: toQrUrl(user?.qrCodePath),
      shopName,
      shopPhone: user?.phone ?? '',
      publicBillUrl: publicBillPageUrl(tokenStr),
    };
  },

  ensurePublicTokenForInvoiceId(invoiceMongoId: string): Promise<string> {
    return InvoiceModel.findById(invoiceMongoId).then(async (doc) => {
      if (!doc) throw new ApiError(404, 'Invoice not found');
      return ensurePublicToken(doc);
    });
  },
};
