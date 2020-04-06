import { Request, Response } from 'express';
import { MeetingModel } from '../../models';
import {
  CreateMeeting,
  UpdateMeeting,
  MeetingData,
  Chat,
} from '../../models/meeting/Meeting.types';
import { validateToken } from './../../utils';

export class MeetingController {
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const meeting = await MeetingModel.findOne(id);

      // TODO: authenticate user

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
      const meetingData = <CreateMeeting>req.body;

      // TODO: authernticate user

      if (
        !(meetingData.creator && meetingData.meetingName && meetingData.members)
      ) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      const newMeeting = await MeetingModel.create(meetingData);

      return res.status(201).json(newMeeting);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async addChat(req: Request, res: Response) {
    try {
      // this shouldd verify user in meeting for chat
      const { from, message } = req.body;
      const { id: meetingId } = req.params;

      // verify token user === from user

      const token = req.headers.authorization;
      const isValid = validateToken(token);

      if (!isValid) {
        res.statusMessage = 'User not authorized';
        return res.status(401).send();
      }

      const chat: Chat = {
        from: String(from),
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
