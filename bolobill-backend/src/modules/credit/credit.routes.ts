import {Router} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware} from '../../middleware/admin.middleware';
import {creditController} from './credit.controller';

export const creditRouter = Router();

creditRouter.use(authMiddleware, adminMiddleware);

creditRouter.get('/', creditController.list);
creditRouter.get('/:phone', creditController.detail);
creditRouter.post('/:phone/payments', creditController.recordPayment);
