import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pick from 'lodash.pick';

import { SECRET } from './config';

const SaltingRounds = 10;

export async function encryptMessage(message: string): Promise<string> {
  return await bcrypt.hash(message, SaltingRounds);
}

export async function compareHash(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash, (err, same) => same);
}

export interface TokenData {
  username: string;
  email: string;
  userId: string;
}

export function createToken(data: TokenData): string {
  const token = jwt.sign(data, SECRET, {
    expiresIn: 60 * 60 * 3,
  });
  return token;
}

export function validateToken(token: string = ''): boolean {
  let wasDecoded = false;
  jwt.verify(
    extractBearer(token),
    SECRET,
    (_, decoded) => (wasDecoded = !!decoded)
  );
  return wasDecoded;
}

export function extractToken(token: string = ''): TokenData {
  let data: TokenData = null;
  jwt.verify(
    extractBearer(token),
    SECRET,
    (_, decoded) => (data = <TokenData>decoded)
  );
  return data;
}

export function extractBearer(token: string): string {
  return token.replace('Bearer ', '');
}

export function extractProperties<T, K extends keyof T>(
  obj: T,
  keys: Array<K>
): Pick<T, K> {
  const ret: any = {};
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}
