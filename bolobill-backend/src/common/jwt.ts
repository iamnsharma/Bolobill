import jwt from 'jsonwebtoken';
import {env} from '../config/env';

type TokenPayload = {
  userId: string;
  phone: string;
};

export const signAuthToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {expiresIn: '30d'});

export const verifyAuthToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload;
