import {NextFunction, Request, Response} from 'express';
import {ApiError} from '../common/ApiError';
import {UserModel} from '../models/User.model';

export type AdminContext = {
  isSuperAdmin: boolean;
  userId: string;
};

/** Must run after authMiddleware. Allows superadmin (project owner) or business admin (shopkeeper). */
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
  if (!user) {
    return next(new ApiError(401, 'User not found'));
  }

  const isSuperAdmin = user.role === 'superadmin';
  const isBusinessAdmin =
    user.accountType === 'business' || user.role === 'admin';

  if (!isSuperAdmin && !isBusinessAdmin) {
    return next(new ApiError(403, 'Forbidden: admin or business access required'));
  }

  (req as Request & { adminContext: AdminContext }).adminContext = {
    isSuperAdmin,
    userId: user._id.toString(),
  };
  return next();
};

/** Use after adminMiddleware. Restricts to superadmin only (e.g. users list, blacklist). */
export const requireSuperAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const ctx = (req as Request & { adminContext?: AdminContext }).adminContext;
  if (!ctx?.isSuperAdmin) {
    return next(new ApiError(403, 'Forbidden: superadmin only'));
  }
  return next();
};
