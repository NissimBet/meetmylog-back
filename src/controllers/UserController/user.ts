import { Request, Response } from 'express';
import { UserModel } from '../../models';

export class UserController {
  async login(req: Request, res: Response) {
    // do some stuff
    res.status(201).send('Welcome user');
  }

  async getUser(req: Request, res: Response) {
    // do some stuff
    res.status(200).send('This is you');
  }

  async register(req: Request, res: Response) {
    const { username, email, password } = req.body;
    const user = await UserModel.create({ username, email, password });
  }
}
