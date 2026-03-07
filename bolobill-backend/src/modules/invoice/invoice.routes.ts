import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {Router} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {authMiddleware} from '../../middleware/auth.middleware';
import {invoiceController} from './invoice.controller';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

const upload = multer({
  dest: uploadDir,
  limits: {fileSize: 25 * 1024 * 1024},
});

export const invoiceRouter = Router();

invoiceRouter.use(authMiddleware);

invoiceRouter.post('/create', upload.single('audio'), asyncHandler(invoiceController.createVoice));
invoiceRouter.post('/voice', upload.single('audio'), asyncHandler(invoiceController.createVoice));
invoiceRouter.post('/manual', asyncHandler(invoiceController.createManual));
invoiceRouter.get('/', asyncHandler(invoiceController.getAll));
invoiceRouter.get('/latest/pdfs', asyncHandler(invoiceController.getLatestPdfs));
invoiceRouter.get('/:id/preview', asyncHandler(invoiceController.previewById));
invoiceRouter.get('/:id', asyncHandler(invoiceController.getById));
invoiceRouter.put('/:id', asyncHandler(invoiceController.updateById));
invoiceRouter.delete('/:id', asyncHandler(invoiceController.deleteById));
