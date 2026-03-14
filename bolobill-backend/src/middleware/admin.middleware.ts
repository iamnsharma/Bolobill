import {NextFunction, Request, Response} from 'express';
import {ApiError} from '../common/ApiError';
import {UserModel} from '../models/User.model';

/** Must run after authMiddleware. Ensures req.user.userId is an admin. */
export const adminMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.userId;
  if (!userId) {
    return next(new ApiError(401, 'Unauthorized'));
  }

  const user = await UserModel.findById(userId);
  if (!user || user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: admin only'));
  }

  return next();
};
