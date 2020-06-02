import { Response, Request } from 'express';
import { GroupModel, UserModel } from '../../models';
import { CreateGroup } from '../../models/group/Group.types';
import { validateToken } from '../../utils';

export class GroupController {
  /**
   * crear un grupo
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async createGroup(req: Request, res: Response) {
    try {
      const { creator, members, name } = <CreateGroup>req.body;

      // validar informacion del request
      if (!(creator && name && members)) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      // extraer los usuarios unicos
      const uniqueMembers = members.filter(
        (val, index, self) => self.indexOf(val) === index
      );
      const userC = await UserModel.getData({ userId: creator });
      if (!userC) {
        res.statusMessage = 'User does not exist';
        return res.status(404).send();
      }
      uniqueMembers.splice(0, 0, userC._id);
      // crear el grupo con los datos
      const group = await GroupModel.create({
        creator: userC._id,
        members: uniqueMembers,
        name,
      });

      return res.status(201).json(group);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * buscar datos de un grupo
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async getGroup(req: Request, res: Response) {
    try {
      const { id: groupId } = req.params;

      // buscar grupo
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
  /**
   * regresar grupos de un usuario
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async getGroups(req: Request, res: Response) {
    try {
      const { id } = req.query;

      if (!id) {
        res.statusMessage = 'Missing id of user';
        res.status(406).send();
      }

      // buscar _id del usuario
      const user = await UserModel.getData({ userId: id });
      if (!user) {
        res.statusMessage = 'User does not exist';
        return res.status(404).send();
      }

      // buscar grupos del usuario
      const groups = await GroupModel.getManyOfUser(user._id);

      return res.status(200).json(groups);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * agregar un miembto al grupo
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async addMember(req: Request, res: Response) {
    try {
      const { members } = req.body;
      const { id: groupId } = req.params;

      // si no esta el id del miembro, error
      if (!members) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }
      // agregar el usuario al grupo
      GroupModel.pushMember(groupId, members);

      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * quita un miembto al grupo
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async removeMember(req: Request, res: Response) {
    try {
      const { member } = req.body;
      const { id: groupId } = req.params;

      console.log(member);

      // si no esta el id del miembro, error
      if (!member) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }
      // agregar el usuario al grupo
      GroupModel.popMember(groupId, member);

      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
}
