import fs from 'fs';
import mongoose from 'mongoose';
import {ApiError} from '../../common/ApiError';
import {UserModel} from '../../models/User.model';
import {InvoiceModel} from '../../models/Invoice.model';
import {generateInvoicePdf} from '../../services/pdf.service';
import {parseTranscriptToItems, type InvoiceItemInput} from '../../services/transcriptParser.service';
import {
  extractInvoiceItemsFromTranscript,
  localizeItemNamesByLanguage,
  transcribeAudio,
} from '../../services/whisper.service';

const createInvoiceId = () => `KB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const computeTotal = (items: InvoiceItemInput[]) =>
  items.reduce((sum, item) => sum + item.totalPrice, 0);

const parseItemsWithFallback = async (transcript: string) => {
  const parsed = parseTranscriptToItems(transcript);
  if (parsed.items.length) {
    return parsed;
  }

  const aiItems = await extractInvoiceItemsFromTranscript(transcript);
  if (!aiItems?.length) {
    return {items: [], total: 0};
  }

  return {
    items: aiItems,
    total: computeTotal(aiItems),
  };
};

export const invoiceService = {
  async incrementUserUsage(
    userId: string,
    input: {invoiceRequestSuccessCount?: number; voiceToTextSecondsUsed?: number},
  ) {
    const inc: Record<string, number> = {};
    if (input.invoiceRequestSuccessCount && input.invoiceRequestSuccessCount > 0) {
      inc['usage.invoiceRequestSuccessCount'] = input.invoiceRequestSuccessCount;
    }
    if (input.voiceToTextSecondsUsed && input.voiceToTextSecondsUsed > 0) {
      inc['usage.voiceToTextSecondsUsed'] = input.voiceToTextSecondsUsed;
    }
    if (!Object.keys(inc).length) {
      return;
    }

    await UserModel.updateOne({_id: userId}, {$inc: inc});
  },

  async translateVoiceToInvoice(input: {audioPath: string; language?: string}) {
    const transcript = await transcribeAudio(input.audioPath, input.language);
    return this.translateTranscriptToInvoice({
      transcript,
      outputLanguage: input.language,
    });
  },

  async translateTranscriptToInvoice(input: {
    transcript: string;
    outputLanguage?: string;
  }) {
    const transcript = input.transcript.trim();
    const {items, total} = await parseItemsWithFallback(transcript);
    if (!items.length) {
      throw new ApiError(422, 'Unable to parse items from transcript');
    }
    const localizedItems = await localizeItemNamesByLanguage(items, input.outputLanguage);

    return {
      invoiceId: createInvoiceId(),
      items: localizedItems,
      total,
      voiceTranscript: transcript,
      pdfUrl: '',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };
  },

  /** Parse voice to items only (for e.g. out-of-stock list). Does not create invoice. */
  async getItemsFromVoice(input: {audioPath: string; language?: string}) {
    const transcript = await transcribeAudio(input.audioPath, input.language);
    const {items} = await parseItemsWithFallback(transcript);
    return items.map((item) => ({name: item.name, quantity: item.quantity}));
  },

  /** Preview voice: transcribe and parse to items + transcript (no invoice created). */
  async previewVoiceInvoice(input: {audioPath: string; language?: string}) {
    const transcript = await transcribeAudio(input.audioPath, input.language);
    const {items, total} = await parseItemsWithFallback(transcript);
    if (!items.length) {
      throw new ApiError(422, 'Unable to parse items from recording. Speak clearly, e.g. "2 kg rice 100 rupees".');
    }
    const localizedItems = await localizeItemNamesByLanguage(items, input.language);
    return {items: localizedItems, transcript, total};
  },

  /** Create invoice from reviewed voice data (after user edits in review screen). */
  async createInvoiceFromVoicePreview(input: {
    userId: string;
    customerName: string;
    items: InvoiceItemInput[];
    transcript?: string;
    durationSec?: number;
  }) {
    const user = await UserModel.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const billToName = input.customerName?.trim() || 'Customer';
    const total = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const invoiceId = createInvoiceId();
    const transcript = input.transcript?.trim() ?? '';

    const pdf = await generateInvoicePdf({
      invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
      billToName,
      items: input.items,
      total,
      transcript,
    });

    const invoice = await InvoiceModel.create({
      userId: user._id,
      invoiceId,
      customerName: billToName,
      items: input.items,
      total,
      voiceTranscript: transcript,
      pdfPath: pdf.pdfPath,
      source: 'voice',
    });

    return invoice;
  },

  async createVoiceInvoice(input: {
    userId: string;
    audioPath: string;
    language?: string;
    customerName?: string;
  }) {
    const user = await UserModel.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const transcript = await transcribeAudio(input.audioPath, input.language);
    const {items, total} = await parseItemsWithFallback(transcript);
    if (!items.length) {
      throw new ApiError(422, 'Unable to parse items from transcript');
    }
    const localizedItems = await localizeItemNamesByLanguage(items, input.language);
    const billToName = input.customerName?.trim() || 'Customer';

    const invoiceId = createInvoiceId();
    const pdf = await generateInvoicePdf({
      invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
      billToName,
      items: localizedItems,
      total,
      transcript,
    });

    const invoice = await InvoiceModel.create({
      userId: user._id,
      invoiceId,
      customerName: billToName,
      items: localizedItems,
      total,
      voiceTranscript: transcript,
      pdfPath: pdf.pdfPath,
      source: 'voice',
    });

    return invoice;
  },

  async createManualInvoice(input: {
    userId: string;
    customerName?: string;
    items: InvoiceItemInput[];
    note?: string;
  }) {
    const user = await UserModel.findById(input.userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const total = input.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const invoiceId = createInvoiceId();
    const transcript = input.note ?? '';
    const billToName = input.customerName?.trim() || 'Customer';

    const pdf = await generateInvoicePdf({
      invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
      billToName,
      items: input.items,
      total,
      transcript,
    });

    const invoice = await InvoiceModel.create({
      userId: user._id,
      invoiceId,
      customerName: billToName,
      items: input.items,
      total,
      voiceTranscript: transcript,
      pdfPath: pdf.pdfPath,
      source: 'manual',
    });

    return invoice;
  },

  async getAllInvoices(
    userId: string,
    filters?: {from?: Date; to?: Date; search?: string},
  ) {
    const query: Record<string, unknown> = {userId};
    if (filters?.from || filters?.to) {
      query.createdAt = {};
      if (filters.from) (query.createdAt as Record<string, Date>).$gte = filters.from;
      if (filters.to) (query.createdAt as Record<string, Date>).$lte = filters.to;
    }
    if (filters?.search?.trim()) {
      query.customerName = {$regex: filters.search.trim(), $options: 'i'};
    }
    return InvoiceModel.find(query).sort({createdAt: -1});
  },

  async getSalesSummary(
    userId: string,
    from?: Date,
    to?: Date,
  ): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
    filteredTotal: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const baseMatch = {userId};
    const todayInvoices = await InvoiceModel.find({
      ...baseMatch,
      createdAt: {$gte: startOfDay, $lte: now},
    });
    const weekInvoices = await InvoiceModel.find({
      ...baseMatch,
      createdAt: {$gte: startOfWeek, $lte: now},
    });
    const monthInvoices = await InvoiceModel.find({
      ...baseMatch,
      createdAt: {$gte: startOfMonth, $lte: now},
    });
    const yearInvoices = await InvoiceModel.find({
      ...baseMatch,
      createdAt: {$gte: startOfYear, $lte: now},
    });

    const sum = (invs: {total: number}[]) => invs.reduce((s, i) => s + i.total, 0);
    const today = sum(todayInvoices);
    const thisWeek = sum(weekInvoices);
    const thisMonth = sum(monthInvoices);
    const thisYear = sum(yearInvoices);

    let filteredTotal = thisYear;
    if (from || to) {
      const rangeQuery: Record<string, Date> = {};
      if (from) rangeQuery.$gte = from;
      if (to) rangeQuery.$lte = to;
      const rangeInvoices = await InvoiceModel.find({
        ...baseMatch,
        createdAt: rangeQuery,
      });
      filteredTotal = sum(rangeInvoices);
    }

    const allInvoices = await InvoiceModel.find(baseMatch);
    const total = sum(allInvoices);

    return {
      total,
      today,
      thisWeek,
      thisMonth,
      thisYear,
      filteredTotal,
    };
  },

  async getSalesSummaryDaily(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<{date: string; total: number}[]> {
    const result = await InvoiceModel.aggregate<{_id: string; total: number}>([
      {$match: {userId: new mongoose.Types.ObjectId(userId), createdAt: {$gte: from, $lte: to}}},
      {$group: {_id: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}}, total: {$sum: '$total'}}},
      {$sort: {_id: 1}},
    ]);
    return result.map((r) => ({date: r._id, total: r.total}));
  },

  async getItemsSold(
    userId: string,
    from?: Date,
    to?: Date,
  ): Promise<{itemName: string; quantity: number; amount: number}[]> {
    const query: Record<string, unknown> = {userId};
    if (from || to) {
      query.createdAt = {};
      if (from) (query.createdAt as Record<string, Date>).$gte = from;
      if (to) (query.createdAt as Record<string, Date>).$lte = to;
    }
    const invoices = await InvoiceModel.find(query);
    const map = new Map<string, {quantity: number; amount: number}>();
    for (const inv of invoices) {
      for (const it of inv.items) {
        const name = (it.name || '').trim() || 'Unknown';
        const qty = parseFloat(String(it.quantity)) || 0;
        const amt = Number(it.totalPrice) || 0;
        const existing = map.get(name);
        if (existing) {
          existing.quantity += qty;
          existing.amount += amt;
        } else {
          map.set(name, {quantity: qty, amount: amt});
        }
      }
    }
    return Array.from(map.entries())
      .map(([itemName, {quantity, amount}]) => ({itemName, quantity, amount}))
      .sort((a, b) => b.amount - a.amount);
  },

  async getLatestPdfs(userId: string, limit = 5) {
    return InvoiceModel.find({userId, pdfPath: {$ne: ''}})
      .sort({createdAt: -1})
      .limit(limit);
  },

  async getInvoiceById(userId: string, id: string) {
    const invoice = await InvoiceModel.findOne({_id: id, userId});
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }
    return invoice;
  },

  async updateInvoice(
    userId: string,
    id: string,
    payload: {customerName?: string; items?: InvoiceItemInput[]; voiceTranscript?: string},
  ) {
    const invoice = await InvoiceModel.findOne({_id: id, userId});
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    if (payload.items?.length) {
      invoice.set('items', payload.items);
      invoice.total = payload.items.reduce((sum, item) => sum + item.totalPrice, 0);
    }
    if (payload.voiceTranscript !== undefined) {
      invoice.voiceTranscript = payload.voiceTranscript;
    }
    if (payload.customerName?.trim()) {
      invoice.customerName = payload.customerName.trim();
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const pdf = await generateInvoicePdf({
      invoiceId: invoice.invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
      billToName: invoice.customerName || 'Customer',
      items: invoice.items as unknown as InvoiceItemInput[],
      total: invoice.total,
      transcript: invoice.voiceTranscript,
    });
    invoice.pdfPath = pdf.pdfPath;

    await invoice.save();
    return invoice;
  },

  async deleteInvoice(userId: string, id: string) {
    const invoice = await InvoiceModel.findOneAndDelete({_id: id, userId});
    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
      fs.unlink(invoice.pdfPath, () => {});
    }
    return {message: 'Invoice deleted'};
  },

  async createPreviewById(userId: string, id: string) {
    const invoice = await this.getInvoiceById(userId, id);
    return {
      invoiceId: invoice.invoiceId,
      customerName: invoice.customerName,
      items: invoice.items,
      total: invoice.total,
      voiceTranscript: invoice.voiceTranscript,
    };
  },

  async cleanupTempFile(filePath?: string) {
    if (!filePath) {
      return;
    }
    fs.unlink(filePath, () => {});
  },
};
