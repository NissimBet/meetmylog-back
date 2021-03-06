import { UserData } from './../../models/user/User.types';
import { Request, Response } from 'express';
import { MeetingModel, UserModel, GroupModel } from '../../models';
import { CreateMeeting, Chat, Notes } from '../../models/meeting/Meeting.types';
import { extractToken, validateToken } from './../../utils';
import { GroupData } from '../../models/group/Group.types';

export class MeetingController {
  /**
   * buscar un meeting con su identificador
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // validar token de autenticacion
      const token = req.headers.authorization;
      // extraer los datos del token
      const tokenData = extractToken(token);
      // buscar el meeting
      const meeting = await MeetingModel.findOne(id);

      // okay, me mame
      // tons
      // - si el meeting no es publico
      // - si el usuario no es parte del meeting
      // no darle acceso
      if (
        !(
          // si el meeting no esta
          (
            meeting &&
            // o si el usuario no es parte del meeting
            (meeting?.members.some(
              (meeting) =>
                ((meeting as unknown) as UserData).userId === tokenData?.userId
            ) ||
              // o si el usuario no es el creador
              tokenData?.userId ===
                ((meeting.creator as unknown) as UserData).userId ||
              // o si no es publico el meeting
              meeting?.isPublic)
          )
        )
      ) {
        res.statusMessage = 'User Forbidden';
        return res.status(403).send();
      }

      // si no esta el meeting, error
      if (!meeting) {
        res.statusMessage = 'Meeting with id not found';
        return res.status(409).send();
      }

      return res.status(200).json(meeting);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * regresa los meetings en los que participo el usuario
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async getOfUser(req: Request, res: Response) {
    try {
      const { id } = req.query;

      // si no esta el id, error
      if (!id) {
        res.statusMessage = 'Missing id of user';
        res.status(406).send();
      }

      // regresar el id del usuario, las busquedas de referencia son por el id interno de mongo
      const user = await UserModel.getData({ userId: id });

      if (!user) {
        res.statusMessage = 'User not found';
        return res.status(404).send();
      }

      const meetings = await MeetingModel.findOfUser(user._id);

      return res.status(200).json(meetings);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * regresa los meetings en los que participo un equipo
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async getOfTeam(req: Request, res: Response) {
    try {
      const { id } = req.query;

      // si no esta el id, error
      if (!id) {
        res.statusMessage = 'Missing id of team';
        res.status(406).send();
      }

      // regresar el id del usuario, las busquedas de referencia son por el id interno de mongo
      const group = await GroupModel.get(id);

      if (!group) {
        res.statusMessage = 'Group not found';
        return res.status(404).send();
      }

      const meetings = await MeetingModel.findOfTeam(group._id);

      return res.status(200).json(meetings);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }

  /**
   * crear un meeting
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async create(req: Request, res: Response) {
    try {
      const { creator, members, meetingName, groupId } = <CreateMeeting>(
        req.body
      );

      // si no hay los datos, error
      if (!(creator && meetingName && members)) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      // buscar el usuario
      const user = await UserModel.getData({ userId: creator });

      if (!user) {
        res.statusMessage = 'User non existant';
        return res.status(404).send();
      }

      // conseguir los ids de los usuarios, hay que hacer un query para cada uno, o se puede mandar el _id directamente
      // (hay que modificar el front para eso) => pense en hacerlo me dio hueva
      const meetingUsers = (
        await Promise.all(
          members
            // filtrar solo los unicos
            .filter((val, index, self) => self.indexOf(val) === index)
            // hacer la busqueda del usuario
            .map(async (member) => await UserModel.getData({ userId: member }))
        )
      ).map((data) => data._id);
      // ^ regresar el _id

      if (groupId !== '0') {
        const group = await GroupModel.get(groupId);
        const newMeeting = await MeetingModel.create({
          creator: user._id,
          meetingName,
          members: meetingUsers,
          groupId: group._id,
        });
        return res.status(201).json(newMeeting);
      } else {
        const newMeeting = await MeetingModel.create({
          creator: user._id,
          meetingName,
          members: meetingUsers,
        });
        return res.status(201).json(newMeeting);
      }
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * agregar un mensaje de chat con su identificador
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async addChat(req: Request, res: Response) {
    try {
      const { from, message } = req.body;
      const { id: meetingId } = req.params;

      // buscar datos del usuario
      const user = await UserModel.getData({ userId: from });

      // si no esta el usuario, mandar error (solo para mamar, no deberia pasar)
      if (!user) {
        res.statusMessage = 'User does not exist';
        return res.status(404).send();
      }

      const chat: Chat = {
        from: String(user._id),
        message: String(message),
        timeSent: new Date(),
      };

      // agregar el chat al meeting
      const updateData = await MeetingModel.updateChat(meetingId, chat);

      return res.status(200).json(updateData.chat[updateData.chat.length - 1]);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * agregar una responsabilidad con su identificador
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async addResponsability(req: Request, res: Response) {
    try {
      const { userId, responsability } = req.body;
      const { id: meetingId } = req.params;

      const respons: any = {
        member: String(userId),
        responsability: String(responsability),
      };

      // agregar el chat al meeting
      const updateData = await MeetingModel.addResponsability(
        meetingId,
        respons
      );

      return res
        .status(200)
        .json(
          updateData.responsabilities[updateData.responsabilities.length - 1]
        );
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * quita una responsabilidad de la junta
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async removeResponsibility(req: Request, res: Response) {
    try {
      const { rId } = req.body;
      const { id: meetingId } = req.params;

      console.log(meetingId);

      // si no esta el id del miembro, error
      if (!meetingId) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }
      // agregar el usuario al grupo
      MeetingModel.removeResponsability(meetingId, rId);

      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  /**
   * actualiza las notas de un usuario
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async updateNotes(req: Request, res: Response) {
    try {
      const { member, notes } = req.body;
      const { id: meetingId } = req.params;

      // buscar datos del usuario
      const user = await UserModel.getData({ userId: member });

      // si no esta el usuario, mandar error (solo para mamar, no deberia pasar)
      if (!user) {
        res.statusMessage = 'User does not exist';
        return res.status(404).send();
      }

      const note: Notes = {
        member: String(user._id),
        notes: String(notes),
      };
      console.log(note);

      // agregar el chat al meeting
      const updateData = await MeetingModel.updateNotes(meetingId, note);

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }

  /**
   * agregar un mensaje de chat con su identificador
   * @param req request, tiene los datos de la llamada a la ruta
   * @param res response, tiene las funciones para resolver la llamada
   */
  async closeMeeting(req: Request, res: Response) {
    try {
      const { id: meetingId } = req.params;

      // asegurar meeting existente
      const openMeeting = await MeetingModel.findOne(meetingId);
      if (!openMeeting) {
        res.statusMessage = 'Reunion no encontrada';
        return res.sendStatus(404);
      }

      await MeetingModel.closeMeeting(meetingId);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  }
}
