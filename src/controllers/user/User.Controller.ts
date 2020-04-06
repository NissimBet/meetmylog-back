import { Request, Response } from 'express';
import { UserModel } from '../../models';
import { FindUser, CreateUser } from '../../models/user/User.types';

import {
  encryptMessage,
  createToken,
  validateToken,
  extractToken,
} from '../../utils';

export class UserController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = <FindUser>req.body;

      if (!email || !password) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const encryptedPass = await encryptMessage(password);

      const user = await UserModel.findOne({
        email,
        password: encryptedPass,
      });

      if (!user) {
        res.statusMessage = 'Username or password incorrect';
        return res.status(404).send();
      }

      const { username, userId } = user;

      const token = createToken({ email, userId, username });

      return res.status(200).json({ email, userId, username, token });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }

  async get(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const token = req.headers.authorization;
      const tokenData = extractToken(token);

      if (!tokenData) {
        res.statusMessage = 'User Unauthorized';
        return res.status(403).send();
      }

      const user = await UserModel.getData({ userId });
      if (!user) {
        res.statusMessage = 'User not found';
        return res.status(404).send();
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { username, email, password, name } = <CreateUser>req.body;

      if (!(username && email && password && name)) {
        res.statusMessage = 'Missing parameters';
        return res.status(206).send();
      }

      const encryptedPass = await encryptMessage(password);

      const userData: CreateUser = {
        email,
        name,
        password: encryptedPass,
        username,
      };

      const userExists = await UserModel.checkExistence({ email });

      if (userExists) {
        res.statusMessage = 'Username or email already in use';
        return res.status(409).send();
      }

      const user = await UserModel.create(userData);
      const token = createToken({ email, username, userId: user.userId });

      return res.status(201).json({ ...user, token });
    } catch (error) {
      return res.status(500);
    }
  }
}
