import {Router} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {adminMiddleware, requireSuperAdmin} from '../../middleware/admin.middleware';
import {asyncHandler} from '../../common/asyncHandler';
import {planController} from './plan.controller';

export const planRouter = Router();

// Public / auth user routes
planRouter.get('/', authMiddleware, asyncHandler(planController.list));

// Admin only routes
planRouter.use(authMiddleware, adminMiddleware, requireSuperAdmin);
planRouter.get('/admin', asyncHandler(planController.listAdmin));
planRouter.post('/', asyncHandler(planController.create));
planRouter.put('/:id', asyncHandler(planController.update));
planRouter.delete('/:id', asyncHandler(planController.delete));
