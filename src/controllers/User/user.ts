import { Request, Response } from 'express';

export class UserController {
  async login(req: Request, res: Response) {
    // do some stuff
    res.status(201).send('Welcome user');
  }

  async getUser(req: Request, res: Response) {
    // do some stuff
    res.status(200).send('This is you');
  }
}
