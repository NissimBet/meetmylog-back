import { Request, Response, NextFunction } from 'express';
import { validateToken } from '../utils';

export async function AuthenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization;
    if (!validateToken(token)) {
      res.statusMessage = 'User unauthenticated';
      return res.status(401).send();
    }
    next();
  } catch (error) {
    res.sendStatus(500);
  }
}
