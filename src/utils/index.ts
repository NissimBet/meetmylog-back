import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SECRET } from './config';

const SaltingRounds = 10;

export async function encryptMessage(message: string): Promise<string> {
  const encryptedMessage = await bcrypt.hash(message, SaltingRounds);
  return encryptedMessage;
}

export async function compareHash(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plaintext, hash);
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

export function validateToken(token: string): boolean {
  let wasDecoded = false;
  jwt.verify(token, SECRET, (_, decoded) => (wasDecoded = !!decoded));
  return wasDecoded;
}

export function extractToken(token: string): TokenData {
  let data: TokenData;
  jwt.verify(token, SECRET, (_, decoded) => (data = <TokenData>decoded));
  return data;
}
