import { Request, Response } from 'express';
import { MeetingModel, UserModel } from '../../models';
import { CreateMeeting, Chat } from '../../models/meeting/Meeting.types';
import { extractToken, validateToken } from './../../utils';

export class MeetingController {
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const meeting = await MeetingModel.findOne(id);

      const token = req.headers.authorization;
      if (validateToken(token)) {
        res.statusMessage = 'User unauthenticated';
        return res.status(401).send();
      }

      if (!meeting) {
        res.statusMessage = 'Meeting with id not found';
        res.status(409).send();
      }

      return res.status(200).json(meeting);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async create(req: Request, res: Response) {
    try {
      const { creator, members, meetingName } = <CreateMeeting>req.body;

      const token = req.headers.authorization;
      if (validateToken(token)) {
        res.statusMessage = 'User unauthenticated';
        return res.status(401).send();
      }

      if (!(creator && meetingName && members)) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const user = await UserModel.getData({ userId: creator });

      if (!user) {
        res.statusMessage = 'User non existant';
        return res.status(404).send();
      }

      const meetingUsers = (
        await Promise.all(
          members
            .filter((val, index, self) => self.indexOf(val) === index)
            .map(async (member) => await UserModel.getData({ userId: member }))
        )
      ).map((data) => data._id);

      const newMeeting = await MeetingModel.create({
        creator: user._id,
        meetingName,
        members: meetingUsers,
      });

      return res.status(201).json(newMeeting);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async addChat(req: Request, res: Response) {
    try {
      const { from, message } = req.body;
      const { id: meetingId } = req.params;

      const token = req.headers.authorization;
      const tokenData = extractToken(token);

      if (!tokenData) {
        res.statusMessage = 'User not authorized';
        return res.status(401).send();
      }

      if (tokenData.userId !== String(from)) {
        res.statusMessage = 'User id does not match';
        return res.status(401).send();
      }

      const user = await UserModel.getData({ userId: from });

      if (!user) {
        res.statusMessage = 'User does not exist';
        return res.status(404).send();
      }

      const chat: Chat = {
        from: String(user._id),
        message: String(message),
        timeSent: new Date(),
      };

      await MeetingModel.updateChat(meetingId, chat);

      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
}
