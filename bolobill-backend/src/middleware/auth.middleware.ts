import {NextFunction, Request, Response} from 'express';
import {ApiError} from '../common/ApiError';
import {verifyAuthToken} from '../common/jwt';
import {env} from '../config/env';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!token) {
    if (env.ALLOW_X_USER_ID_AUTH) {
      const headerUserId = req.headers['x-user-id'];
      const userId = Array.isArray(headerUserId) ? headerUserId[0] : headerUserId;
      if (userId?.trim()) {
        req.user = {
          userId: userId.trim(),
          phone: '',
        };
        return next();
      }
    }
    return next(new ApiError(401, 'Unauthorized: missing token'));
  }

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Unauthorized: invalid token'));
  }
};
