import { Response, Request } from 'express';
import { GroupModel, UserModel } from '../../models';
import { CreateGroup } from '../../models/group/Group.types';
import { validateToken } from '../../utils';

export class GroupController {
  async createGroup(req: Request, res: Response) {
    try {
      const { creator, members, name } = <CreateGroup>req.body;

      const token = req.headers.authorization;
      if (validateToken(token)) {
        res.statusMessage = 'User unauthenticated';
        return res.status(401).send();
      }

      if (!(creator && name && members)) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const uniqueMembers = members.filter(
        (val, index, self) => self.indexOf(val) === index
      );

      const group = await GroupModel.create({
        creator,
        members: uniqueMembers,
        name,
      });

      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async getGroup(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params;

      const token = req.headers.authorization;
      if (validateToken(token)) {
        res.statusMessage = 'User unauthenticated';
        return res.status(401).send();
      }

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
      const { id: groupId } = req.params;

      const token = req.headers.authorization;
      if (validateToken(token)) {
        res.statusMessage = 'User unauthenticated';
        return res.status(401).send();
      }

      if (!memberId) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const userExists = await UserModel.checkExistence({ userId: memberId });

      if (!userExists) {
        res.statusMessage = 'User non existant';
        return res.status(404).send();
      }

      GroupModel.pushMember(groupId, memberId);

      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
}
