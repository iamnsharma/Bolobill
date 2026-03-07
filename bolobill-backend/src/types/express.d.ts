import {JwtPayload} from 'jsonwebtoken';

export type AuthUserPayload = JwtPayload & {
  userId: string;
  phone: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
