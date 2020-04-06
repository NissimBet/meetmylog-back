import mongoose, { Schema } from 'mongoose';
import uuid from 'uuid';
import {
  CreateMeeting,
  UpdateMeeting,
  MeetingData,
  Chat,
} from './Meeting.types';

mongoose.Promise = global.Promise;

const MeetingSchema = new Schema({
  meetingId: { type: String, default: uuid.v4 },
  meetingName: { type: String },
  startedDate: { type: Date, default: () => new Date() },
  finishedDate: { type: Date, default: () => new Date() },
  ongoing: { type: Boolean, default: () => false },
  creator: { type: Schema.Types.ObjectId, ref: 'user' },
  chat: [
    {
      from: { type: Schema.Types.ObjectId, ref: 'user' },
      timeSent: { type: Date, default: () => new Date() },
      message: String,
    },
  ],
  members: [{ type: Schema.Types.ObjectId, ref: 'user' }],

  // unique id generated for link sharing
  sharingId: { type: String },
});

interface MeetingModelData extends MeetingData, mongoose.Document {}

const Meeting = mongoose.model<MeetingModelData>('meetings', MeetingSchema);

export const MeetingModel = {
  async create(meetingData: CreateMeeting): Promise<MeetingData> {
    try {
      const createdMeeting = await Meeting.create(
        meetingData,
        (err: any, newDoc: MeetingModelData) => {
          if (err) throw Error(err);
          return newDoc;
        }
      );

      return createdMeeting;
    } catch (error) {
      console.log(`Error creating meeting for ${meetingData.creator}`, error);
      throw Error(error);
    }
  },
  async update(updateData: UpdateMeeting): Promise<MeetingData> {
    try {
      const meeting = await Meeting.findOneAndUpdate(
        { meetingId: updateData.meetingId },
        { ...updateData },
        (err, doc) => {
          if (err) throw Error(err);
          return doc;
        }
      );

      return meeting;
    } catch (error) {
      console.log(`Error updating ${updateData.meetingId}`, error);
      throw Error(error);
    }
  },
  async findOne(meetingId: string): Promise<MeetingData> {
    try {
      const meeting = await Meeting.findOne(
        { meetingId: meetingId },
        (err, doc) => {
          if (err) throw Error(err);
          return doc;
        }
      );
      return meeting;
    } catch (error) {
      console.log(`Error finding ${meetingId}`, error);
      throw Error(error);
    }
  },
  async updateChat(meetingId: string, chat: Chat) {
    try {
      const meeting = await Meeting.findOneAndUpdate(
        { meetingId },
        { $push: { chat: chat } }
      );

      return meeting;
    } catch (error) {
      console.log(`Error updating chat for ${meetingId}`, error);
      throw Error(error);
    }
  },
};