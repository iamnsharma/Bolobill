import {Request, Response, Router} from 'express';
import type {NextFunction} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware} from '../../middleware/admin.middleware';
import {asyncHandler} from '../../common/asyncHandler';
import {adminController} from './admin.controller';

export const adminRouter = Router();

// Health check (no auth) – so we can verify /api/admin is mounted
adminRouter.get('/', (_req, res) => {
  res.json({ok: true, scope: 'admin'});
});

// All routes below require auth + admin role
adminRouter.use((req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, next);
  return Promise.resolve();
});
adminRouter.use((req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(adminMiddleware(req, res, next)),
);

// Fixed paths first (so /invoices, /users, /stats are not captured by :id)
adminRouter.get('/stats', asyncHandler(adminController.getStats));
adminRouter.get('/invoices', asyncHandler(adminController.listInvoices));
adminRouter.get('/users', asyncHandler(adminController.listUsers));

// Parameterized routes
adminRouter.get('/users/:id', asyncHandler(adminController.getUserById));
adminRouter.patch('/users/:id/blacklist', asyncHandler(adminController.setBlacklist));
