import cors from 'cors';
import path from 'path';
import express from 'express';
import {authRouter} from './modules/auth/auth.routes';
import {feedbackRouter} from './modules/feedback/feedback.routes';
import {invoiceRouter} from './modules/invoice/invoice.routes';
import {errorMiddleware} from './middleware/error.middleware';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ok: true, service: 'bolobill-backend-ts'});
});

app.use('/api/auth', authRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/invoices', invoiceRouter);
// Backward-compatible endpoint with existing mobile code.
app.use('/api/invoice', invoiceRouter);

app.use('/api/files/pdfs', express.static(path.join(process.cwd(), 'storage/pdfs')));

app.use(errorMiddleware);
