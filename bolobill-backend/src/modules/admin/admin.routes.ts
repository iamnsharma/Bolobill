import {Request, Response, Router} from 'express';
import type {NextFunction} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware} from '../../middleware/admin.middleware';
import {asyncHandler} from '../../common/asyncHandler';
import {adminController} from './admin.controller';

export const adminRouter = Router();

adminRouter.use((req: Request, res: Response, next: NextFunction) => {
  authMiddleware(req, res, next);
  return Promise.resolve();
});
adminRouter.use((req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(adminMiddleware(req, res, next)),
);

adminRouter.get('/users', asyncHandler(adminController.listUsers));
adminRouter.get('/users/:id', asyncHandler(adminController.getUserById));
adminRouter.patch('/users/:id/blacklist', asyncHandler(adminController.setBlacklist));

adminRouter.get('/invoices', asyncHandler(adminController.listInvoices));
