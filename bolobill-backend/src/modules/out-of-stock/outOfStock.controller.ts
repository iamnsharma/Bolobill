import {Request, Response} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {ApiError} from '../../common/ApiError';
import {outOfStockService} from './outOfStock.service';

const getUserId = (req: Request) => {
  if (!req.user?.userId) throw new ApiError(401, 'Unauthorized');
  return req.user.userId;
};

export const outOfStockController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const items = await outOfStockService.list(userId);
    return res.json({items});
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const name = typeof req.body?.name === 'string' ? req.body.name : '';
    if (!name.trim()) throw new ApiError(400, 'name is required');
    const item = await outOfStockService.create(userId, {
      name,
      quantity: req.body?.quantity,
      note: req.body?.note,
    });
    return res.status(201).json({item});
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await outOfStockService.getById(userId, id);
    return res.json({item});
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const item = await outOfStockService.update(userId, id, {
      name: req.body?.name,
      quantity: req.body?.quantity,
      note: req.body?.note,
    });
    return res.json({item});
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await outOfStockService.delete(userId, id);
    return res.json({message: 'Deleted'});
  }),
};
