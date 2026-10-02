import { Router } from 'express';
import { asyncHandler } from '../../common/asyncHandler';
import { publicBillService } from './publicBill.service';

export const publicBillRouter = Router();

publicBillRouter.get(
  '/bills/:token',
  asyncHandler(async (req, res) => {
    const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;
    const bill = await publicBillService.getByToken(token);
    return res.json(bill);
  }),
);
