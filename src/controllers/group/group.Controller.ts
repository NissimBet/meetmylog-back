import { Response, Request } from 'express';
import { GroupModel, UserModel } from './../../models';
import { CreateGroup } from './../../models/group/Group.types';

export class GroupController {
  async createGroup(req: Request, res: Response) {
    try {
      const { creator, members, name } = <CreateGroup>req.body;

      if (!(creator && name && members)) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const group = await GroupModel.create({ creator, members, name });

      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async getGroup(req: Request, res: Response) {
    try {
      const { groupId } = req.params;

      const group = await GroupModel.get(groupId);

      if (!group) {
        res.statusMessage = 'group not found';
        return res.status(404).send();
      }

      return res.status(200).json(group);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async addMember(req: Request, res: Response) {
    try {
      const { memberId } = req.body;

      const user = UserModel.checkExistence({ userId: memberId });

      if (!user) {
        res.statusMessage = 'User non existant';
        return res.status(404).send();
      }
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
}
