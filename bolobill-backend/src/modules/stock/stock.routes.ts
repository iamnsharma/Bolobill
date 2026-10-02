import path from 'path';
import fs from 'fs';
import multer from 'multer';
import {v4 as uuidv4} from 'uuid';
import {Router} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware} from '../../middleware/admin.middleware';
import {stockController} from './stock.controller';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {recursive: true});
}

const mimeExt: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/m4a': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/mp4': '.mp4',
  'audio/mpeg': '.mp3',
  'audio/wav': '.wav',
  'audio/ogg': '.ogg',
  'audio/flac': '.flac',
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

export const stockRouter = Router();

stockRouter.use(authMiddleware, adminMiddleware);

stockRouter.get('/summary', stockController.getSummary);
stockRouter.get('/categories', stockController.listCategories);
stockRouter.post('/categories', stockController.createCategory);
stockRouter.put('/categories/:id', stockController.updateCategory);
stockRouter.delete('/categories/:id', stockController.deleteCategory);

stockRouter.get('/products', stockController.listProducts);
stockRouter.post('/products', stockController.createProduct);
stockRouter.post('/products/bulk', stockController.bulkCreateProducts);
stockRouter.post('/products/voice', upload.single('audio'), stockController.intakeFromVoice);
stockRouter.post('/products/adjust', stockController.adjustProduct);
stockRouter.put('/products/:id', stockController.updateProduct);
stockRouter.delete('/products/:id', stockController.deleteProduct);
