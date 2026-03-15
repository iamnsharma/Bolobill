import {Request, Response} from 'express';
import {asyncHandler} from '../../common/asyncHandler';
import {planService} from './plan.service';

export const planController = {
  // Public or user-facing list
  list: asyncHandler(async (req: Request, res: Response) => {
    const plans = await planService.list();
    return res.json({plans});
  }),

  // Admin list
  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const plans = await planService.listAllAdmin();
    return res.json({plans});
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const plan = await planService.create(req.body);
    return res.status(201).json({plan});
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    // support both array or string logic because frontend sometimes sends arrays
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const plan = await planService.update(id as string, req.body);
    return res.json({plan});
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await planService.delete(id as string);
    return res.json({message: 'Plan deleted or deactivated'});
  }),
};
