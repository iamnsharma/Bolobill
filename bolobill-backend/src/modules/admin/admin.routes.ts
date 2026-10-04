import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import {Request, Response, Router} from 'express';
import type {NextFunction} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware, requireSuperAdmin} from '../../middleware/admin.middleware';
import {asyncHandler} from '../../common/asyncHandler';
import {adminController} from './admin.controller';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}
const mimeExt: Record<string, string> = {
  'audio/webm': '.webm', 'audio/m4a': '.m4a', 'audio/x-m4a': '.m4a', 'audio/mp4': '.mp4',
  'audio/mpeg': '.mp3', 'audio/wav': '.wav', 'audio/ogg': '.ogg', 'audio/flac': '.flac',
};
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '') || mimeExt[file.mimetype] || '.webm';
      cb(null, `${uuidv4()}${ext}`);
    },
  }),
  limits: {fileSize: 25 * 1024 * 1024},
});

const qrDir = path.join(process.cwd(), 'storage', 'qr');
if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
const memoryImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 10 * 1024 * 1024},
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
    if (mime.startsWith('image/') || mime === 'application/octet-stream') cb(null, true);
    else cb(new Error('Please upload an image'));
  },
});

const memorySpreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 10 * 1024 * 1024},
  fileFilter: (_req, file, cb) => {
    const name = (file.originalname || '').toLowerCase();
    const ok =
      name.endsWith('.csv') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xls') ||
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (ok) cb(null, true);
    else cb(new Error('Upload CSV or Excel'));
  },
});

const qrUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, qrDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '') || '.png';
      cb(null, `qr-${uuidv4()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PNG, JPG or WebP images are allowed'));
  },
});

export const adminRouter = Router();

// Health check (no auth)
adminRouter.get('/', (_req, res) => {
  res.json({ok: true, scope: 'admin'});
});

adminRouter.use((req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, next);
  return Promise.resolve();
});
adminRouter.use((req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(adminMiddleware(req, res, next)),
);

// Superadmin-only routes (platform-wide)
adminRouter.get('/stats', requireSuperAdmin, asyncHandler(adminController.getStats));
adminRouter.get('/whisper-usage', requireSuperAdmin, asyncHandler(adminController.getWhisperUsage));
adminRouter.get('/users', requireSuperAdmin, asyncHandler(adminController.listUsers));
adminRouter.post('/users/merchants', requireSuperAdmin, asyncHandler(adminController.createMerchant));
adminRouter.get('/users/:id', requireSuperAdmin, asyncHandler(adminController.getUserById));
adminRouter.patch('/users/:id/blacklist', requireSuperAdmin, asyncHandler(adminController.setBlacklist));
adminRouter.patch('/users/:id/plan', requireSuperAdmin, asyncHandler(adminController.assignPlan));
adminRouter.put('/store-links', requireSuperAdmin, asyncHandler(adminController.updateStoreLinks));

// Fixed paths for both superadmin and business admin (business sees own data only)
adminRouter.get('/me', asyncHandler(adminController.getMe));
adminRouter.patch('/me/finance-reports', asyncHandler(adminController.patchFinanceReports));
adminRouter.get('/store-links', asyncHandler(adminController.getStoreLinks));
adminRouter.get('/qr-code', asyncHandler(adminController.getQrCode));
adminRouter.post('/qr-code', qrUpload.single('qr'), asyncHandler(adminController.uploadQrCode));
adminRouter.delete('/qr-code', asyncHandler(adminController.deleteQrCode));
adminRouter.get('/sales-summary', asyncHandler(adminController.getSalesSummary));
adminRouter.get('/sales-summary/daily', asyncHandler(adminController.getSalesSummaryDaily));
adminRouter.get('/items-sold', asyncHandler(adminController.getItemsSold));
adminRouter.get('/invoices', asyncHandler(adminController.listInvoices));
adminRouter.post('/invoices', asyncHandler(adminController.createInvoice));
adminRouter.get('/invoices/:id', asyncHandler(adminController.getInvoiceById));
adminRouter.put('/invoices/:id', requireSuperAdmin, asyncHandler(adminController.updateInvoice));

// Out of stock (business admin sees own only)
adminRouter.get('/out-of-stock', asyncHandler(adminController.listOutOfStock));
adminRouter.post('/out-of-stock', asyncHandler(adminController.createOutOfStock));
adminRouter.post('/out-of-stock/voice', upload.single('audio'), asyncHandler(adminController.createOutOfStockFromVoice));
adminRouter.post(
  '/out-of-stock/import/analyze',
  memoryImageUpload.single('image'),
  asyncHandler(adminController.analyzeOosImport),
);
adminRouter.post(
  '/out-of-stock/import/parse-file',
  memorySpreadsheetUpload.single('file'),
  asyncHandler(adminController.parseOosImportFile),
);
adminRouter.post('/out-of-stock/import/parse-paste', asyncHandler(adminController.parseOosImportPaste));
adminRouter.post('/out-of-stock/import/match', asyncHandler(adminController.matchOosImport));
adminRouter.post('/out-of-stock/import/commit', asyncHandler(adminController.commitOosImport));
adminRouter.get('/out-of-stock/:id', asyncHandler(adminController.getOutOfStockById));
adminRouter.put('/out-of-stock/:id', asyncHandler(adminController.updateOutOfStock));
adminRouter.delete('/out-of-stock/:id', asyncHandler(adminController.deleteOutOfStock));
