import { Request, Response } from 'express';
import { UserModel } from '../../models';
import { FindUser, CreateUser } from './../../models/UserModel/User';

import { encryptMessage, createToken } from './../../utils';

export class UserController {
  async login(req: Request, res: Response) {
    try {
      const { password, username } = <FindUser>req.body;

      if (!username || !password) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const encryptedPass = await encryptMessage(password);

      const user = await UserModel.findOne({
        username,
        password: encryptedPass,
      });

      const { email, userId } = user;

      const token = createToken({ email, userId, username });

      if (user) {
        return res.status(200).json({ email, userId, username, token });
      }

      res.statusMessage = 'Username or password incorrect';
      return res.status(404).send();
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }

  async getUser(req: Request, res: Response) {
    // do some stuff
    res.status(200).send('This is you');
  }

  async register(req: Request, res: Response) {
    try {
      const { username, email, password, name } = <CreateUser>req.body;

      if (!(username && email && password && name)) {
        res.statusMessage = 'Missing parameters';
        return res.status(206).send();
      }

      const encryptedPass = await encryptMessage(password);

      const userData = <CreateUser>{
        email,
        name,
        password: encryptedPass,
        username,
      };

      const userExists = await UserModel.checkExistence(username);

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
