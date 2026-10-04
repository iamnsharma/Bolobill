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

const imageMimeExt: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const menuImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {fileSize: 10 * 1024 * 1024},
  fileFilter: (_req, file, cb) => {
    const mime = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
    const ok =
      mime.startsWith('image/') ||
      mime === 'application/octet-stream' ||
      Boolean(imageMimeExt[mime]);
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Please upload an image file (JPEG, PNG, WebP, or HEIC)'));
    }
  },
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
stockRouter.post(
  '/products/menu-import/analyze',
  menuImageUpload.single('image'),
  stockController.analyzeMenuImport,
);
stockRouter.post('/products/menu-import/match', stockController.matchMenuImport);
stockRouter.post('/products/menu-import/commit', stockController.commitMenuImport);
stockRouter.post('/products/adjust', stockController.adjustProduct);
stockRouter.put('/products/:id', stockController.updateProduct);
stockRouter.delete('/products/:id', stockController.deleteProduct);
