import {Router} from 'express';
import {authMiddleware} from '../../middleware/auth.middleware';
import {asyncHandler} from '../../common/asyncHandler';
import {outOfStockController} from './outOfStock.controller';

export const outOfStockRouter = Router();

outOfStockRouter.use(authMiddleware);

outOfStockRouter.get('/', asyncHandler(outOfStockController.list));
outOfStockRouter.post('/', asyncHandler(outOfStockController.create));
outOfStockRouter.get('/:id', asyncHandler(outOfStockController.getById));
outOfStockRouter.put('/:id', asyncHandler(outOfStockController.update));
outOfStockRouter.delete('/:id', asyncHandler(outOfStockController.delete));
