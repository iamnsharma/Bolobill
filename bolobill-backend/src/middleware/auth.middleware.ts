import {NextFunction, Request, Response} from 'express';
import {ApiError} from '../common/ApiError';
import {verifyAuthToken} from '../common/jwt';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : undefined;

  if (!token) {
    return next(new ApiError(401, 'Unauthorized: missing token'));
  }

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch (_error) {
    return next(new ApiError(401, 'Unauthorized: invalid token'));
  }
};
