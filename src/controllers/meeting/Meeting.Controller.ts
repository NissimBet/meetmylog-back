import { Request, Response } from 'express';
import { MeetingModel } from '../../models';
import {
  CreateMeeting,
  UpdateMeeting,
  MeetingData,
  Chat,
} from '../../models/meeting/Meeting.types';

export class MeetingController {
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const meeting = await MeetingModel.findOne(id);

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

      if (
        !(meetingData.creator && meetingData.meetingName && meetingData.members)
      ) {
        res.statusMessage = 'Missing Parameters';
        return res.status(406).send();
      }

      MeetingModel.create(meetingData);
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  }
  async addChat(req: Request, res: Response) {
    try {
      // this shouldd verify user in meeting for chat
      const { from, message, meetingId } = req.body;
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
