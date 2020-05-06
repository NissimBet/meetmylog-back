import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateMeeting, MeetingData, Chat } from './Meeting.types';
import { extractProperties } from '../../utils';

// que mongoose use las promsas globales internamente
mongoose.Promise = global.Promise;

// el esquema de un meeting
const MeetingSchema = new Schema({
  // id externo a mongo, creado aleatoria y dinamicamente
  meetingId: { type: String, default: () => uuidv4() },
  meetingName: { type: String },
  startedDate: { type: Date, default: () => new Date() },
  finishedDate: { type: Date, default: () => new Date() },
  ongoing: { type: Boolean, default: () => true },
  creator: { type: Schema.Types.ObjectId, ref: 'users' },
  chat: [
    {
      from: { type: Schema.Types.ObjectId, ref: 'users' },
      timeSent: { type: Date, default: () => new Date() },
      message: String,
    },
  ],
  members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  isPublic: { type: Boolean, default: () => false },
});

interface MeetingModelData extends MeetingData, mongoose.Document {}

const Meeting = mongoose.model<MeetingModelData>('meetings', MeetingSchema);

// objeto con lo metodos de manejo del modelo de usuario
export const MeetingModel = {
  /**
   * crea una entrada de un meeting en la base de datos
   * @param meetingData datos necesarios para crear un meeting
   */
  async create(meetingData: CreateMeeting): Promise<MeetingData> {
    try {
      const createdMeeting = await Meeting.create(meetingData);

      return createdMeeting;
    } catch (error) {
      console.log(`Error creating meeting for ${meetingData.creator}`, error);
      throw Error(error);
    }
  },
  /**
   * buscar los datos de un meeting. regresa los datos publicos.
   * @param meetingId identificador del meeting que se quiere buscar
   */
  async findOne(meetingId: string) {
    try {
      // buscar un meeting y popular las referencias, solo con las propiedades especificadas
      const meeting = await Meeting.findOne({ meetingId })
        .populate('creator', 'userId username name')
        .populate('members', 'userId username name')
        .populate('chat.from', 'userId username name');
      return extractPublicProperties(meeting);
    } catch (error) {
      console.log(`Error finding ${meetingId}`, error);
      throw Error(error);
    }
  },
  /**
   * buscar los meetings en los que un usuario ha participado
   * @param user_id identificador del usuario
   */
  async findOfUser(user_id: string) {
    try {
      const meetings = await Meeting.find({
        $or: [
          { creator: user_id },
          { members: { $elemMatch: { $eq: user_id } } },
        ],
      });

      return meetings.map((meeting) => extractPublicProperties(meeting));
    } catch (error) {
      console.log(`Error finding meetings for user ${user_id}`, error);
      throw Error(error);
    }
  },
  /**
   * agregar un mensaje de chat al meeting
   * @param meetingId identificador del meeting que se quiere agregar un mensaje de chat
   * @param chat datos del chat
   */
  async updateChat(meetingId: string, chat: Chat) {
    try {
      // modificar un meeting y agregar el mensaje de chat
      const meeting = await Meeting.findOneAndUpdate(
        { meetingId },
        { $push: { chat: chat } },
        // regresar el nuevo objeto
        { new: true }
      ).populate('chat.from', 'userId username name');

      return extractPublicProperties(meeting);
    } catch (error) {
      console.log(`Error updating chat for ${meetingId}`, error);
      throw Error(error);
    }
  },
  async closeMeeting(meetingId: string): Promise<boolean> {
    try {
      await Meeting.findOneAndUpdate(
        { meetingId: meetingId },
        { ongoing: false, finishedDate: new Date() }
      );
      return true;
    } catch (error) {
      console.log(`Error setting meeting status to closed ${meetingId}`, error);
      throw Error(error);
    }
  },
};

/**
 * extraer los datos publicos del meeting
 * @param meeting instancia del meeting al cual se quiere copiar
 */
export function extractPublicProperties(meeting: MeetingModelData) {
  if (meeting === null) return meeting;
  return extractProperties(meeting, [
    'meetingId',
    'meetingName',
    'startedDate',
    'finishedDate',
    'ongoing',
    'creator',
    'chat',
    'members',
    '_id',
    'isPublic',
  ]);
}
