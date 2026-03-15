import {Request, Response} from 'express';
import {ApiError} from '../../common/ApiError';
import {invoiceService} from './invoice.service';
import {toInvoiceVm} from './invoice.viewmodel';
import {userPlanService} from '../plan/userPlan.service';
import {
  manualInvoiceSchema,
  translateTextSchema,
  updateInvoiceSchema,
  createFromVoicePreviewSchema,
} from './invoice.validation';

const getUserId = (req: Request) => {
  if (!req.user?.userId) {
    throw new ApiError(401, 'Unauthorized');
  }
  return req.user.userId;
};

const getInvoiceParamId = (req: Request) =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

export const invoiceController = {
  async translateText(req: Request, res: Response) {
    const userId = getUserId(req);
    await userPlanService.enforceInvoiceLimit(userId);
    const parsed = translateTextSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const invoice = await invoiceService.translateTranscriptToInvoice({
      transcript: parsed.data.transcript,
      outputLanguage: parsed.data.language,
    });
    await invoiceService.incrementUserUsage(userId, {invoiceRequestSuccessCount: 1});
    return res.status(200).json({invoice});
  },

  async previewVoice(req: Request, res: Response) {
    const userId = getUserId(req);
    await userPlanService.enforceVoiceLimit(userId);
    if (!req.file?.path) {
      throw new ApiError(400, 'audio file is required');
    }
    try {
      const result = await invoiceService.previewVoiceInvoice({
        audioPath: req.file.path,
        language: req.body.language,
      });
      return res.status(200).json(result);
    } finally {
      await invoiceService.cleanupTempFile(req.file?.path);
    }
  },

  async createFromVoicePreview(req: Request, res: Response) {
    const userId = getUserId(req);
    await userPlanService.enforceInvoiceLimit(userId);
    const parsed = createFromVoicePreviewSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }
    const payload = parsed.data;
    const items = payload.items.map((it) => ({
      name: it.name,
      quantity: String(it.quantity),
      totalPrice: it.totalPrice,
    }));
    const invoice = await invoiceService.createInvoiceFromVoicePreview({
      userId,
      customerName: payload.customerName,
      items,
      transcript: payload.transcript,
      durationSec: payload.durationSec,
    });
    await invoiceService.incrementUserUsage(userId, {
      invoiceRequestSuccessCount: 1,
      voiceToTextSecondsUsed: payload.durationSec ?? 0,
    });
    return res.status(201).json({invoice: toInvoiceVm(invoice)});
  },

  async createVoice(req: Request, res: Response) {
    const userId = getUserId(req);
    await userPlanService.enforceInvoiceLimit(userId);
    await userPlanService.enforceVoiceLimit(userId);
    if (!req.file?.path) {
      throw new ApiError(400, 'audio file is required');
    }
    const parsedDuration = Number(req.body?.durationSec);
    const durationSec = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 0;

    try {
      const invoice = await invoiceService.createVoiceInvoice({
        userId,
        audioPath: req.file.path,
        language: req.body.language,
        customerName: req.body.customerName,
      });
      await invoiceService.incrementUserUsage(userId, {
        invoiceRequestSuccessCount: 1,
        voiceToTextSecondsUsed: durationSec,
      });
      return res.status(201).json({invoice: toInvoiceVm(invoice)});
    } finally {
      await invoiceService.cleanupTempFile(req.file?.path);
    }
  },

  async createManual(req: Request, res: Response) {
    const userId = getUserId(req);
    await userPlanService.enforceInvoiceLimit(userId);
    const parsed = manualInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const invoice = await invoiceService.createManualInvoice({
      userId,
      customerName: parsed.data.customerName,
      items: parsed.data.items,
      note: parsed.data.note,
    });
    await invoiceService.incrementUserUsage(userId, {invoiceRequestSuccessCount: 1});
    return res.status(201).json({invoice: toInvoiceVm(invoice)});
  },

  async getAll(req: Request, res: Response) {
    const userId = getUserId(req);
    const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const invoices = await invoiceService.getAllInvoices(userId, {
      from: Number.isNaN(from?.getTime()) ? undefined : from,
      to: Number.isNaN(to?.getTime()) ? undefined : to,
      search,
    });
    return res.json({invoices: invoices.map(invoice => toInvoiceVm(invoice))});
  },

  async getSalesSummary(req: Request, res: Response) {
    const userId = getUserId(req);
    const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;
    const summary = await invoiceService.getSalesSummary(
      userId,
      Number.isNaN(from?.getTime()) ? undefined : from,
      Number.isNaN(to?.getTime()) ? undefined : to,
    );
    return res.json(summary);
  },

  async getItemsSold(req: Request, res: Response) {
    const userId = getUserId(req);
    const from = typeof req.query.from === 'string' ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === 'string' ? new Date(req.query.to) : undefined;
    const items = await invoiceService.getItemsSold(
      userId,
      Number.isNaN(from?.getTime()) ? undefined : from,
      Number.isNaN(to?.getTime()) ? undefined : to,
    );
    return res.json({items});
  },

  async getLatestPdfs(req: Request, res: Response) {
    const userId = getUserId(req);
    const invoices = await invoiceService.getLatestPdfs(userId, 5);
    return res.json({
      invoices: invoices.map(invoice => ({
        id: invoice._id.toString(),
        invoiceId: invoice.invoiceId,
        pdfUrl: toInvoiceVm(invoice).pdfUrl,
        createdAt: invoice.createdAt,
      })),
    });
  },

  async getById(req: Request, res: Response) {
    const userId = getUserId(req);
    const invoice = await invoiceService.getInvoiceById(userId, getInvoiceParamId(req));
    return res.json({invoice: toInvoiceVm(invoice)});
  },

  async previewById(req: Request, res: Response) {
    const userId = getUserId(req);
    const preview = await invoiceService.createPreviewById(userId, getInvoiceParamId(req));
    return res.json({preview});
  },

  async updateById(req: Request, res: Response) {
    const userId = getUserId(req);
    const parsed = updateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0]?.message ?? 'Invalid body');
    }

    const invoice = await invoiceService.updateInvoice(
      userId,
      getInvoiceParamId(req),
      parsed.data,
    );
    return res.json({invoice: toInvoiceVm(invoice)});
  },

  async deleteById(req: Request, res: Response) {
    const userId = getUserId(req);
    const result = await invoiceService.deleteInvoice(userId, getInvoiceParamId(req));
    return res.json(result);
  },
};
