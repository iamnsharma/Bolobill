import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import {Router} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {authMiddleware} from '../../middleware/auth.middleware';
import {invoiceController} from './invoice.controller';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

const MIME_EXTENSION_MAP: Record<string, string> = {
  'audio/m4a': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/mp4': '.mp4',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/webm': '.webm',
  'audio/ogg': '.ogg',
  'audio/oga': '.oga',
  'audio/flac': '.flac',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extFromName = path.extname(file.originalname || '').toLowerCase();
    const extFromMime = MIME_EXTENSION_MAP[file.mimetype] || '';
    const extension = extFromName || extFromMime || '.m4a';
    cb(null, `${uuidv4()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {fileSize: 25 * 1024 * 1024},
});

export const invoiceRouter = Router();

invoiceRouter.use(authMiddleware);

invoiceRouter.post('/translate-text', asyncHandler(invoiceController.translateText));
invoiceRouter.post('/create', upload.single('audio'), asyncHandler(invoiceController.createVoice));
invoiceRouter.post('/voice', upload.single('audio'), asyncHandler(invoiceController.createVoice));
invoiceRouter.post('/manual', asyncHandler(invoiceController.createManual));
invoiceRouter.get('/sales-summary', asyncHandler(invoiceController.getSalesSummary));
invoiceRouter.get('/items-sold', asyncHandler(invoiceController.getItemsSold));
invoiceRouter.get('/', asyncHandler(invoiceController.getAll));
invoiceRouter.get('/latest/pdfs', asyncHandler(invoiceController.getLatestPdfs));
invoiceRouter.get('/:id/preview', asyncHandler(invoiceController.previewById));
invoiceRouter.get('/:id', asyncHandler(invoiceController.getById));
invoiceRouter.put('/:id', asyncHandler(invoiceController.updateById));
invoiceRouter.delete('/:id', asyncHandler(invoiceController.deleteById));
