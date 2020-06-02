import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CreateMeeting, MeetingData, Chat, Notes } from './Meeting.types';
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
  responsabilities: [
    {
      member: { type: Schema.Types.ObjectId, ref: 'users' },
      responsability: String,
      require: false,
    },
  ],
  members: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  isPublic: { type: Boolean, default: () => false },
  groupId: { type: Schema.Types.ObjectId, ref: 'groups', require: false },
  notes: [
    {
      member: { type: Schema.Types.ObjectId, ref: 'users' },
      notes: String,
      require: false,
    },
  ],
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
        .populate('chat.from', 'userId username name')
        .populate('responsabilities.member', 'userId username name')
        .populate('notes.member', 'userId username name');
      console.log(extractPublicProperties(meeting));
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
   * buscar los meetings en los que un equipo ha participado
   * @param user_id identificador del usuario
   */
  async findOfTeam(groupId: string) {
    try {
      const meetings = await Meeting.find({
        groupId: groupId,
      });

      return meetings.map((meeting) => extractPublicProperties(meeting));
    } catch (error) {
      console.log(`Error finding meetings for user ${groupId}`, error);
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
  /**
   * agregar una responsabilidad al meeting
   * @param meetingId identificador del meeting que se quiere agregar un mensaje de chat
   * @param responsability datos del chat
   */
  async addResponsability(meetingId: string, responsability: any) {
    try {
      // modificar un meeting y agregar el mensaje de chat
      const meeting = await Meeting.findOneAndUpdate(
        { meetingId },
        { $push: { responsabilities: responsability } },
        // regresar el nuevo objeto
        { new: true }
      ).populate('responsabilities.member', 'userId username name');
      return extractPublicProperties(meeting);
    } catch (error) {
      console.log(`Error updating chat for ${meetingId}`, error);
      throw Error(error);
    }
  },

  /**
   * agregar una responsabilidad al meeting
   * @param meetingId identificador del meeting que se quiere agregar un mensaje de chat
   * @param responsability datos del chat
   */
  async updateNotes(meetingId: string, notes: Notes) {
    try {
      // modificar un meeting y agregar el mensaje de chat
      const meeting = await Meeting.findOne({ meetingId });
      if (meeting.notes.some((e) => e.member == notes.member)) {
        const index = meeting.notes.findIndex(
          (id) => id.member == notes.member
        );
        console.log(index);
        meeting.notes[index].notes = notes.notes;
        await meeting.save();
      } else {
        meeting.notes.push(notes);
        await meeting.save();
      }
      return extractPublicProperties(meeting);
    } catch (error) {
      console.log(`Error updating chat for ${meetingId}`, error);
      throw Error(error);
    }
  },
  /**
   * quita una responsabilidad al meeting
   * @param meetingId identificador del meeting que se quiere agregar un mensaje de chat
   * @param responsability datos del chat
   */
  async removeResponsability(meetingId: string, rId: string) {
    try {
      // modificar un meeting y agregar el mensaje de chat
      const meeting = await Meeting.findOne({ meetingId });
      if (meeting.responsabilities.some((e) => e._id == rId)) {
        const index = meeting.responsabilities.findIndex((id) => id._id == rId);
        console.log(index);
        meeting.responsabilities.splice(index, 1);
        await meeting.save();
      }
      return meeting;
    } catch (error) {
      console.log(`Error, Could not update ${meetingId}`, error);
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
    'responsabilities',
    'notes',
  ]);
}
