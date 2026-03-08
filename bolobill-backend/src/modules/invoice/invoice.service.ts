import fs from 'fs';
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

  async createVoiceInvoice(input: {
    userId: string;
    audioPath: string;
    language?: string;
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

    const invoiceId = createInvoiceId();
    const pdf = await generateInvoicePdf({
      invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
      items: localizedItems,
      total,
      transcript,
    });

    const invoice = await InvoiceModel.create({
      userId: user._id,
      invoiceId,
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

    const pdf = await generateInvoicePdf({
      invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
      items: input.items,
      total,
      transcript,
    });

    const invoice = await InvoiceModel.create({
      userId: user._id,
      invoiceId,
      items: input.items,
      total,
      voiceTranscript: transcript,
      pdfPath: pdf.pdfPath,
      source: 'manual',
    });

    return invoice;
  },

  async getAllInvoices(userId: string) {
    return InvoiceModel.find({userId}).sort({createdAt: -1});
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
    payload: {items?: InvoiceItemInput[]; voiceTranscript?: string},
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

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const pdf = await generateInvoicePdf({
      invoiceId: invoice.invoiceId,
      customerName: user.name,
      customerPhone: user.phone,
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
